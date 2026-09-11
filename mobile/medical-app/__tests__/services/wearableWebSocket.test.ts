/**
 * Tests for lib/services/wearableWebSocket — persistent WS connection between
 * the mobile app and the backend. Uses a hand-rolled WebSocket mock that lets
 * each test drive the socket lifecycle (open / message / close / error).
 */

jest.mock('@/lib/api/config', () => ({
  API_CONFIG: { baseURL: 'https://api.example.com', timeout: 5000 },
  getAuthToken: jest.fn(),
}))

import { getAuthToken } from '@/lib/api/config'
import type { SensorReading } from '@/lib/services/emulatorSensors'
import { WearableWebSocketService } from '@/lib/services/wearableWebSocket'

class MockWs {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  static instances: MockWs[] = []

  readyState = MockWs.CONNECTING
  onopen: ((this: MockWs, ev?: any) => any) | null = null
  onmessage: ((this: MockWs, ev: { data: string }) => any) | null = null
  onclose: ((this: MockWs) => any) | null = null
  onerror: ((this: MockWs, ev?: any) => any) | null = null
  sent: string[] = []
  closed = false

  constructor(public url: string) {
    MockWs.instances.push(this)
  }

  send(data: string) { this.sent.push(data) }
  close() {
    this.readyState = MockWs.CLOSED
    this.closed = true
    this.onclose?.()
  }

  // Test helpers
  triggerOpen() {
    this.readyState = MockWs.OPEN
    this.onopen?.()
  }
  triggerMessage(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) })
  }
  triggerRawMessage(raw: string) {
    this.onmessage?.({ data: raw })
  }
  triggerError() { this.onerror?.() }
  triggerClose() {
    this.readyState = MockWs.CLOSED
    this.onclose?.()
  }
}

const origWs = global.WebSocket

beforeEach(() => {
  jest.useFakeTimers()
  MockWs.instances = []
  ;(global as any).WebSocket = MockWs
  ;(getAuthToken as jest.Mock).mockReturnValue('jwt-abc')
})

afterEach(() => {
  jest.useRealTimers()
  ;(global as any).WebSocket = origWs
})

const reading = (over: Partial<SensorReading> = {}): SensorReading => ({
  heartRate: 78, spO2: 97, steps: 100,
  lastSync: '2026-07-25T10:00:00Z',
  provider: 'Android Virtual Sensor',
  ...over,
})

