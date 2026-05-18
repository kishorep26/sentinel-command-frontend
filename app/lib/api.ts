import type {
  Agent,
  CreateIncidentPayload,
  EventResult,
  Incident,
  IncidentHistoryEntry,
  RiskZone,
  Scenario,
  Stats,
  TrainingSession,
} from '@/app/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

async function mutateJson<T>(
  method: string,
  path: string,
  body?: unknown,
  authToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  incidents: {
    list: () => fetchJson<Incident[]>('/incidents'),
    create: (payload: CreateIncidentPayload) =>
      mutateJson<Incident[]>('POST', '/incidents', payload),
    resolve: (id: number) =>
      mutateJson<Incident>('PUT', `/incidents/${id}/resolve`),
  },

  agents: {
    list: () => fetchJson<Agent[]>('/agents'),
    assign: (incidentId: number) =>
      mutateJson<unknown>('POST', `/assign-agent?incident_id=${incidentId}`),
  },

  analytics: {
    stats: () => fetchJson<Stats>('/stats'),
    history: () => fetchJson<IncidentHistoryEntry[]>('/incident-history'),
    prediction: () =>
      fetchJson<{ status: string; zones: RiskZone[] }>('/analytics/prediction'),
  },

  admin: {
    reset: () => mutateJson<unknown>('POST', '/reset'),
    searchAddress: (query: string) =>
      fetchJson<Array<{ lat: number; lon: number; address: string }>>(
        `/search-address?query=${encodeURIComponent(query)}`,
      ),
    classifyIncident: (desc: string) =>
      mutateJson<{ category: string; confidence: number }>('POST', '/classify-incident', { desc }),
  },
}

export const training = {
  scenarios: {
    list: () => fetchJson<Scenario[]>('/training/scenarios'),
    get: (id: number) => fetchJson<Scenario>(`/training/scenarios/${id}`),
  },
  sessions: {
    start: (scenarioId: number, traineeName?: string, token?: string) =>
      mutateJson<TrainingSession>('POST', '/training/sessions/start', { scenario_id: scenarioId, trainee_name: traineeName }, token),
    complete: (sessionId: number, eventResults: EventResult[], token?: string) =>
      mutateJson<TrainingSession>('POST', `/training/sessions/${sessionId}/complete`, { event_results: eventResults }, token),
    mine: (token?: string) => fetchJsonAuth<TrainingSession[]>('/training/sessions', token),
    all: (token?: string) => fetchJsonAuth<TrainingSession[]>('/training/instructor/sessions', token),
  },
}

async function fetchJsonAuth<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', headers })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export function getUpdatesSocket(): WebSocket {
  return new WebSocket(API_URL.replace(/^http/, 'ws') + '/ws/updates')
}
