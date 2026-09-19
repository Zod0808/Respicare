"use client"

/**
 * HealthKit Service — iOS
 *
 * Lee datos reales de frecuencia cardíaca, SpO2 y pasos desde Apple HealthKit.
 * Compatible con: Apple Watch y cualquier wearable que sincronice con la app
 *                Salud de iOS.
 *
 * Usa el plugin real `@perfood/capacitor-healthkit`, registrado nativamente
 * como "CapacitorHealthkit". Requiere que el usuario haya concedido acceso de
 * lectura a Frecuencia cardíaca, Oxígeno en sangre y Pasos en la app Salud.
 *
 * Por diseño de privacidad de Apple, `requestAuthorization` nunca informa si
 * el usuario concedió o denegó el acceso — si fue denegado, las consultas
 * simplemente devuelven arrays vacíos, y este servicio degrada a null.
 *
 * En dispositivos no-iOS o en web (donde el plugin nativo no está
 * implementado), los métodos retornan null y el sistema usará el
 * EmuladorSensorService como fallback.
 */

import type { SensorReading } from './emulatorSensors'
import { CapacitorHealthkit, SampleNames } from '@perfood/capacitor-healthkit'
import type { OtherData, QueryOutput } from '@perfood/capacitor-healthkit'

const READ_SAMPLES: string[] = [SampleNames.HEART_RATE, SampleNames.OXYGEN_SATURATION, SampleNames.STEP_COUNT]

export class HealthKitService {
  private _available: boolean | null = null
  private _permissionsGranted = false

  /** Verifica si HealthKit está disponible en este dispositivo (iOS con Salud instalada) */
  async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available
    try {
      await CapacitorHealthkit.isAvailable()
      this._available = true
    } catch {
      this._available = false
    }
    return this._available
  }

  /** Solicita permisos de lectura de salud al usuario */
  async requestPermissions(): Promise<boolean> {
    if (!(await this.isAvailable())) return false
    try {
      await CapacitorHealthkit.requestAuthorization({ read: READ_SAMPLES, write: [], all: [] })
      // Apple nunca informa si el usuario aceptó o rechazó el diálogo: si fue
      // rechazado, las consultas posteriores simplemente devuelven arrays vacíos.
      this._permissionsGranted = true
      return true
    } catch {
      return false
    }
  }

  /**
   * Lee la lectura más reciente de FC, SpO2 y pasos de los últimos `windowMinutes`.
   * Retorna null si HealthKit no está disponible, sin permisos, o sin datos.
   */
  async getLatestReading(windowMinutes = 5): Promise<SensorReading | null> {
    if (!(await this.isAvailable())) return null
    if (!this._permissionsGranted && !(await this.requestPermissions())) return null

    const endDate = new Date()
    const startDate = new Date(Date.now() - windowMinutes * 60_000)
    const range = { startDate: startDate.toISOString(), endDate: endDate.toISOString() }

    try {
      const [hrResult, spo2Result, stepsResult] = await Promise.allSettled([
        CapacitorHealthkit.queryHKitSampleType<OtherData>({ sampleName: SampleNames.HEART_RATE, ...range, limit: 50 }),
        CapacitorHealthkit.queryHKitSampleType<OtherData>({ sampleName: SampleNames.OXYGEN_SATURATION, ...range, limit: 50 }),
        CapacitorHealthkit.queryHKitSampleType<OtherData>({ sampleName: SampleNames.STEP_COUNT, ...range, limit: 500 }),
      ])

      const heartRate = latestValue(hrResult)
      const spO2Raw = latestValue(spo2Result)
      const spO2 = spO2Raw !== null ? normalizeSpO2(spO2Raw) : null
      const steps = totalValue(stepsResult)

      if (heartRate === null && spO2 === null) return null

      return {
        heartRate: heartRate ?? 0,
        spO2: spO2 ?? 0,
        steps: steps ?? 0,
        lastSync: endDate.toISOString(),
        provider: 'Apple Health',
        scenario: undefined,
      }
    } catch {
      return null
    }
  }
}

function latestValue(result: PromiseSettledResult<QueryOutput<OtherData>>): number | null {
  if (result.status !== 'fulfilled') return null
  const sorted = [...result.value.resultData].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )
  return sorted.length > 0 ? sorted[sorted.length - 1].value : null
}

function totalValue(result: PromiseSettledResult<QueryOutput<OtherData>>): number | null {
  if (result.status !== 'fulfilled') return null
  return result.value.resultData.reduce((acc, r) => acc + r.value, 0)
}

// HealthKit reporta SpO2 como fracción (0-1) en la mayoría de fuentes; RespiCare
// trabaja con porcentaje (0-100) en todo el resto del pipeline de vitales.
function normalizeSpO2(value: number): number {
  return value <= 1 ? value * 100 : value
}

export const healthKit = new HealthKitService()
