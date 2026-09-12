/**
 * Nombre de Objeto: institutionalReportJobs
 * Fecha de Creación: 2026-09-12
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-010 - Reportes y estadísticas (extensión de interoperabilidad
 * institucional del Sprint 13, RF de exportación epidemiológica MINSA/SINADEF)
 * Descripción: Job programado que envía diariamente el reporte epidemiológico
 * agregado a SINADEF vía institutionalIntegrationService.sendAutomaticReportToSinadef,
 * sin bloquear el arranque del servidor si SINADEF no está configurado o falla.
 *
 * Institutional Report Jobs
 * Envío automático diario del reporte epidemiológico a SINADEF
 */

import cron from 'node-cron';
import { institutionalIntegrationService } from '../services/institutionalIntegrationService';
import { logger } from '../utils/logger';

let sinadefReportJob: cron.ScheduledTask | null = null;

const safelyRun = async (taskName: string, task: () => Promise<void>) => {
  try {
    await task();
    logger.info(`✅ Job institucional ejecutado exitosamente: ${taskName}`);
  } catch (error) {
    logger.error(`❌ Error ejecutando job institucional (${taskName})`, { error });
  }
};

/**
 * Inicia el job de envío automático del reporte epidemiológico a SINADEF.
 */
export const startInstitutionalReportJobs = (): void => {
  if (sinadefReportJob) {
    logger.warn('Job de reporte automático a SINADEF ya está en ejecución');
    return;
  }

  // Envío diario a las 06:00 (antes del inicio de la jornada de las autoridades sanitarias)
  sinadefReportJob = cron.schedule(
    '0 6 * * *',
    () => {
      void safelyRun('sinadefAutomaticReport', async () => {
        logger.info('🔄 Iniciando envío automático del reporte epidemiológico a SINADEF');
        await institutionalIntegrationService.sendAutomaticReportToSinadef();
      });
    },
    {
      scheduled: true,
      timezone: 'America/Lima',
    }
  );

  logger.info('⏱️ Job de reporte automático a SINADEF iniciado (diario 06:00, America/Lima)');
};

/**
 * Detiene el job de envío automático a SINADEF.
 */
export const stopInstitutionalReportJobs = (): void => {
  if (sinadefReportJob) {
    sinadefReportJob.stop();
    sinadefReportJob = null;
    logger.info('🛑 Job de reporte automático a SINADEF detenido');
  }
};

/**
 * Ejecuta el envío del reporte a SINADEF de forma manual (testing o bajo demanda).
 */
export const runInstitutionalReportManually = async (days?: number) => {
  logger.info('🔄 Ejecutando envío manual del reporte epidemiológico a SINADEF');
  return institutionalIntegrationService.sendAutomaticReportToSinadef(days);
};
