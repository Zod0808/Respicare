/**
 * Nombre de Objeto: vitalsEmitter
 * Fecha de Creación: 2026-05-07
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-007 - Panel del doctor
 * Descripción: Bus de eventos singleton que conecta wearableSocketHandler
 * (emisor de lecturas de wearables) con doctorSocketHandler (consumidor que
 * retransmite las lecturas al panel del doctor en tiempo real).
 */
import { EventEmitter } from 'events';

export interface VitalsReading {
  patientId: string;
  heartRate?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  steps?: number;
  timestamp: string;
}

// Singleton bus: wearableSocketHandler emits here,
// doctorSocketHandler listens here.
export const vitalsEmitter = new EventEmitter();
vitalsEmitter.setMaxListeners(100);
