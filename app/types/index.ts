export interface IncidentLocation {
  lat: number
  lon: number
}

export interface Incident {
  id: number
  type: string
  location: IncidentLocation
  description: string
  status: string
  timestamp: string
}

export interface Agent {
  id: number
  name: string
  type: string
  icon: string
  status: string
  current_incident: string | null
  decision: string | null
  response_time: number
  efficiency: number
  total_responses: number
  successful_responses: number
  updated_at: string | null
  lat: number
  lon: number
  fuel: number
  stress: number
  role: string
  status_message: string | null
}

export interface Stats {
  total_incidents: number
  active_incidents: number
  resolved_incidents: number
  average_response_time: number
  total_agents: number
  active_agents: number
}

export interface IncidentHistoryEntry {
  id: number
  incident_id: number | null
  agent_id: number | null
  event_type: string
  description: string
  timestamp: string
}

export interface RiskZone {
  id: number
  lat: number
  lon: number
  risk_score: number
  radius: number
  label: string
}

// ── Training Platform ──────────────────────────────────────────────────────────

export interface ScenarioEvent {
  at_seconds: number
  type: string
  lat: number
  lon: number
  description: string
}

export interface Scenario {
  id: number
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  events: ScenarioEvent[]
  is_template: boolean
  created_at: string
}

export interface EventResult {
  event_index: number
  incident_type: string
  expected_type: string
  response_time_ms: number
}

export interface TrainingSession {
  id: number
  scenario_id: number
  scenario_name: string
  trainee_id: string
  trainee_name: string | null
  status: 'active' | 'completed' | 'abandoned'
  score: number
  max_score: number
  correct_dispatches: number
  total_dispatches: number
  avg_response_ms: number
  started_at: string
  completed_at: string | null
  event_results: EventResult[]
}

// ── Incident ───────────────────────────────────────────────────────────────────

export interface CreateIncidentPayload {
  type: string              // "auto" lets AI detect all types from the description
  location: IncidentLocation
  description: string
}

export interface StateUpdate {
  incidents: Incident[]
  agents: Agent[]
  stats: Stats
  history: IncidentHistoryEntry[]
}
