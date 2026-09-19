/**
 * Tests for lib/services/healthKitService — iOS HealthKit adapter built on
 * the real `@perfood/capacitor-healthkit` plugin (registered natively as
 * "CapacitorHealthkit").
 *
 * We mock `@perfood/capacitor-healthkit` at the module level and reload the
 * service via jest.isolateModules so its cached _available/_permissionsGranted
 * state starts fresh for every test.
 */

type HKPlugin = {
  isAvailable: jest.Mock
  requestAuthorization: jest.Mock
  queryHKitSampleType: jest.Mock
}

let currentPlugin: HKPlugin

jest.mock('@perfood/capacitor-healthkit', () => ({
  __esModule: true,
  get CapacitorHealthkit() {
    return currentPlugin
  },
  SampleNames: {
    HEART_RATE: 'heartRate',
    OXYGEN_SATURATION: 'oxygenSaturation',
    STEP_COUNT: 'stepCount',
  },
}))

const buildPlugin = (): HKPlugin => ({
  isAvailable: jest.fn(),
  requestAuthorization: jest.fn(),
  queryHKitSampleType: jest.fn(),
})

const loadService = () => {
  let svc!: typeof import('@/lib/services/healthKitService').healthKit
  jest.isolateModules(() => {
    svc = require('@/lib/services/healthKitService').healthKit
  })
  return svc
}

beforeEach(() => {
  currentPlugin = buildPlugin()
})

describe('HealthKitService', () => {
  describe('isAvailable', () => {
    it('returns true when the plugin resolves', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(true)
    })

    it('returns false when the plugin throws (e.g. non-iOS platform)', async () => {
      currentPlugin.isAvailable.mockRejectedValue(new Error('Not implemented on web.'))
      const svc = loadService()
      await expect(svc.isAvailable()).resolves.toBe(false)
    })

    it('caches the availability result across calls', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      const svc = loadService()
      await svc.isAvailable()
      await svc.isAvailable()
      expect(currentPlugin.isAvailable).toHaveBeenCalledTimes(1)
    })
  })

  describe('requestPermissions', () => {
    it('returns false when HealthKit is unavailable', async () => {
      currentPlugin.isAvailable.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })

    it('requests read-only authorization and returns true once the dialog completes', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(true)
      expect(currentPlugin.requestAuthorization).toHaveBeenCalledWith({
        read: ['heartRate', 'oxygenSaturation', 'stepCount'],
        write: [],
        all: [],
      })
    })

    it('returns false when the plugin throws', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.requestPermissions()).resolves.toBe(false)
    })
  })

  describe('getLatestReading', () => {
    it('returns null when HealthKit is unavailable', async () => {
      currentPlugin.isAvailable.mockRejectedValue(new Error('x'))
      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('returns the latest HR, normalizes fractional SpO2, and sums steps', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      currentPlugin.queryHKitSampleType.mockImplementation(({ sampleName }: { sampleName: string }) => {
        if (sampleName === 'heartRate') {
          return Promise.resolve({
            countReturn: 2,
            resultData: [
              { startDate: '2026-01-01T00:01:00.000Z', endDate: '2026-01-01T00:01:00.000Z', value: 70, unitName: 'count/min' },
              { startDate: '2026-01-01T00:04:00.000Z', endDate: '2026-01-01T00:04:00.000Z', value: 78, unitName: 'count/min' },
            ],
          })
        }
        if (sampleName === 'oxygenSaturation') {
          // HealthKit típicamente reporta SpO2 como fracción (0-1)
          return Promise.resolve({
            countReturn: 1,
            resultData: [{ startDate: '2026-01-01T00:02:00.000Z', endDate: '2026-01-01T00:02:00.000Z', value: 0.97, unitName: '%' }],
          })
        }
        if (sampleName === 'stepCount') {
          return Promise.resolve({
            countReturn: 2,
            resultData: [
              { startDate: 's1', endDate: 'e1', value: 100, unitName: 'count' },
              { startDate: 's2', endDate: 'e2', value: 250, unitName: 'count' },
            ],
          })
        }
        return Promise.resolve({ countReturn: 0, resultData: [] })
      })

      const svc = loadService()
      const reading = await svc.getLatestReading()

      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(78) // latest sample by startDate wins
      expect(reading!.spO2).toBe(97) // 0.97 normalized to percentage
      expect(reading!.steps).toBe(350)
      expect(reading!.provider).toBe('Apple Health')
    })

    it('leaves already-percentage SpO2 values untouched', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      currentPlugin.queryHKitSampleType.mockImplementation(({ sampleName }: { sampleName: string }) => {
        if (sampleName === 'heartRate') {
          return Promise.resolve({ countReturn: 1, resultData: [{ startDate: 't', endDate: 't', value: 65, unitName: 'count/min' }] })
        }
        if (sampleName === 'oxygenSaturation') {
          return Promise.resolve({ countReturn: 1, resultData: [{ startDate: 't', endDate: 't', value: 96, unitName: '%' }] })
        }
        return Promise.resolve({ countReturn: 0, resultData: [] })
      })

      const svc = loadService()
      const reading = await svc.getLatestReading()
      expect(reading!.spO2).toBe(96)
    })

    it('caches granted permissions and skips re-request on the next reading', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      currentPlugin.queryHKitSampleType.mockResolvedValue({ countReturn: 0, resultData: [] })

      const svc = loadService()
      await svc.getLatestReading()
      await svc.getLatestReading()
      expect(currentPlugin.requestAuthorization).toHaveBeenCalledTimes(1)
    })

    it('returns null when both HR and SpO2 have no samples (e.g. permission silently denied)', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      currentPlugin.queryHKitSampleType.mockResolvedValue({ countReturn: 0, resultData: [] })

      const svc = loadService()
      await expect(svc.getLatestReading()).resolves.toBeNull()
    })

    it('tolerates a failing individual reader (allSettled)', async () => {
      currentPlugin.isAvailable.mockResolvedValue(undefined)
      currentPlugin.requestAuthorization.mockResolvedValue(undefined)
      currentPlugin.queryHKitSampleType.mockImplementation(({ sampleName }: { sampleName: string }) => {
        if (sampleName === 'heartRate') {
          return Promise.resolve({ countReturn: 1, resultData: [{ startDate: 't', endDate: 't', value: 70, unitName: 'count/min' }] })
        }
        if (sampleName === 'oxygenSaturation') {
          return Promise.reject(new Error('svc down'))
        }
        return Promise.resolve({ countReturn: 0, resultData: [] })
      })

      const svc = loadService()
      const reading = await svc.getLatestReading(10)
      expect(reading).not.toBeNull()
      expect(reading!.heartRate).toBe(70)
      expect(reading!.spO2).toBe(0) // fallback when null
    })
  })
})
