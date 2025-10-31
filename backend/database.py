from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Use Supabase PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/postgres"
)

# For PostgreSQL, ensure SSL is properly configured
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============ DATABASE MODELS ============

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


# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
