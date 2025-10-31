from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from contextlib import asynccontextmanager
import httpx

from database import (
    get_engine,
    get_session_maker,
    get_async_session,
    Base,
    IncidentDB,
    AgentDB,
)

@asynccontextmanager
async def lifespan(_):
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_maker = get_session_maker()
    async with session_maker() as db:
        agents_count = (await db.execute(select(AgentDB))).scalars().all()
        if not agents_count:
            db.add_all([
                AgentDB(name="Fire Agent", icon="🚒"),
                AgentDB(name="Police Agent", icon="🚓"),
                AgentDB(name="Ambulance Agent", icon="🚑"),
            ])
            await db.commit()
    yield

app = FastAPI(title="Smart City AI Backend", lifespan=lifespan)

## MANUAL CORS OPTIONS AND HEADER HANDLERS

# Options preflight for every route:
@app.options("/incidents", include_in_schema=False)
async def options_incidents(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.options("/agents", include_in_schema=False)
async def options_agents(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.options("/stats", include_in_schema=False)
async def options_stats(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.options("/search-address", include_in_schema=False)
async def options_search_address(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers", "*"),
            "Access-Control-Allow-Credentials": "true"
        }
    )

# --------- SCHEMAS ---------
class IncidentLoc(BaseModel):
    lat: float
    lon: float

class IncidentIn(BaseModel):
    type: str
    location: IncidentLoc
    description: str
    status: Optional[str] = "active"

class IncidentOut(IncidentIn):
    id: int
    timestamp: datetime

class AgentOut(BaseModel):
    id: int
    name: str
    icon: str
    status: str
    current_incident: Optional[str] = None
    decision: Optional[str] = None
    response_time: float
    efficiency: float
    total_responses: int
    successful_responses: int
    updated_at: Optional[datetime]

class StatsOut(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    total_agents: int
    active_agents: int
    average_response_time: float
    average_efficiency: float

# --------- ENDPOINTS WITH MANUAL CORS HEADERS ---------

@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "Backend running", "status": "online"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/health")
async def health():
    return JSONResponse(
        content={"status": "healthy", "timestamp": datetime.now().isoformat()},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/incidents")
async def get_incidents(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(IncidentDB))
    rows = result.scalars().all()
    incidents = [
        {
            "id": row.id,
            "type": row.type,
            "location": {"lat": row.lat, "lon": row.lon},
            "description": row.description,
            "status": row.status,
            "timestamp": row.timestamp or datetime.now()
        }
        for row in rows
    ]
    return JSONResponse(
        content=incidents,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.post("/incidents")
async def create_incident(incident: IncidentIn, db: AsyncSession = Depends(get_async_session)):
    new_incident = IncidentDB(
        type=incident.type,
        lat=incident.location.lat,
        lon=incident.location.lon,
        description=incident.description,
        status=incident.status,
        timestamp=datetime.now()
    )
    db.add(new_incident)
    await db.commit()
    await db.refresh(new_incident)
    result = {
        "id": new_incident.id,
        "type": new_incident.type,
        "location": {"lat": new_incident.lat, "lon": new_incident.lon},
        "description": new_incident.description,
        "status": new_incident.status,
        "timestamp": new_incident.timestamp
    }
    return JSONResponse(
        content=result,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/agents")
async def get_agents(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(AgentDB))
    rows = result.scalars().all()
    agents = [
        {
            "id": row.id,
            "name": row.name,
            "icon": row.icon,
            "status": row.status,
            "current_incident": row.current_incident,
            "decision": row.decision,
            "response_time": row.response_time,
            "efficiency": row.efficiency,
            "total_responses": row.total_responses,
            "successful_responses": row.successful_responses,
            "updated_at": row.updated_at
        }
        for row in rows
    ]
    return JSONResponse(
        content=agents,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_async_session)):
    result_inc = await db.execute(select(IncidentDB))
    incidents = result_inc.scalars().all()
    result_agents = await db.execute(select(AgentDB))
    agents = result_agents.scalars().all()
    total = len(incidents)
    active = len([i for i in incidents if i.status == "active"])
    resolved = len([i for i in incidents if i.status == "resolved"])
    t_agents = len(agents)
    a_agents = len([a for a in agents if a.status == "Responding"])
    avg_resp = sum([a.response_time for a in agents]) / t_agents if t_agents else 0.0
    avg_eff = sum([a.efficiency for a in agents]) / t_agents if t_agents else 0.0
    stats = {
        "total_incidents": total,
        "active_incidents": active,
        "resolved_incidents": resolved,
        "total_agents": t_agents,
        "active_agents": a_agents,
        "average_response_time": avg_resp,
        "average_efficiency": avg_eff
    }
    return JSONResponse(
        content=stats,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

@app.get("/search-address")
async def search_address(query: str = Query(..., min_length=3)):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 5
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers={"User-Agent": "smart-city-backend"})
        resp.raise_for_status()
        data = resp.json()
    results = [{
        "lat": float(item["lat"]),
        "lon": float(item["lon"]),
        "address": item["display_name"]
    } for item in data]
    return JSONResponse(
        content=results,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
