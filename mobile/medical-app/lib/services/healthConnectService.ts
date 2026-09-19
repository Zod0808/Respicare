"use client"

/**
 * Health Connect Service — Android 14+
 *
 * Lee datos reales de frecuencia cardíaca y SpO2 desde Health Connect API.
 * Compatible con: Samsung Galaxy Watch, Pixel Watch, Fitbit (Android 14+),
 *                Garmin (vía Health Connect), y cualquier wearable que
 *                sincronice con Health Connect.
 *
 * Usa el plugin real `capacitor-health-connect` (https://github.com/ubie-oss/capacitor-health-connect),
 * registrado bajo el nombre nativo "HealthConnect". Requiere que el dispositivo
 * tenga instalada la app "Health Connect" de Google y que el usuario haya
 * concedido permisos de lectura de FC, SpO2 y pasos.
 *
 * En dispositivos sin Health Connect, con permisos denegados, o en web (donde
 * el plugin nativo no está implementado), los métodos retornan null y el
 * sistema usará el EmuladorSensorService como fallback.
 */

import type { SensorReading } from './emulatorSensors'
import { HealthConnect } from 'capacitor-health-connect'
import type { HealthConnectPlugin, RecordType } from 'capacitor-health-connect'

// `StoredRecord` isn't exported by the plugin — derive it from readRecords' own return type.
type StoredRecord = Awaited<ReturnType<HealthConnectPlugin['readRecords']>>['records'][number]

const READ_TYPES: RecordType[] = ['HeartRateSeries', 'OxygenSaturation', 'Steps']

export class HealthConnectService {
  private _available: boolean | null = null
  private _permissionsGranted = false

  /** Verifica si Health Connect está disponible en este dispositivo */
  async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available
    try {
      const { availability } = await HealthConnect.checkAvailability()
      this._available = availability === 'Available'
    } catch {
      this._available = false
    }
    return this._available
  }

  /** Solicita permisos de lectura de salud al usuario */
  async requestPermissions(): Promise<boolean> {
    if (!(await this.isAvailable())) return false
    try {
      const { hasAllPermissions } = await HealthConnect.requestHealthPermissions({
        read: READ_TYPES,
        write: [],
      })
      this._permissionsGranted = hasAllPermissions
      return hasAllPermissions
    } catch {
      return false
    }
  }

  /**
   * Lee la lectura más reciente de FC, SpO2 y pasos de los últimos `windowMinutes`.
   * Retorna null si Health Connect no está disponible o sin permisos.
   */
  async getLatestReading(windowMinutes = 5): Promise<SensorReading | null> {
    if (!(await this.isAvailable())) return null
    if (!this._permissionsGranted && !(await this.requestPermissions())) return null

    const endTime = new Date()
    const startTime = new Date(Date.now() - windowMinutes * 60_000)
    const timeRangeFilter = { type: 'between' as const, startTime, endTime }

    try {
      const [hrResult, spo2Result, stepsResult] = await Promise.allSettled([
        HealthConnect.readRecords({ type: 'HeartRateSeries', timeRangeFilter }),
        HealthConnect.readRecords({ type: 'OxygenSaturation', timeRangeFilter }),
        HealthConnect.readRecords({ type: 'Steps', timeRangeFilter }),
      ])

      const heartRate = latestHeartRate(hrResult)
      const spO2 = latestOxygenSaturation(spo2Result)
      const steps = totalSteps(stepsResult)

      if (heartRate === null && spO2 === null) return null

      return {
        heartRate: heartRate ?? 0,
        spO2: spO2 ?? 0,
        steps: steps ?? 0,
        lastSync: endTime.toISOString(),
        provider: 'Health Connect',
        scenario: undefined,
      }
    } catch {
      return null
    }
  }
}

function latestHeartRate(result: PromiseSettledResult<{ records: StoredRecord[] }>): number | null {
  if (result.status !== 'fulfilled') return null
  const samples = result.value.records
    .filter((r): r is Extract<StoredRecord, { type: 'HeartRateSeries' }> => r.type === 'HeartRateSeries')
    .flatMap((r) => r.samples)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  return samples.length > 0 ? samples[samples.length - 1].beatsPerMinute : null
}

function latestOxygenSaturation(result: PromiseSettledResult<{ records: StoredRecord[] }>): number | null {
  if (result.status !== 'fulfilled') return null
  const records = result.value.records
    .filter((r): r is Extract<StoredRecord, { type: 'OxygenSaturation' }> => r.type === 'OxygenSaturation')
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  return records.length > 0 ? records[records.length - 1].percentage.value : null
}

function totalSteps(result: PromiseSettledResult<{ records: StoredRecord[] }>): number | null {
  if (result.status !== 'fulfilled') return null
  return result.value.records
    .filter((r): r is Extract<StoredRecord, { type: 'Steps' }> => r.type === 'Steps')
    .reduce((acc, r) => acc + r.count, 0)
}

export const healthConnect = new HealthConnectService()
