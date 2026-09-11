/**
 * Tests for lib/services/notificationService (Push/Local Notifications wrapper).
 *
 * The service dynamically imports @capacitor/local-notifications and gates
 * behaviour on window.Capacitor.isNativePlatform(). Each test reloads the
 * module via jest.isolateModulesAsync to reset the internal _initialized flag
 * and monotonically-incrementing notification IDs.
 */

const mockLN = {
  requestPermissions: jest.fn(),
  createChannel: jest.fn().mockResolvedValue(undefined),
  addListener: jest.fn().mockResolvedValue(undefined),
  schedule: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn().mockResolvedValue(undefined),
  getPending: jest.fn(),
}

jest.mock('@capacitor/local-notifications', () => ({
  __esModule: true,
  LocalNotifications: mockLN,
}))

type NotifSvc = typeof import('@/lib/services/notificationService').NotificationService

const loadService = async (): Promise<NotifSvc> => {
  let svc!: NotifSvc
  await jest.isolateModulesAsync(async () => {
    const mod = await import('@/lib/services/notificationService')
    svc = mod.NotificationService
  })
  return svc
}

const setNative = (native: boolean) => {
  Object.defineProperty(window, 'Capacitor', {
    value: { isNativePlatform: () => native },
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockLN.requestPermissions.mockResolvedValue({ display: 'granted' })
  mockLN.getPending.mockResolvedValue({ notifications: [] })
  // Silence expected warnings/errors from the service.
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  ;(console.warn as jest.Mock).mockRestore?.()
  ;(console.error as jest.Mock).mockRestore?.()
  delete (window as any).Capacitor
})

describe('NotificationService', () => {
  describe('init', () => {
    it('returns false when not running on a native platform', async () => {
      setNative(false)
      const svc = await loadService()
      await expect(svc.init()).resolves.toBe(false)
      expect(mockLN.requestPermissions).not.toHaveBeenCalled()
    })

    it('creates all channels and registers tap listener on native + granted', async () => {
      setNative(true)
      const svc = await loadService()
      await expect(svc.init()).resolves.toBe(true)
      expect(mockLN.requestPermissions).toHaveBeenCalledTimes(1)
      // Three Android channels: alerts, reminders, sync.
      expect(mockLN.createChannel).toHaveBeenCalledTimes(3)
      expect(mockLN.addListener).toHaveBeenCalledWith(
        'localNotificationActionPerformed',
        expect.any(Function),
      )
    })

    it('is idempotent — a second init() does not re-request permissions', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.init()
      await svc.init()
      expect(mockLN.requestPermissions).toHaveBeenCalledTimes(1)
      expect(mockLN.createChannel).toHaveBeenCalledTimes(3)
    })

    it('returns false when the user denies permission', async () => {
      setNative(true)
      mockLN.requestPermissions.mockResolvedValue({ display: 'denied' })
      const svc = await loadService()
      await expect(svc.init()).resolves.toBe(false)
      expect(mockLN.createChannel).not.toHaveBeenCalled()
    })

    it('returns false and logs when the underlying plugin throws', async () => {
      setNative(true)
      mockLN.requestPermissions.mockRejectedValue(new Error('boom'))
      const svc = await loadService()
      await expect(svc.init()).resolves.toBe(false)
    })

    it('dispatches a notification:tapped CustomEvent when the listener fires', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.init()
      const [, cb] = mockLN.addListener.mock.calls[0]
      const received: any[] = []
      window.addEventListener('notification:tapped', (e: any) => received.push(e.detail))
      cb({ notification: { id: 42, title: 'x' } })
      expect(received[0]).toEqual({ id: 42, title: 'x' })
    })
  })

  describe('sendAlert', () => {
    it('warns and returns null on the web (non-native) fallback', async () => {
      setNative(false)
      const svc = await loadService()
      const id = await svc.sendAlert({ title: 't', body: 'b', urgency: 'critical' })
      expect(id).toBeNull()
      expect(mockLN.schedule).not.toHaveBeenCalled()
    })

    it('schedules an alert with the alerts channel and returns its id', async () => {
      setNative(true)
      const svc = await loadService()
      const id = await svc.sendAlert({ title: 'Fiebre', body: '39ºC', urgency: 'critical' })
      expect(id).toBe(1000)
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.channelId).toBe('respicare-alerts')
      expect(arg.ongoing).toBe(true)
      expect(arg.autoCancel).toBe(false)
      expect(arg.iconColor).toBe('#FF3B30')
    })

    it('sets autoCancel=true and non-red icon for non-critical alerts', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.sendAlert({ title: 't', body: 'b', urgency: 'high' })
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.autoCancel).toBe(true)
      expect(arg.ongoing).toBe(false)
      expect(arg.iconColor).toBe('#FF9500')
    })

    it('increments IDs across consecutive alerts', async () => {
      setNative(true)
      const svc = await loadService()
      const a = await svc.sendAlert({ title: 'a', body: 'a' })
      const b = await svc.sendAlert({ title: 'b', body: 'b' })
      expect(b).toBe((a as number) + 1)
    })

    it('returns null when init fails (permission denied)', async () => {
      setNative(true)
      mockLN.requestPermissions.mockResolvedValue({ display: 'denied' })
      const svc = await loadService()
      await expect(svc.sendAlert({ title: 't', body: 'b' })).resolves.toBeNull()
    })

    it('returns null when schedule throws', async () => {
      setNative(true)
      mockLN.schedule.mockRejectedValueOnce(new Error('sched fail'))
      const svc = await loadService()
      await expect(svc.sendAlert({ title: 't', body: 'b' })).resolves.toBeNull()
    })
  })

  describe('scheduleReminder', () => {
    it('returns null on non-native', async () => {
      setNative(false)
      const svc = await loadService()
      await expect(
        svc.scheduleReminder({ title: 't', body: 'b', at: new Date() }),
      ).resolves.toBeNull()
    })

    it('schedules with the reminders channel and returns id starting at 2000', async () => {
      setNative(true)
      const svc = await loadService()
      const at = new Date(Date.now() + 60_000)
      const id = await svc.scheduleReminder({ title: 't', body: 'b', at })
      expect(id).toBe(2000)
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.channelId).toBe('respicare-reminders')
      expect(arg.schedule.at).toBe(at)
      expect(arg.schedule.repeats).toBe(false)
    })

    it('forwards repeats/every options', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.scheduleReminder({
        title: 't', body: 'b', at: new Date(), repeats: true, every: 'day',
      })
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.schedule.repeats).toBe(true)
      expect(arg.schedule.every).toBe('day')
    })

    it('returns null when schedule throws', async () => {
      setNative(true)
      mockLN.schedule.mockRejectedValueOnce(new Error('x'))
      const svc = await loadService()
      await expect(
        svc.scheduleReminder({ title: 't', body: 'b', at: new Date() }),
      ).resolves.toBeNull()
    })
  })

  describe('scheduleMedicationReminder', () => {
    it('schedules a daily repeating reminder tagged as medication', async () => {
      setNative(true)
      const svc = await loadService()
      // Past hour → should roll to tomorrow.
      const now = new Date()
      const pastHour = now.getHours() === 0 ? 23 : now.getHours() - 1
      const id = await svc.scheduleMedicationReminder('Salbutamol', pastHour, 0)
      expect(id).toBeGreaterThanOrEqual(2000)
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.schedule.repeats).toBe(true)
      expect(arg.schedule.every).toBe('day')
      expect(arg.extra).toEqual({ type: 'medication', name: 'Salbutamol' })
      // Rolled to tomorrow: at > now.
      expect((arg.schedule.at as Date).getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('scheduleAppointmentReminder', () => {
    it('subtracts minutesBefore and tags as appointment', async () => {
      setNative(true)
      const svc = await loadService()
      const appt = new Date(Date.now() + 60 * 60 * 1000) // 60 min ahead
      await svc.scheduleAppointmentReminder('Dr. Ruiz', appt, 30)
      const arg = mockLN.schedule.mock.calls[0][0].notifications[0]
      expect(arg.extra).toEqual({ type: 'appointment', doctor: 'Dr. Ruiz' })
      // 30 min before the appt.
      expect((arg.schedule.at as Date).getTime()).toBe(appt.getTime() - 30 * 60 * 1000)
    })
  })

  describe('cancelNotification / cancelAll', () => {
    it('cancelNotification is a no-op on the web', async () => {
      setNative(false)
      const svc = await loadService()
      await svc.cancelNotification(1234)
      expect(mockLN.cancel).not.toHaveBeenCalled()
    })

    it('cancelNotification passes the id through on native', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.cancelNotification(1234)
      expect(mockLN.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1234 }] })
    })

    it('cancelNotification swallows errors', async () => {
      setNative(true)
      mockLN.cancel.mockRejectedValueOnce(new Error('x'))
      const svc = await loadService()
      await expect(svc.cancelNotification(1)).resolves.toBeUndefined()
    })

    it('cancelAll cancels every pending notification', async () => {
      setNative(true)
      mockLN.getPending.mockResolvedValue({
        notifications: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
      const svc = await loadService()
      await svc.cancelAll()
      expect(mockLN.cancel).toHaveBeenCalledWith({
        notifications: [{ id: 1 }, { id: 2 }, { id: 3 }],
      })
    })

    it('cancelAll skips the cancel call when there are no pending', async () => {
      setNative(true)
      const svc = await loadService()
      await svc.cancelAll()
      expect(mockLN.cancel).not.toHaveBeenCalled()
    })

    it('cancelAll is a no-op on the web', async () => {
      setNative(false)
      const svc = await loadService()
      await svc.cancelAll()
      expect(mockLN.getPending).not.toHaveBeenCalled()
    })
  })
})
