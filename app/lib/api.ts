import type {
  Agent,
  CreateIncidentPayload,
  Incident,
  IncidentHistoryEntry,
  RiskZone,
  Stats,
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
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
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

export function getUpdatesSocket(): WebSocket {
  return new WebSocket(API_URL.replace(/^http/, 'ws') + '/ws/updates')
}
