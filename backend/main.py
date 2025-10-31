from fastapi import FastAPI, Depends, HTTPException, Query
from starlette.middleware.cors import CORSMiddleware
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

# Use '_' if you don't use the app parameter (removes warning for unused param)
@asynccontextmanager
async def lifespan(_):
    # Startup logic: create tables and seed agents if needed
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

app.add_middleware(CORSMiddleware,  # type: ignore
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# --------- ENDPOINT: SEARCH ADDRESS ---------
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
    return results

# --------- ENDPOINTS ---------

@app.get("/")
async def root():
    return {"message": "Backend running", "status": "online"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/incidents", response_model=List[IncidentOut])
async def get_incidents(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(IncidentDB))
    rows = result.scalars().all()
    return [
        IncidentOut(
            id=row.id,
            type=row.type,
            location=IncidentLoc(lat=row.lat, lon=row.lon),
            description=row.description,
            status=row.status,
            timestamp=row.timestamp or datetime.now()
        ) for row in rows
    ]

@app.post("/incidents", response_model=IncidentOut)
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
    return IncidentOut(
        id=new_incident.id,
        type=new_incident.type,
        location=IncidentLoc(lat=new_incident.lat, lon=new_incident.lon),
        description=new_incident.description,
        status=new_incident.status,
        timestamp=new_incident.timestamp
    )

@app.put("/incidents/{incident_id}/resolve", response_model=IncidentOut)
async def resolve_incident(incident_id: int, db: AsyncSession = Depends(get_async_session)):
    stmt = select(IncidentDB).where(IncidentDB.id == incident_id)
    result = await db.execute(stmt)
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident.status = "resolved"
    await db.commit()
    await db.refresh(incident)
    return IncidentOut(
        id=incident.id,
        type=incident.type,
        location=IncidentLoc(lat=incident.lat, lon=incident.lon),
        description=incident.description,
        status=incident.status,
        timestamp=incident.timestamp
    )

@app.get("/agents", response_model=List[AgentOut])
async def get_agents(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(AgentDB))
    rows = result.scalars().all()
    return [
        AgentOut(
            id=row.id,
            name=row.name,
            icon=row.icon,
            status=row.status,
            current_incident=row.current_incident,
            decision=row.decision,
            response_time=row.response_time,
            efficiency=row.efficiency,
            total_responses=row.total_responses,
            successful_responses=row.successful_responses,
            updated_at=row.updated_at
        ) for row in rows
    ]

@app.get("/stats", response_model=StatsOut)
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
    return StatsOut(
        total_incidents=total,
        active_incidents=active,
        resolved_incidents=resolved,
        total_agents=t_agents,
        active_agents=a_agents,
        average_response_time=avg_resp,
        average_efficiency=avg_eff
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
