import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
process.env.NEXT_PUBLIC_API_KEY = 'test-key'

// Mock WebSocket globally before store import
class MockWebSocket {
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: ((e: { code: number }) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  readyState = WebSocket.CONNECTING
  close = vi.fn()
  send = vi.fn()
}
vi.stubGlobal('WebSocket', MockWebSocket)

const { useSentinel } = await import('@/app/store/sentinel')

describe('SentinelStore', () => {
  beforeEach(() => {
    useSentinel.setState({
      incidents: [],
      agents: [],
      stats: { total_incidents: 0, active_incidents: 0, resolved_incidents: 0, average_response_time: 0, total_agents: 0, active_agents: 0 },
      history: [],
      connected: false,
      _ws: null,
      _reconnectTimer: null,
    })
  })

  it('initializes with empty state', () => {
    const state = useSentinel.getState()
    expect(state.incidents).toEqual([])
    expect(state.agents).toEqual([])
    expect(state.connected).toBe(false)
  })

  it('_applyUpdate merges partial updates', () => {
    const store = useSentinel.getState()
    store._applyUpdate({
      incidents: [{ id: 1, type: 'fire', location: { lat: 0, lon: 0 }, description: 'test', status: 'active', timestamp: '' }],
      agents: [],
      stats: { total_incidents: 1, active_incidents: 1, resolved_incidents: 0, average_response_time: 0, total_agents: 0, active_agents: 0 },
      history: [],
    })
    const updated = useSentinel.getState()
    expect(updated.incidents).toHaveLength(1)
    expect(updated.incidents[0].type).toBe('fire')
    expect(updated.stats.total_incidents).toBe(1)
  })

  it('connect creates a WebSocket', () => {
    useSentinel.getState().connect()
    expect(useSentinel.getState()._ws).toBeInstanceOf(MockWebSocket)
  })

  it('disconnect closes WebSocket', () => {
    useSentinel.getState().connect()
    const ws = useSentinel.getState()._ws as unknown as MockWebSocket
    useSentinel.getState().disconnect()
    expect(ws.close).toHaveBeenCalled()
    expect(useSentinel.getState()._ws).toBeNull()
  })
})
