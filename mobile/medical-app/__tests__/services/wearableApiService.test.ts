/**
 * Tests for lib/api/services/wearableService — thin adapter over apiClient
 * that talks to the backend /wearables endpoints (metrics / sync / history).
 */

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

import { apiClient } from '@/lib/api/client'
import { wearableService } from '@/lib/api/services/wearableService'

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  ;(console.error as jest.Mock).mockRestore?.()
})

describe('wearableService (API adapter)', () => {
  describe('getMetrics', () => {
    it('maps the backend metrics envelope to the mobile shape', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        metrics: {
          heartRate: { current: 78 },
          oxygenSaturation: { current: 97 },
          activity: { steps: 4200 },
          period: { endDate: '2026-07-25T12:00:00Z', dataPoints: 12 },
        },
      })
      const r = await wearableService.getMetrics()
      expect(r).toEqual({
        heartRate: 78,
        spO2: 97,
        steps: 4200,
        lastSync: new Date('2026-07-25T12:00:00Z').toISOString(),
        provider: 'Wear OS Emulator',
        dataPoints: 12,
      })
    })

    it('returns an empty reading when the backend has no dataPoints', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        metrics: { period: { dataPoints: 0 } },
      })
      const r = await wearableService.getMetrics()
      expect(r).toEqual({
        heartRate: null,
        spO2: null,
        steps: null,
        lastSync: null,
        provider: null,
        dataPoints: 0,
      })
    })

    it('returns an empty reading when metrics is missing entirely', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({})
      const r = await wearableService.getMetrics()
      expect(r.heartRate).toBeNull()
      expect(r.dataPoints).toBe(0)
    })

    it('falls back to "now" for lastSync when the period has no endDate', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        metrics: {
          heartRate: { current: 70 },
          period: { dataPoints: 1 },
        },
      })
      const before = Date.now()
      const r = await wearableService.getMetrics()
      const after = Date.now()
      const ts = new Date(r.lastSync!).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
      expect(ts).toBeLessThanOrEqual(after)
    })
  })

  describe('syncMetrics', () => {
    it('POSTs a payload mapped to the backend field names', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ ok: true })
      await wearableService.syncMetrics({
        heartRate: 82, spO2: 96, steps: 5000, lastSync: '2026-07-25T10:00:00Z',
      })
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/wearables/sync'),
        {
          data: [{
            heartRate: 82,
            oxygenSaturation: 96,
            steps: 5000,
            timestamp: '2026-07-25T10:00:00Z',
            source: 'android_sensor',
          }],
        },
      )
    })

    it('defaults the timestamp to now when lastSync is empty', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ ok: true })
      const before = Date.now()
      await wearableService.syncMetrics({
        heartRate: 70, spO2: 98, steps: 100, lastSync: '',
      })
      const body = (apiClient.post as jest.Mock).mock.calls[0][1]
      const ts = new Date(body.data[0].timestamp).getTime()
      expect(ts).toBeGreaterThanOrEqual(before)
    })
  })

  describe('getHistory', () => {
    const sample = [
      { heartRate: 70, oxygenSaturation: 97, steps: 100, timestamp: 't1', source: 'x' },
      { heartRate: 82, oxygenSaturation: 96, steps: 200, timestamp: 't2', source: 'x' },
    ]

    it('unwraps the {data:[...]} envelope when apiClient forwards it', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: sample })
      const r = await wearableService.getHistory(2)
      expect(r).toEqual(sample)
    })

    it('accepts an already-unwrapped array response', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(sample)
      const r = await wearableService.getHistory()
      expect(r).toEqual(sample)
    })

    it('forwards the limit query param', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue([])
      await wearableService.getHistory(25)
      expect((apiClient.get as jest.Mock).mock.calls[0][0]).toMatch(/limit=25/)
    })

    it('returns [] when the payload is not an array', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { foo: 'bar' } })
      const r = await wearableService.getHistory()
      expect(r).toEqual([])
    })

    it('returns [] and logs on network error', async () => {
      ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('net'))
      const r = await wearableService.getHistory()
      expect(r).toEqual([])
      expect(console.error).toHaveBeenCalled()
    })
  })
})
