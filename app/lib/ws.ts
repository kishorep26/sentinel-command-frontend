const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export type WsMessageHandler = (data: Record<string, unknown>) => void

export function connectWebSocket(
  onMessage: WsMessageHandler,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws/updates'
  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.info('[WS] Connected to', wsUrl)
    onOpen?.()
  }

  ws.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as Record<string, unknown>
      onMessage(data)
    } catch {
      console.warn('[WS] Failed to parse message')
    }
  }

  ws.onclose = (event) => {
    console.info('[WS] Disconnected (code:', event.code, ')')
    onClose?.()
  }

  ws.onerror = (error) => {
    console.warn('[WS] Error', error)
  }

  return ws
}
