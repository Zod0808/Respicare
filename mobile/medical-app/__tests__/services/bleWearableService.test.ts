/**
 * Tests for lib/services/bleWearableService — BLE GATT Heart Rate / SpO2
 * client backed by @capacitor-community/bluetooth-le.
 *
 * The plugin is mocked at the module level via a mutable currentClient
 * reference; jest.isolateModules reloads the service so its cached _client
 * and _initialized state start fresh each test.
 */

type BleClient = {
  initialize: jest.Mock
  requestLEScan: jest.Mock
  stopLEScan: jest.Mock
  connect: jest.Mock
  disconnect: jest.Mock
  startNotifications: jest.Mock
  stopNotifications: jest.Mock
}

let currentClient: BleClient | null = null
let pluginAvailable = true

jest.mock('@capacitor-community/bluetooth-le', () => {
  if (!pluginAvailable) {
    throw new Error('plugin not installed')
  }
  return {
    __esModule: true,
    get BleClient() {
      return currentClient
    },
  }
})

const buildClient = (): BleClient => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  requestLEScan: jest.fn().mockResolvedValue(undefined),
  stopLEScan: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  startNotifications: jest.fn().mockResolvedValue(undefined),
  stopNotifications: jest.fn().mockResolvedValue(undefined),
})

const loadService = () => {
  let Ctor!: typeof import('@/lib/services/bleWearableService').BleWearableService
  jest.isolateModules(() => {
    Ctor = require('@/lib/services/bleWearableService').BleWearableService
  })
  return new Ctor()
}

beforeEach(() => {
  jest.useFakeTimers()
  currentClient = null
  pluginAvailable = true
})

afterEach(() => {
  jest.useRealTimers()
})

