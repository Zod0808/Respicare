/**
 * Tests for lib/services/healthConnectService — Android 14+ Health Connect
 * adapter that reads HeartRate / SpO2 / Steps records from Google's Health
 * Connect via a Capacitor plugin.
 *
 * The plugin lives on window.Capacitor.Plugins on a real device. In jsdom we
 * replace @capacitor/core with a mock whose Plugins.HealthConnect we can swap
 * per test, and reload the service module each time via jest.isolateModules
 * so its cached _plugin/_available state starts fresh.
 */

type Plugin = {
  checkAvailability: jest.Mock
  requestHealthPermissions: jest.Mock
  readHeartRate: jest.Mock
  readOxygenSaturation: jest.Mock
  readStepCount: jest.Mock
}

let currentPlugin: Plugin | null = null

jest.mock('@capacitor/core', () => ({
  __esModule: true,
  get Plugins() {
    return currentPlugin ? { HealthConnect: currentPlugin } : {}
  },
}))

const buildPlugin = (): Plugin => ({
  checkAvailability: jest.fn(),
  requestHealthPermissions: jest.fn(),
  readHeartRate: jest.fn(),
  readOxygenSaturation: jest.fn(),
  readStepCount: jest.fn(),
})

const loadService = () => {
  let svc!: typeof import('@/lib/services/healthConnectService').healthConnect
  jest.isolateModules(() => {
    svc = require('@/lib/services/healthConnectService').healthConnect
  })
  return svc
}

beforeEach(() => {
  currentPlugin = null
})

describe('HealthConnectService', () => {
  describe('isAvailable', () => {
    it('returns false when the plugin is not installed', async () => {
      currentPlugin = null
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })

    it('returns true when the plugin reports Available', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(true)
    })

    it('returns false when the plugin reports NotInstalled', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'NotInstalled' })
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })

    it('caches the availability result across calls', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      const svc = loadService()
      await svc.isAvailable()
      await svc.isAvailable()
      expect(currentPlugin.checkAvailability).toHaveBeenCalledTimes(1)
    })

    it('returns false when checkAvailability throws', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })
  })

  describe('requestPermissions', () => {
    it('returns false when Health Connect is unavailable', async () => {
      currentPlugin = null
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })

    it('returns the granted flag from the plugin', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: true })
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(true)
      expect(currentPlugin.requestHealthPermissions).toHaveBeenCalledWith({
        read: ['HeartRate', 'OxygenSaturation', 'Steps'],
      })
    })

    it('returns false when the plugin throws', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })
  })

  describe('getLatestReading', () => {
    it('returns null when Health Connect is unavailable', async () => {
      currentPlugin = null
      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('returns null when permissions are refused', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: false })
      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('returns the latest HR, SpO2 and summed step count', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: true })
      currentPlugin.readHeartRate.mockResolvedValue({
        records: [
          { beatsPerMinute: 70, time: 't1' },
          { beatsPerMinute: 78, time: 't2' },
        ],
      })
      currentPlugin.readOxygenSaturation.mockResolvedValue({
        records: [{ percentage: 97, time: 't1' }],
      })
      currentPlugin.readStepCount.mockResolvedValue({
        records: [
          { count: 100, startTime: 's1', endTime: 'e1' },
          { count: 250, startTime: 's2', endTime: 'e2' },
        ],
      })

      const svc = loadService()
      const reading = await svc.getLatestReading()

      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(78) // latest record wins
      expect(reading!.spO2).toBe(97)
      expect(reading!.steps).toBe(350)
      expect(reading!.provider).toBe('Health Connect')
    })

    it('caches granted permissions and skips re-request on the next reading', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: true })
      currentPlugin.readHeartRate.mockResolvedValue({ records: [{ beatsPerMinute: 80, time: 't' }] })
      currentPlugin.readOxygenSaturation.mockResolvedValue({ records: [{ percentage: 96, time: 't' }] })
      currentPlugin.readStepCount.mockResolvedValue({ records: [] })

      const svc = loadService()
      await svc.getLatestReading()
      await svc.getLatestReading()
      expect(currentPlugin.requestHealthPermissions).toHaveBeenCalledTimes(1)
    })

    it('returns null when both HR and SpO2 records are empty', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: true })
      currentPlugin.readHeartRate.mockResolvedValue({ records: [] })
      currentPlugin.readOxygenSaturation.mockResolvedValue({ records: [] })
      currentPlugin.readStepCount.mockResolvedValue({ records: [] })

      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('tolerates a failing individual reader (allSettled)', async () => {
      currentPlugin = buildPlugin()
      currentPlugin.checkAvailability.mockResolvedValue({ availability: 'Available' })
      currentPlugin.requestHealthPermissions.mockResolvedValue({ granted: true })
      currentPlugin.readHeartRate.mockResolvedValue({ records: [{ beatsPerMinute: 70, time: 't' }] })
      currentPlugin.readOxygenSaturation.mockRejectedValue(new Error('svc down'))
      currentPlugin.readStepCount.mockResolvedValue({ records: [] })

      const svc = loadService()
      const reading = await svc.getLatestReading(10)
      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(70)
      expect(reading!.spO2).toBe(0) // fallback when null
    })
  })
})
