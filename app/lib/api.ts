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
