from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from groq import Groq
import os
from dotenv import load_dotenv
import httpx
from sqlalchemy.orm import Session
import random
from contextlib import asynccontextmanager

# Import database
from database import (
    engine,
    get_db,
    Base,
    IncidentDB,
    AgentDB,
    ResponseMetricDB,
    init_db,
    SessionLocal
)

load_dotenv()


# ============ LIFESPAN ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        init_db()
        print("✅ Database tables initialized")

        db = SessionLocal()
        try:
            existing = db.query(AgentDB).count()
            if existing == 0:
                agents = [
                    AgentDB(name="Fire Agent", icon="🚒", status="Available"),
                    AgentDB(name="Police Agent", icon="🚓", status="Available"),
                    AgentDB(name="Ambulance Agent", icon="🚑", status="Available"),
                ]
                db.add_all(agents)
                db.commit()
                print("✅ Default agents created")
            else:
                print(f"✅ Found {existing} existing agents")
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Startup error: {e}")

    yield

    # Shutdown
    print("🛑 Shutting down...")


# ============ APP ============

app = FastAPI(title="Smart City AI Backend", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ============ MODELS ============

class Location(BaseModel):
    lat: float
    lon: float


class Incident(BaseModel):
    id: Optional[int] = None
    type: str
    location: Location
    description: str
    status: str = "active"
    timestamp: Optional[str] = None


class Agent(BaseModel):
    name: str
    icon: str
    status: str
    incident: Optional[str] = None
    decision: str
    responseTime: str
    efficiency: float = 90.0


# ============ HELPERS ============

def calculate_response_time(incident_type: str, base_time: float = 2.0) -> float:
    variation = random.uniform(-0.3, 0.3)
    return max(0.5, base_time + variation)


def calculate_agent_efficiency(agent: AgentDB) -> float:
    if agent.total_responses == 0:
        return 90.0
    success_rate = (agent.successful_responses / agent.total_responses) * 100
    response_time_factor = max(0, 100 - (agent.response_time * 10))
    efficiency = (success_rate * 0.6) + (response_time_factor * 0.4)
    return round(min(100, max(0, efficiency)), 2)


def analyze_incident_with_ai(incident: IncidentDB, agent_type: str) -> str:
    prompts = {
        "fire": f"Fire Agent - Analyze: {incident.type} at {incident.description}. Provide: Severity, Resources, Action plan (50 words max)",
        "police": f"Police Agent - Analyze: {incident.type} at {incident.description}. Provide: Security level, Units, Plan (50 words max)",
        "ambulance": f"EMS Agent - Analyze: {incident.type} at {incident.description}. Provide: Urgency, Resources, Hospital prep (50 words max)"
    }

    prompt = prompts.get(agent_type, prompts["police"])

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.7
        )
        return response.choices[0].message.content
    except:
        return "Analysis in progress..."


# ============ ENDPOINTS ============

@app.get("/")
def root():
    return {"message": "Smart City AI", "status": "online", "database": "Supabase"}


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/search-address")
async def search_address(query: str):
    if not query or len(query) < 3:
        return []
    try:
        async with httpx.AsyncClient() as client_http:
            response = await client_http.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query, "format": "json", "limit": 8},
                headers={"User-Agent": "SmartCityAI/1.0"},
                timeout=10.0
            )
            data = response.json()
            return [{"lat": float(r["lat"]), "lon": float(r["lon"]), "address": r.get("display_name", "Unknown")} for r
                    in data]
    except:
        return []


# ============ INCIDENTS ============

@app.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(IncidentDB).all()
    return [
        {
            "id": i.id,
            "type": i.type,
            "location": {"lat": i.lat, "lon": i.lon},
            "description": i.description,
            "status": i.status,
            "timestamp": i.timestamp.isoformat() if i.timestamp else None
        }
        for i in incidents
    ]


