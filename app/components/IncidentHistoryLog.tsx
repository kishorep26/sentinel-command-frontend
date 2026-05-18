'use client'

import { useSentinel } from '@/app/store/sentinel'

export default function IncidentHistoryLog() {
  const history = useSentinel((s) => s.history)

  return (
    <div>
      <h2 className="font-bold text-lg mt-4 mb-2">📝 Incident / Decision History</h2>
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full text-sm border">
          <thead>
            <tr>
              <th className="px-2 border">Time</th>
              <th className="px-2 border">Incident</th>
              <th className="px-2 border">Agent</th>
              <th className="px-2 border">Event</th>
              <th className="px-2 border">Description</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id}>
                <td className="px-2 border">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-2 border">{entry.incident_id ?? '--'}</td>
                <td className="px-2 border">{entry.agent_id ?? '--'}</td>
                <td className="px-2 border">{entry.event_type}</td>
                <td className="px-2 border">{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
