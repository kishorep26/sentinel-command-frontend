import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const API_URL = 'http://localhost:8000'

process.env.NEXT_PUBLIC_API_URL = API_URL
process.env.NEXT_PUBLIC_API_KEY = 'test-key'

// Must import after env vars are set
const { api } = await import('@/app/lib/api')

function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('api.incidents.list', () => {
  beforeEach(() => { vi.stubGlobal('fetch', mockFetch([])) })
  afterEach(() => { vi.restoreAllMocks() })

  it('calls GET /incidents', async () => {
    const result = await api.incidents.list()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/incidents'),
      expect.objectContaining({ cache: 'no-store' }),
    )
    expect(result).toEqual([])
  })
})

describe('api.incidents.create', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch({ id: 1, type: 'fire', status: 'active' }))
  })
  afterEach(() => { vi.restoreAllMocks() })

  it('calls POST /incidents with correct body and API key', async () => {
    const payload = { type: 'fire', location: { lat: 40.78, lon: -73.97 }, description: 'test' }
    await api.incidents.create(payload)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/incidents'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-api-key': 'test-key' }),
      }),
    )
  })
})

describe('api.analytics.stats', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('returns stats object', async () => {
    const statsFixture = { total_incidents: 5, active_incidents: 2, resolved_incidents: 3, average_response_time: 1.2, total_agents: 6, active_agents: 2 }
    vi.stubGlobal('fetch', mockFetch(statsFixture))
    const stats = await api.analytics.stats()
    expect(stats.total_incidents).toBe(5)
    expect(stats.active_agents).toBe(2)
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 500))
    await expect(api.analytics.stats()).rejects.toThrow('GET /stats failed: 500')
  })
})
