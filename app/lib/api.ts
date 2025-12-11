const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getIncidents() {
  const res = await fetch(`${API_URL}/incidents`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function getAgents() {
  const res = await fetch(`${API_URL}/agents`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function createIncident(incident: any) {
  const res = await fetch(`${API_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incident)
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}

export async function assignAgent(incident_id: number) {
  const res = await fetch(`${API_URL}/assign-agent?incident_id=${incident_id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to assign');
  return res.json();
}

export async function getIncidentHistory() {
  const res = await fetch(`${API_URL}/incident-history`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function classifyIncident(desc: string) {
  const res = await fetch(`${API_URL}/classify-incident`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ desc })
  });
  if (!res.ok) throw new Error('Failed to classify');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_URL}/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export function getUpdatesSocket() {
  // Ensure ws:// not http:// for dev/prod, handle secure as well
  return new WebSocket(API_URL.replace(/^http/, 'ws') + '/ws/updates');
}
