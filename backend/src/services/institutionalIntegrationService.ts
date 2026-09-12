/**
 * Institutional Integration Service (Sprint 13)
 *
 * Lógica de negocio para el API de interoperabilidad institucional consumido
 * por MINSA/DIRESA Tacna y SINADEF: exportación epidemiológica agregada,
 * sincronización del catálogo de centros de salud y recepción de alertas
 * sanitarias regionales para su distribución interna.
 */

import HealthCenterModel, { HealthCenterType } from '../models/HealthCenter';
import UserModel from '../models/User';
import AlertModel from '../models/Alert';
import { AlertPriority } from '../types';
import { epidemiologicalService } from './epidemiologicalService';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export interface ExternalHealthCenterInput {
  name: string;
  type: HealthCenterType;
  address: string;
  district: string;
  phone?: string;
  hasEmergencyServices?: boolean;
  hasRespiratoryCare?: boolean;
  latitude: number;
  longitude: number;
}

export interface HealthCenterSyncResult {
  created: number;
  updated: number;
  errors: Array<{ name: string; error: string }>;
}

export interface ExternalAlertInput {
  title: string;
  message: string;
  priority?: AlertPriority;
  district?: string;
  referenceId?: string;
}

export interface InstitutionalClientContext {
  id: string;
  name: string;
}

const VALID_HEALTH_CENTER_TYPES: HealthCenterType[] = ['hospital', 'centro_salud', 'posta_medica', 'clinica'];

class InstitutionalIntegrationService {
  /**
   * Exportación epidemiológica agregada a nivel de distrito, reutilizando el
   * mismo análisis usado por el panel de analítica interno (RF de tendencias
   * y detección de brotes), sin exponer datos clínicos individuales.
   */
  async getEpidemiologicalExport(options: { days?: number } = {}) {
    const days = options.days && options.days > 0 ? options.days : 30;

    const [districtTrends, outbreaks] = await Promise.all([
      epidemiologicalService.getDistrictTrends({ days }),
      epidemiologicalService.predictOutbreaks(),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      source: 'RespiCare',
      coverage: 'Tacna',
      periodDays: days,
      districtTrends,
      outbreakAlerts: outbreaks.filter((outbreak) => outbreak.riskLevel !== 'stable'),
    };
  }

  /**
   * Sincroniza (upsert por nombre+distrito) el catálogo de centros de salud
   * enviado por MINSA/DIRESA, sin bloquear el lote completo ante errores en
   * registros individuales.
   */
  async syncHealthCenters(centers: ExternalHealthCenterInput[]): Promise<HealthCenterSyncResult> {
    if (!Array.isArray(centers) || centers.length === 0) {
      throw new AppError('Se requiere un arreglo "centers" no vacío', 400);
    }

    const result: HealthCenterSyncResult = { created: 0, updated: 0, errors: [] };

    for (const center of centers) {
      try {
        this.validateHealthCenterInput(center);

        const filter = { name: center.name, district: center.district };
        const update = {
          name: center.name,
          type: center.type,
          address: center.address,
          district: center.district,
          phone: center.phone,
          hasEmergencyServices: !!center.hasEmergencyServices,
          hasRespiratoryCare: !!center.hasRespiratoryCare,
          isActive: true,
          location: { type: 'Point' as const, coordinates: [center.longitude, center.latitude] as [number, number] },
        };

        const existing = await HealthCenterModel.findOne(filter);
        if (existing) {
          await HealthCenterModel.updateOne(filter, update);
          result.updated += 1;
        } else {
          await HealthCenterModel.create(update);
          result.created += 1;
        }
      } catch (error: any) {
        result.errors.push({ name: center?.name ?? 'desconocido', error: error.message });
      }
    }

    logger.info('Sincronización institucional de centros de salud completada', result);
    return result;
  }

  private validateHealthCenterInput(center: ExternalHealthCenterInput): void {
    if (!center || typeof center !== 'object') {
      throw new Error('Registro de centro de salud inválido');
    }
    if (!center.name || !center.district || !center.address) {
      throw new Error('name, address y district son obligatorios');
    }
    if (!VALID_HEALTH_CENTER_TYPES.includes(center.type)) {
      throw new Error(`type debe ser uno de: ${VALID_HEALTH_CENTER_TYPES.join(', ')}`);
    }
    if (
      typeof center.latitude !== 'number' ||
      typeof center.longitude !== 'number' ||
      Number.isNaN(center.latitude) ||
      Number.isNaN(center.longitude)
    ) {
      throw new Error('latitude y longitude son obligatorios y deben ser numéricos');
    }
  }

  /**
   * Distribuye una alerta sanitaria emitida por una autoridad externa
   * (MINSA/SINADEF) hacia el personal médico/administrativo activo,
   * ya que el modelo Alert está diseñado como notificación por usuario y no
   * admite un broadcast regional único.
   */
  async ingestExternalAlert(payload: ExternalAlertInput, client: InstitutionalClientContext) {
    if (!payload?.title || !payload?.message) {
      throw new AppError('title y message son obligatorios', 400);
    }

    const recipients = await UserModel.find({ role: { $in: ['doctor', 'admin'] }, isActive: true })
      .select('_id')
      .lean();

    if (recipients.length === 0) {
      logger.warn('Alerta institucional externa recibida sin destinatarios activos (doctor/admin)', {
        clientId: client.id,
      });
    }

    const priority: AlertPriority = payload.priority ?? 'high';

    await Promise.all(
      recipients.map((recipient) =>
        AlertModel.create({
          userId: String(recipient._id),
          title: payload.title,
          message: payload.message,
          category: 'health_authority',
          priority,
          channels: ['in_app', 'push'],
          trigger: {
            source: 'external_health_authority',
            referenceId: payload.referenceId,
            metadata: {
              institutionalClientId: client.id,
              institutionalClientName: client.name,
              district: payload.district,
            },
          },
          tags: payload.district ? ['minsa', payload.district] : ['minsa'],
        })
      )
    );

    logger.info('Alerta institucional externa distribuida', {
      clientId: client.id,
      recipients: recipients.length,
    });

    return { distributedTo: recipients.length };
  }
}

export const institutionalIntegrationService = new InstitutionalIntegrationService();
export default institutionalIntegrationService;