describe('BleWearableService', () => {
  describe('scanAndConnect', () => {
    it('returns false and reports "unavailable" when the plugin is missing', async () => {
      pluginAvailable = false
      const svc = loadService()
      const status: string[] = []
      svc.onStatus((s) => status.push(s))
      await expect(svc.scanAndConnect()).resolves.toBe(false)
      expect(svc.getStatus()).toBe('unavailable')
      expect(status).toContain('unavailable')
    })

    it('returns false when initialize() throws', async () => {
      currentClient = buildClient()
      currentClient.initialize.mockRejectedValue(new Error('bt off'))
      const svc = loadService()
      await expect(svc.scanAndConnect()).resolves.toBe(false)
      expect(svc.getStatus()).toBe('unavailable')
    })

    it('connects to the first discovered device and subscribes to notifications', async () => {
      currentClient = buildClient()
      currentClient.requestLEScan.mockImplementation(async (_opts: any, cb: any) => {
        cb({ device: { deviceId: 'DE:AD:BE:EF' } })
      })

      const svc = loadService()
      const status: string[] = []
      svc.onStatus((s) => status.push(s))

      const ok = await svc.scanAndConnect()
      expect(ok).toBe(true)
      expect(currentClient.stopLEScan).toHaveBeenCalled()
      expect(currentClient.connect).toHaveBeenCalledWith('DE:AD:BE:EF', expect.any(Function))
      expect(currentClient.startNotifications).toHaveBeenCalledTimes(2)
      expect(svc.getStatus()).toBe('connected')
      expect(status).toEqual(expect.arrayContaining(['scanning', 'connecting', 'connected']))
    })

    it('returns false when the underlying connect() fails', async () => {
      currentClient = buildClient()
      currentClient.requestLEScan.mockImplementation(async (_opts: any, cb: any) => {
        cb({ device: { deviceId: 'X' } })
      })
      currentClient.connect.mockRejectedValue(new Error('link fail'))
      const svc = loadService()
      await expect(svc.scanAndConnect()).resolves.toBe(false)
      expect(svc.getStatus()).toBe('error')
    })

    it('reports an error when the scan itself rejects', async () => {
      currentClient = buildClient()
      currentClient.requestLEScan.mockRejectedValue(new Error('scan denied'))
      const svc = loadService()
      const ok = await svc.scanAndConnect()
      expect(ok).toBe(false)
      expect(svc.getStatus()).toBe('error')
    })

    it('times out with an error when no device shows up within 15s', async () => {
      currentClient = buildClient()
      currentClient.requestLEScan.mockImplementation(async () => {})
      const svc = loadService()
      const p = svc.scanAndConnect()
      await jest.advanceTimersByTimeAsync(16_000)
      const ok = await p
      expect(ok).toBe(false)
      expect(svc.getStatus()).toBe('error')
      expect(currentClient.stopLEScan).toHaveBeenCalled()
    })
  })

  describe('notification decoding → onReading', () => {
    async function connectAndCapture() {
      currentClient = buildClient()
      let hrHandler: ((v: DataView) => void) | null = null
      let spo2Handler: ((v: DataView) => void) | null = null

      currentClient.requestLEScan.mockImplementation(async (_opts: any, cb: any) => {
        cb({ device: { deviceId: 'X' } })
      })
      currentClient.startNotifications.mockImplementation(
        async (_id: string, service: string, _char: string, cb: (v: DataView) => void) => {
          if (service.startsWith('0000180d')) hrHandler = cb
          else if (service.startsWith('00001822')) spo2Handler = cb
        },
      )
      const svc = loadService()
      const readings: any[] = []
      svc.onReading((r) => readings.push(r))
      await svc.scanAndConnect()
      return { svc, readings, hr: () => hrHandler!, spo2: () => spo2Handler! }
    }

    it('parses a uint8 heart rate value (flags bit 0 = 0)', async () => {
      const { readings, hr } = await connectAndCapture()
      const buf = new ArrayBuffer(2)
      const dv = new DataView(buf)
      dv.setUint8(0, 0x00)
      dv.setUint8(1, 78)
      hr()(dv)
      expect(readings[0].heartRate).toBe(78)
    })

    it('parses a uint16 heart rate value (flags bit 0 = 1)', async () => {
      const { readings, hr } = await connectAndCapture()
      const buf = new ArrayBuffer(3)
      const dv = new DataView(buf)
      dv.setUint8(0, 0x01)
      dv.setUint16(1, 350, true)
      hr()(dv)
      expect(readings[0].heartRate).toBe(350)
    })

    it('ignores an HR payload that is too short', async () => {
      const { readings, hr } = await connectAndCapture()
      const dv = new DataView(new ArrayBuffer(1))
      hr()(dv)
      expect(readings).toEqual([])
    })

    it('parses SpO2 SFLOAT with a whole-percent mantissa and exponent=0', async () => {
      const { readings, spo2 } = await connectAndCapture()
      const buf = new ArrayBuffer(5)
      const dv = new DataView(buf)
      dv.setUint16(3, 0x0061, true) // SFLOAT(97): mantissa=97, exponent=0
      spo2()(dv)
      expect(readings[0].spO2).toBe(97)
    })

    it('drops SpO2 values outside [50, 100]', async () => {
      const { readings, spo2 } = await connectAndCapture()
      const buf = new ArrayBuffer(5)
      const dv = new DataView(buf)
      dv.setUint16(3, 200, true) // 200% is out of range
      spo2()(dv)
      expect(readings).toEqual([])
    })
  })

  describe('disconnect', () => {
    it('is safe when the plugin was never available', async () => {
      pluginAvailable = false
      const svc = loadService()
      await expect(svc.disconnect()).resolves.toBeUndefined()
      expect(svc.getStatus()).toBe('idle')
    })

    it('stops notifications and disconnects the device', async () => {
      currentClient = buildClient()
      currentClient.requestLEScan.mockImplementation(async (_opts: any, cb: any) => {
        cb({ device: { deviceId: 'X' } })
      })
      const svc = loadService()
      await svc.scanAndConnect()
      await svc.disconnect()
      expect(currentClient.stopNotifications).toHaveBeenCalledTimes(2)
      expect(currentClient.disconnect).toHaveBeenCalledWith('X')
      expect(svc.getStatus()).toBe('idle')
    })
  })

  it('supports onStatus/onReading unsubscribers', async () => {
    currentClient = buildClient()
    currentClient.requestLEScan.mockImplementation(async (_opts: any, cb: any) => {
      cb({ device: { deviceId: 'X' } })
    })
    const svc = loadService()
    const cb = jest.fn()
    const off = svc.onStatus(cb)
    off()
    await svc.scanAndConnect()
    expect(cb).not.toHaveBeenCalled()
  })
})
