/**
 * Tests for lib/services/emulatorSensors — deterministic-ish sensor simulation
 * based on Ornstein-Uhlenbeck drift. Math.random is stubbed to eliminate
 * flakiness while still exercising the full read path.
 */

import { EmulatorSensorService } from '@/lib/services/emulatorSensors'

const withRandom = (values: number[], fn: () => void) => {
  const orig = Math.random
  let i = 0
  Math.random = () => values[i++ % values.length]
  try {
    fn()
  } finally {
    Math.random = orig
  }
}

describe('EmulatorSensorService', () => {
  let svc: EmulatorSensorService

  beforeEach(() => {
    svc = new EmulatorSensorService()
  })

  describe('init', () => {
    it('populates a baseline reading with the provided values', () => {
      svc.init({ heartRate: 80, spO2: 96, steps: 1234, provider: 'Test' })
      expect(svc.current).toMatchObject({
        heartRate: 80,
        spO2: 96,
        steps: 1234,
        provider: 'Test',
      })
    })

    it('uses sensible defaults when fields are missing', () => {
      svc.init({})
      expect(svc.current?.heartRate).toBe(78)
      expect(svc.current?.spO2).toBe(97)
      expect(svc.current?.steps).toBe(4000)
      expect(svc.current?.provider).toBe('Android Virtual Sensor')
    })
  })

  describe('applyScenario', () => {
    it('sets the target scenario values and preserves accumulated steps', () => {
      svc.init({ steps: 2500 })
      const r = svc.applyScenario('exercise')
      expect(r.heartRate).toBe(145)
      expect(r.spO2).toBe(96)
      expect(r.scenario).toBe('exercise')
      expect(r.steps).toBe(2500)
    })

    it('supports every predefined scenario', () => {
      svc.init({})
      expect(svc.applyScenario('rest').heartRate).toBe(62)
      expect(svc.applyScenario('active').heartRate).toBe(88)
      expect(svc.applyScenario('exercise').heartRate).toBe(145)
      expect(svc.applyScenario('alert_spo2').spO2).toBe(88)
    })
  })

  describe('tick', () => {
    it('drifts toward the scenario mean and clamps to physiological bounds', () => {
      svc.init({ heartRate: 60, spO2: 97, steps: 1000 })
      svc.applyScenario('rest')
      withRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
        // With random = 0.5 the noise term is 0; the reading should sit inside bounds.
        const r = svc.tick()
        expect(r.heartRate).toBeGreaterThanOrEqual(45)
        expect(r.heartRate).toBeLessThanOrEqual(200)
        expect(r.spO2).toBeGreaterThanOrEqual(80)
        expect(r.spO2).toBeLessThanOrEqual(100)
      })
    })

    it('increments accumulated steps monotonically over ticks', () => {
      svc.init({ steps: 0 })
      svc.applyScenario('exercise')
      let prev = 0
      withRandom([0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9], () => {
        for (let i = 0; i < 4; i++) {
          const r = svc.tick()
          expect(r.steps).toBeGreaterThanOrEqual(prev)
          prev = r.steps
        }
      })
      expect(prev).toBeGreaterThan(0)
    })

    it('adds very few steps in "rest" mode', () => {
      svc.init({ steps: 0 })
      svc.applyScenario('rest')
      withRandom([0.5, 0.5, 0.5, 0.5], () => {
        const r = svc.tick()
        // rest: 0..1 steps/tick.
        expect(r.steps).toBeLessThanOrEqual(1)
      })
    })

    it('tags each reading with the current scenario', () => {
      svc.init({})
      svc.applyScenario('alert_spo2')
      const r = svc.tick()
      expect(r.scenario).toBe('alert_spo2')
    })
  })

  describe('subscribe', () => {
    it('notifies listeners on applyScenario and tick, and stops after cleanup', () => {
      const cb = jest.fn()
      const off = svc.subscribe(cb)
      svc.init({})
      svc.applyScenario('active') // fire 1
      svc.tick()                  // fire 2
      expect(cb).toHaveBeenCalledTimes(2)
      off()
      svc.tick()
      expect(cb).toHaveBeenCalledTimes(2)
    })
  })
})