@app.post("/incidents")
def create_incident(incident: Incident, db: Session = Depends(get_db)):
    db_incident = IncidentDB(
        type=incident.type,
        lat=incident.location.lat,
        lon=incident.location.lon,
        description=incident.description,
        status="active"
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    print(f"✅ Incident: {incident.description} (ID: {db_incident.id})")

    try:
        dispatch_result = dispatch_agents(db_incident.id, db)
        return {"incident": db_incident, "dispatch": dispatch_result}
    except Exception as e:
        print(f"⚠️ Error: {e}")
        return {"incident": db_incident}


@app.put("/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Not found")

    incident.status = "resolved"
    agents = db.query(AgentDB).filter(AgentDB.current_incident == incident.description).all()
    for agent in agents:
        agent.status = "Available"
        agent.current_incident = None
        agent.successful_responses += 1
        agent.efficiency = calculate_agent_efficiency(agent)

    db.commit()
    print(f"✅ Resolved: {incident_id}")
    return {"status": "resolved"}


# ============ AGENTS ============

@app.get("/agents")
def get_agents(db: Session = Depends(get_db)):
    agents = db.query(AgentDB).all()
    return [
        {
            "name": a.name,
            "icon": a.icon,
            "status": a.status,
            "incident": a.current_incident,
            "decision": a.decision or "Standby",
            "responseTime": f"{a.response_time:.1f} min",
            "efficiency": a.efficiency
        }
        for a in agents
    ]


# ============ DISPATCH ============

def dispatch_agents(incident_id: int, db: Session):
    incident = db.query(IncidentDB).filter(IncidentDB.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Not found")

    agent_assignments = {
        "fire": ["Fire Agent", "Police Agent"],
        "accident": ["Police Agent", "Ambulance Agent"],
        "medical": ["Ambulance Agent"],
        "crime": ["Police Agent"],
    }

    assigned_agents = agent_assignments.get(incident.type, ["Police Agent"])
    responses = {}

    for agent_name in assigned_agents:
        agent = db.query(AgentDB).filter(AgentDB.name == agent_name).first()
        if agent:
            response_time = calculate_response_time(incident.type)
            ai_decision = analyze_incident_with_ai(incident, agent_name.split()[0].lower())

            agent.status = "Responding"
            agent.current_incident = incident.description
            agent.decision = ai_decision
            agent.response_time = response_time
            agent.total_responses += 1
            agent.efficiency = calculate_agent_efficiency(agent)

            metric = ResponseMetricDB(
                agent_id=agent.id,
                incident_id=incident.id,
                response_time=response_time,
                was_successful=True
            )
            db.add(metric)

            responses[agent_name] = {
                "name": agent.name,
                "icon": agent.icon,
                "status": agent.status,
                "incident": incident.description,
                "decision": ai_decision,
                "response_time": f"{response_time:.2f} min",
                "efficiency": agent.efficiency
            }

    incident.status = "dispatched"
    db.commit()
    print(f"✅ Dispatched: {list(responses.keys())}")
    return {"incident_id": incident_id, "dispatched_agents": responses}


@app.post("/dispatch-agents/{incident_id}")
def dispatch_agents_endpoint(incident_id: int, db: Session = Depends(get_db)):
    return dispatch_agents(incident_id, db)


# ============ STATS ============

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    incidents = db.query(IncidentDB).all()
    agents = db.query(AgentDB).all()

    for agent in agents:
        agent.efficiency = calculate_agent_efficiency(agent)
    db.commit()

    return {
        "total_incidents": len(incidents),
        "active_incidents": len([i for i in incidents if i.status == "active"]),
        "resolved_incidents": len([i for i in incidents if i.status == "resolved"]),
        "total_agents": len(agents),
        "active_agents": len([a for a in agents if a.status == "Responding"]),
        "average_response_time": round(sum(a.response_time for a in agents) / max(len(agents), 1), 2),
        "average_efficiency": round(sum(a.efficiency for a in agents) / max(len(agents), 1), 2)
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
