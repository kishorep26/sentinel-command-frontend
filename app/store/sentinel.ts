'use client'

import { create } from 'zustand'
import { connectWebSocket } from '@/app/lib/ws'
import { api } from '@/app/lib/api'
import type { Agent, Incident, IncidentHistoryEntry, Stats, StateUpdate } from '@/app/types'

const DEFAULT_STATS: Stats = {
  total_incidents: 0,
  active_incidents: 0,
  resolved_incidents: 0,
  average_response_time: 0,
  total_agents: 0,
  active_agents: 0,
}

const WS_MAX_RETRIES = 3          // give up on WS after 3 quick failures (serverless)
const POLL_INTERVAL_MS = 4000     // HTTP poll cadence when WS is unavailable

interface SentinelStore {
  incidents: Incident[]
  agents: Agent[]
  stats: Stats
  history: IncidentHistoryEntry[]
  connected: boolean
  _ws: WebSocket | null
  _reconnectTimer: ReturnType<typeof setTimeout> | null
  _pollTimer: ReturnType<typeof setInterval> | null
  _wsFailures: number

  connect: () => void
  disconnect: () => void
  refresh: () => Promise<void>
  _applyUpdate: (update: StateUpdate) => void
  _startPolling: () => void
  _stopPolling: () => void
}

export const useSentinel = create<SentinelStore>((set, get) => ({
  incidents: [],
  agents: [],
  stats: DEFAULT_STATS,
  history: [],
  connected: false,
  _ws: null,
  _reconnectTimer: null,
  _pollTimer: null,
  _wsFailures: 0,

  _applyUpdate: (update: StateUpdate) => {
    set({
      incidents: update.incidents ?? get().incidents,
      agents: update.agents ?? get().agents,
      stats: update.stats ?? get().stats,
      history: update.history ?? get().history,
    })
  },

  refresh: async () => {
    try {
      const [incidents, agents, stats, history] = await Promise.all([
        api.incidents.list(),
        api.agents.list(),
        api.analytics.stats(),
        api.analytics.history(),
      ])
      set({ incidents, agents, stats, history })
    } catch (err) {
      console.warn('[Sentinel] HTTP refresh failed', err)
    }
  },

  _startPolling: () => {
    if (get()._pollTimer) return
    // Do an immediate fetch then poll on interval
    get().refresh()
    const timer = setInterval(() => get().refresh(), POLL_INTERVAL_MS)
    set({ _pollTimer: timer })
  },

  _stopPolling: () => {
    const t = get()._pollTimer
    if (t) { clearInterval(t); set({ _pollTimer: null }) }
  },

  connect: () => {
    const state = get()

    // Already have an open WS
    if (state._ws && state._ws.readyState === WebSocket.OPEN) return

    // Given up on WS — just poll
    if (state._wsFailures >= WS_MAX_RETRIES) {
      get()._startPolling()
      return
    }

    const ws = connectWebSocket(
      (data) => {
        get()._applyUpdate(data as unknown as StateUpdate)
      },
      () => {
        // Connected — stop any fallback polling
        set({ connected: true, _wsFailures: 0 })
        get()._stopPolling()
        const t = get()._reconnectTimer
        if (t) { clearTimeout(t); set({ _reconnectTimer: null }) }
      },
      () => {
        const failures = get()._wsFailures + 1
        set({ connected: false, _ws: null, _wsFailures: failures })

        if (failures >= WS_MAX_RETRIES) {
          // WS not supported (serverless) — switch permanently to HTTP polling
          console.info('[Sentinel] WS unavailable after', failures, 'attempts — switching to HTTP polling')
          get()._startPolling()
          return
        }

        // Transient failure — retry WS once
        const timer = setTimeout(() => get().connect(), 3000)
        set({ _reconnectTimer: timer })
        get().refresh() // immediate refresh while waiting
      },
    )
    set({ _ws: ws })
  },

  disconnect: () => {
    const { _ws, _reconnectTimer } = get()
    if (_reconnectTimer) clearTimeout(_reconnectTimer)
    _ws?.close()
    get()._stopPolling()
    set({ _ws: null, connected: false, _reconnectTimer: null, _wsFailures: 0 })
  },
}))
