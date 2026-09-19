/**
 * Tests for lib/services/healthConnectService — Android 14+ Health Connect
 * adapter built on the real `capacitor-health-connect` plugin
 * (registered natively as "HealthConnect").
 *
 * We mock the `capacitor-health-connect` module directly (rather than the
 * deprecated `@capacitor/core` Plugins registry) and reload the service via
 * jest.isolateModules so its cached _available/_permissionsGranted state
 * starts fresh for every test.
 */

type Plugin = {
  checkAvailability: jest.Mock
  requestHealthPermissions: jest.Mock
  readRecords: jest.Mock
}

let currentPlugin: Plugin

jest.mock('capacitor-health-connect', () => ({
  __esModule: true,
  get HealthConnect() {
    return currentPlugin
  },
}))

const buildPlugin = (): Plugin => ({
  checkAvailability: jest.fn(),
  requestHealthPermissions: jest.fn(),
  readRecords: jest.fn(),
})

const loadService = () => {
  let svc!: typeof import('@/lib/services/healthConnectService').healthConnect
  jest.isolateModules(() => {
    svc = require('@/lib/services/healthConnectService').healthConnect
  })
  return svc
}

beforeEach(() => {
  currentPlugin = buildPlugin()
})

describe('HealthConnectService', () => {
  describe('isAvailable', () => {
    it('returns true when the plugin reports Available', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(true)
    })

    it('returns false when the plugin reports NotInstalled', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'NotInstalled' })
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })

    it('caches the availability result across calls', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      const svc = loadService()
      await svc.isAvailable()
      await svc.isAvailable()
      expect(currentPlugin.checkAvailability).toHaveBeenCalledTimes(1)
    })

    it('returns false when checkAvailability throws (e.g. web platform)', async () => {
      currentPlugin.checkAvailability.mockRejectedValue(new Error('not implemented on web'))
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })
  })

  describe('requestPermissions', () => {
    it('returns false when Health Connect is unavailable', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'NotInstalled' })
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })

    it('returns hasAllPermissions from the plugin and requests read-only access', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({
        grantedPermissions: ['HeartRateSeries', 'OxygenSaturation', 'Steps'],
        hasAllPermissions: true,
      })
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(true)
      expect(currentPlugin.requestHealthPermissions).toHaveBeenCalledWith({
        read: ['HeartRateSeries', 'OxygenSaturation', 'Steps'],
        write: [],
      })
    })

    it('returns false when the plugin throws', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })
  })

  describe('getLatestReading', () => {
    it('returns null when Health Connect is unavailable', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'NotInstalled' })
      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('returns null when permissions are refused', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ grantedPermissions: [], hasAllPermissions: false })
      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('returns the latest HR sample, latest SpO2 and summed step count', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ grantedPermissions: [], hasAllPermissions: true })
      currentPlugin.readRecords.mockImplementation(({ type }: { type: string }) => {
        if (type === 'HeartRateSeries') {
          return Promise.resolve({
            records: [
              {
                type: 'HeartRateSeries',
                startTime: '2026-01-01T00:00:00.000Z',
                endTime: '2026-01-01T00:05:00.000Z',
                samples: [
                  { time: '2026-01-01T00:01:00.000Z', beatsPerMinute: 70 },
                  { time: '2026-01-01T00:04:00.000Z', beatsPerMinute: 78 },
                ],
              },
            ],
          })
        }
        if (type === 'OxygenSaturation') {
          return Promise.resolve({
            records: [{ type: 'OxygenSaturation', time: '2026-01-01T00:02:00.000Z', percentage: { value: 97 } }],
          })
        }
        if (type === 'Steps') {
          return Promise.resolve({
            records: [
              { type: 'Steps', startTime: 's1', endTime: 'e1', count: 100 },
              { type: 'Steps', startTime: 's2', endTime: 'e2', count: 250 },
            ],
          })
        }
        return Promise.resolve({ records: [] })
      })

      const svc = loadService()
      const reading = await svc.getLatestReading()

      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(78) // latest sample by time wins
      expect(reading!.spO2).toBe(97)
      expect(reading!.steps).toBe(350)
      expect(reading!.provider).toBe('Health Connect')
    })

    it('caches granted permissions and skips re-request on the next reading', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ grantedPermissions: [], hasAllPermissions: true })
      currentPlugin.readRecords.mockResolvedValue({ records: [] })

      const svc = loadService()
      await svc.getLatestReading()
      await svc.getLatestReading()
      expect(currentPlugin.requestHealthPermissions).toHaveBeenCalledTimes(1)
    })

    it('returns null when both HR and SpO2 records are empty', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ grantedPermissions: [], hasAllPermissions: true })
      currentPlugin.readRecords.mockResolvedValue({ records: [] })

      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('tolerates a failing individual reader (allSettled)', async () => {
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ grantedPermissions: [], hasAllPermissions: true })
      currentPlugin.readRecords.mockImplementation(({ type }: { type: string }) => {
        if (type === 'HeartRateSeries') {
          return Promise.resolve({
            records: [{ type: 'HeartRateSeries', startTime: 's', endTime: 'e', samples: [{ time: 't', beatsPerMinute: 70 }] }],
          })
        }
        if (type === 'OxygenSaturation') {
          return Promise.reject(new Error('svc down'))
        }
        return Promise.resolve({ records: [] })
      })

      const svc = loadService()
      const reading = await svc.getLatestReading(10)
      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(70)
      expect(reading!.spO2).toBe(0) // fallback when null
    })
  })
})
