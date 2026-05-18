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

interface SentinelStore {
  incidents: Incident[]
  agents: Agent[]
  stats: Stats
  history: IncidentHistoryEntry[]
  connected: boolean
  _ws: WebSocket | null
  _reconnectTimer: ReturnType<typeof setTimeout> | null

  connect: () => void
  disconnect: () => void
  refresh: () => Promise<void>
  _applyUpdate: (update: StateUpdate) => void
}

export const useSentinel = create<SentinelStore>((set, get) => ({
  incidents: [],
  agents: [],
  stats: DEFAULT_STATS,
  history: [],
  connected: false,
  _ws: null,
  _reconnectTimer: null,

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

  connect: () => {
    const state = get()
    if (state._ws && state._ws.readyState === WebSocket.OPEN) return

    const ws = connectWebSocket(
      (data) => {
        get()._applyUpdate(data as unknown as StateUpdate)
      },
      () => {
        set({ connected: true })
        const t = get()._reconnectTimer
        if (t) clearTimeout(t)
        set({ _reconnectTimer: null })
      },
      () => {
        set({ connected: false, _ws: null })
        // Reconnect after 3 seconds, then fall back to HTTP polling
        const timer = setTimeout(() => {
          get().connect()
        }, 3000)
        set({ _reconnectTimer: timer })
        // Immediately do an HTTP refresh so UI isn't stale
        get().refresh()
      },
    )
    set({ _ws: ws })
  },

  disconnect: () => {
    const { _ws, _reconnectTimer } = get()
    if (_reconnectTimer) clearTimeout(_reconnectTimer)
    _ws?.close()
    set({ _ws: null, connected: false, _reconnectTimer: null })
  },
}))
