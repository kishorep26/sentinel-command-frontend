import os
import ssl
import logging
from datetime import datetime
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker
)
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/postgres"
)

# --- CONNECTION/POOL SETUP ---
_engine: Optional[object] = None
_session_maker: Optional[async_sessionmaker] = None

def get_engine():
    global _engine, _session_maker

    if _engine is None:
        db_url = DATABASE_URL
        if "sslmode=require" in db_url:
            db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")

        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        _engine = create_async_engine(
            db_url,
            echo=False,
            poolclass=NullPool,
            connect_args={
                "ssl": ssl_context,
                "command_timeout": 60,
                "server_settings": {
                    "application_name": "fastapi_vercel",
                    "tcp_keepalives_idle": "600",
                    "tcp_keepalives_interval": "30",
                    "tcp_keepalives_count": "3",
                },
                "timeout": 10,
            },
            echo_pool=False,
            future=True
        )

        _session_maker = async_sessionmaker(
            _engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )

    return _engine

def get_session_maker():
    get_engine()
    return _session_maker

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    session_maker = get_session_maker()
    session = None
    try:
        session = session_maker()
        yield session
        if session.in_transaction():
            await session.commit()
    except Exception as e:
        if session:
            try:
                await session.rollback()
            except Exception as rollback_error:
                logger.warning(f"Rollback failed: {rollback_error}")
        raise e
    finally:
        if session:
            try:
                await session.close()
            except Exception as close_error:
                logger.warning(f"Session close failed: {close_error}")

# --- MODELS ---
Base = declarative_base()

class IncidentDB(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    description = Column(String)
    status = Column(String, default="active")
    timestamp = Column(DateTime, default=datetime.now, index=True)

class AgentDB(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String)
    status = Column(String, default="Available")
    current_incident = Column(String, nullable=True)
    decision = Column(String, nullable=True)
    response_time = Column(Float, default=0.0)
    efficiency = Column(Float, default=90.0)
    total_responses = Column(Integer, default=0)
    successful_responses = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class ResponseMetricDB(Base):
    __tablename__ = "response_metrics"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, index=True)
    incident_id = Column(Integer, index=True)
    response_time = Column(Float)
    was_successful = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.now, index=True)

# --- DB INIT AND HEALTH ---
async def create_db_and_tables():
    try:
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

async def check_database_health() -> bool:
    try:
        session_maker = get_session_maker()
        async with session_maker() as session:
            await session.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

def reset_engine():
    global _engine, _session_maker
    _engine = None
    _session_maker = None

async def close_db():
    try:
        engine = get_engine()
        if engine:
            await engine.dispose()
    except Exception as e:
        logger.error(f"Error disposing engine: {e}")