describe('WearableWebSocketService', () => {
  it('opens a wss:// URL derived from API_CONFIG.baseURL', () => {
    const svc = new WearableWebSocketService()
    svc.connect()
    expect(MockWs.instances).toHaveLength(1)
    expect(MockWs.instances[0].url).toBe('wss://api.example.com/ws/wearables')
  })

  it('sends an auth frame on open using the current token', () => {
    const svc = new WearableWebSocketService()
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    const first = JSON.parse(ws.sent[0])
    expect(first).toEqual({ type: 'auth', payload: { token: 'jwt-abc' } })
  })

  it('does not send an auth frame when no token is available', () => {
    ;(getAuthToken as jest.Mock).mockReturnValue(null)
    const svc = new WearableWebSocketService()
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    expect(ws.sent).toEqual([])
  })

  it('flips isConnected + fires status listeners on auth:ok', () => {
    const svc = new WearableWebSocketService()
    const status = jest.fn()
    svc.onStatus(status)
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    ws.triggerMessage({ type: 'auth:ok' })
    expect(svc.isConnected).toBe(true)
    expect(status).toHaveBeenCalledWith('connected')
  })

  it('closes the socket and emits error on auth:error', () => {
    const svc = new WearableWebSocketService()
    const status = jest.fn()
    svc.onStatus(status)
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    ws.triggerMessage({ type: 'auth:error' })
    expect(status).toHaveBeenCalledWith('error')
    expect(ws.closed).toBe(true)
  })

  it('forwards wearable:alert payloads to alert listeners', () => {
    const svc = new WearableWebSocketService()
    const alertCb = jest.fn()
    svc.onAlert(alertCb)
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    ws.triggerMessage({ type: 'auth:ok' })
    const alert = { level: 'critical', metric: 'spO2', value: 85, threshold: 90, title: 't', message: 'm' }
    ws.triggerMessage({ type: 'wearable:alert', payload: alert })
    expect(alertCb).toHaveBeenCalledWith(alert)
  })

  it('silently ignores unknown frame types and unparseable messages', () => {
    const svc = new WearableWebSocketService()
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    ws.triggerRawMessage('not-json')
    ws.triggerMessage({ type: 'noop' })
    ws.triggerMessage({ type: 'pong' })
    // No throws, no crash — the service stays usable.
    expect(svc.isConnected).toBe(false) // never auth:ok'd
  })

  describe('sendReading', () => {
    it('sends a wearable:data frame once authenticated', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      ws.triggerOpen()
      ws.triggerMessage({ type: 'auth:ok' })
      ws.sent = [] // clear auth frame
      svc.sendReading(reading())
      const frame = JSON.parse(ws.sent[0])
      expect(frame.type).toBe('wearable:data')
      expect(frame.payload.heartRate).toBe(78)
      expect(frame.payload.oxygenSaturation).toBe(97)
      expect(frame.payload.source).toBe('android_sensor')
    })

    it('tags Health Connect readings as source=google_fit', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      ws.triggerOpen()
      ws.triggerMessage({ type: 'auth:ok' })
      ws.sent = []
      svc.sendReading(reading({ provider: 'Health Connect' }))
      const frame = JSON.parse(ws.sent[0])
      expect(frame.payload.source).toBe('google_fit')
    })

    it('queues readings while unauthenticated and flushes them on auth:ok', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      // Two readings before auth:
      svc.sendReading(reading({ heartRate: 60 }))
      svc.sendReading(reading({ heartRate: 61 }))
      ws.triggerOpen()
      ws.sent = [] // drop auth frame
      ws.triggerMessage({ type: 'auth:ok' })
      const frames = ws.sent.map((s) => JSON.parse(s))
      const dataFrames = frames.filter((f) => f.type === 'wearable:data')
      expect(dataFrames).toHaveLength(2)
      expect(dataFrames[0].payload.heartRate).toBe(60)
      expect(dataFrames[1].payload.heartRate).toBe(61)
    })

    it('caps the queue at 10 readings by dropping the oldest', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      for (let i = 0; i < 15; i++) svc.sendReading(reading({ heartRate: 60 + i }))
      ws.triggerOpen()
      ws.sent = []
      ws.triggerMessage({ type: 'auth:ok' })
      const dataFrames = ws.sent.map((s) => JSON.parse(s)).filter((f) => f.type === 'wearable:data')
      expect(dataFrames).toHaveLength(10)
      // Oldest kept is index 5 (60+5=65).
      expect(dataFrames[0].payload.heartRate).toBe(65)
      expect(dataFrames[9].payload.heartRate).toBe(74)
    })
  })

  describe('reconnection', () => {
    it('schedules a reconnect with exponential backoff on unexpected close', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      MockWs.instances[0].triggerClose()
      // First backoff: 1000ms (1_000 * 2^0). Fast-forward and expect a new socket.
      jest.advanceTimersByTime(1_000)
      expect(MockWs.instances).toHaveLength(2)
    })

    it('does not reconnect after an intentional disconnect', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      svc.disconnect()
      jest.advanceTimersByTime(60_000)
      expect(MockWs.instances).toHaveLength(1)
    })

    it('caps the backoff at 30 seconds', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      // Force many failed attempts to push the backoff past the cap.
      for (let i = 0; i < 10; i++) {
        MockWs.instances[MockWs.instances.length - 1].triggerClose()
        jest.advanceTimersByTime(30_000)
      }
      // Should have opened multiple sockets and never crashed.
      expect(MockWs.instances.length).toBeGreaterThan(3)
    })
  })

  describe('ping keep-alive', () => {
    it('sends periodic pings once open', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      ws.triggerOpen()
      ws.sent = []
      jest.advanceTimersByTime(25_000)
      const frames = ws.sent.map((s) => JSON.parse(s))
      expect(frames.some((f) => f.type === 'ping')).toBe(true)
    })

    it('stops pinging after close', () => {
      const svc = new WearableWebSocketService()
      svc.connect()
      const ws = MockWs.instances[0]
      ws.triggerOpen()
      ws.triggerClose()
      ws.sent = []
      jest.advanceTimersByTime(60_000)
      // No ping should have been queued after close (readyState !== OPEN).
      expect(ws.sent.filter((s) => s.includes('ping'))).toEqual([])
    })
  })

  it('emits an error status when the socket errors', () => {
    const svc = new WearableWebSocketService()
    const status = jest.fn()
    svc.onStatus(status)
    svc.connect()
    MockWs.instances[0].triggerError()
    expect(status).toHaveBeenCalledWith('error')
  })

  it('supports removing status/alert listeners via the returned unsubscriber', () => {
    const svc = new WearableWebSocketService()
    const alertCb = jest.fn()
    const off = svc.onAlert(alertCb)
    off()
    svc.connect()
    const ws = MockWs.instances[0]
    ws.triggerOpen()
    ws.triggerMessage({ type: 'auth:ok' })
    ws.triggerMessage({ type: 'wearable:alert', payload: {} })
    expect(alertCb).not.toHaveBeenCalled()
  })
})
