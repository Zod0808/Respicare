/**
 * Integration tests for the institutional interoperability API (Sprint 13)
 * Consumed by MINSA/DIRESA Tacna and SINADEF via API key (X-API-Key header).
 */

import request from 'supertest';
import app from '../../src/index';
import { testUtils } from '../setup';
import InstitutionalApiClient, { InstitutionalApiScope } from '../../src/models/InstitutionalApiClient';
import UserModel from '../../src/models/User';
import AlertModel from '../../src/models/Alert';

describe('Institutional API Integration', () => {
  const createClient = async (scopes: InstitutionalApiScope[]) => {
    const { key, keyPrefix } = InstitutionalApiClient.generateKey();
    const keyHash = await InstitutionalApiClient.hashKey(key);
    await InstitutionalApiClient.create({
      name: 'MINSA DIRESA Tacna',
      keyPrefix,
      keyHash,
      scopes,
      isActive: true,
    });
    return key;
  };

  beforeEach(async () => {
    await testUtils.cleanTestData();
  });

  describe('Autenticación por API key', () => {
    it('retorna 401 sin header X-API-Key', async () => {
      await request(app).get('/api/v1/institutional/epidemiological-export').expect(401);
    });

    it('retorna 401 con una API key inválida', async () => {
      await request(app)
        .get('/api/v1/institutional/epidemiological-export')
        .set('X-API-Key', 'rcinst_no-existe-0000000000000000000000000000000000000000000000000000')
        .expect(401);
    });

    it('retorna 401 cuando el cliente está inactivo', async () => {
      const { key, keyPrefix } = InstitutionalApiClient.generateKey();
      const keyHash = await InstitutionalApiClient.hashKey(key);
      await InstitutionalApiClient.create({
        name: 'Cliente inactivo',
        keyPrefix,
        keyHash,
        scopes: ['epidemiological:read'],
        isActive: false,
      });

      await request(app)
        .get('/api/v1/institutional/epidemiological-export')
        .set('X-API-Key', key)
        .expect(401);
    });

    it('retorna 403 cuando el cliente no tiene el scope requerido', async () => {
      const key = await createClient(['alerts:write']);

      await request(app)
        .get('/api/v1/institutional/epidemiological-export')
        .set('X-API-Key', key)
        .expect(403);
    });
  });

  describe('GET /api/v1/institutional/epidemiological-export', () => {
    it('retorna la exportación epidemiológica agregada con scope válido', async () => {
      const key = await createClient(['epidemiological:read']);

      const response = await request(app)
        .get('/api/v1/institutional/epidemiological-export')
        .set('X-API-Key', key)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          source: 'RespiCare',
          coverage: 'Tacna',
          districtTrends: expect.any(Array),
          outbreakAlerts: expect.any(Array),
        })
      );
    });
  });

  describe('POST /api/v1/institutional/health-centers/sync', () => {
    it('crea centros de salud nuevos con scope válido', async () => {
      const key = await createClient(['health-centers:write']);

      const response = await request(app)
        .post('/api/v1/institutional/health-centers/sync')
        .set('X-API-Key', key)
        .send({
          centers: [
            {
              name: 'Posta Médica de Prueba',
              type: 'posta_medica',
              address: 'Calle Falsa 123',
              district: 'Tacna',
              latitude: -18.0114,
              longitude: -70.2444,
            },
          ],
        })
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({ created: 1, updated: 0, errors: [] })
      );
    });

    it('reporta errores por registro sin bloquear el lote', async () => {
      const key = await createClient(['health-centers:write']);

      const response = await request(app)
        .post('/api/v1/institutional/health-centers/sync')
        .set('X-API-Key', key)
        .send({
          centers: [
            { name: 'Incompleto' },
            {
              name: 'Centro Válido',
              type: 'centro_salud',
              address: 'Av. Siempre Viva 742',
              district: 'Tacna',
              latitude: -18.01,
              longitude: -70.24,
            },
          ],
        })
        .expect(200);

      expect(response.body.data.created).toBe(1);
      expect(response.body.data.errors).toHaveLength(1);
    });

    it('retorna 400 cuando "centers" está vacío', async () => {
      const key = await createClient(['health-centers:write']);

      await request(app)
        .post('/api/v1/institutional/health-centers/sync')
        .set('X-API-Key', key)
        .send({ centers: [] })
        .expect(400);
    });
  });

  describe('POST /api/v1/institutional/alerts', () => {
    it('distribuye la alerta a doctores y admins activos', async () => {
      const key = await createClient(['alerts:write']);

      await UserModel.create({
        name: 'Dr. Activo',
        email: 'doctor.activo@example.com',
        password: 'Password123!',
        role: 'doctor',
        isActive: true,
      });
      await UserModel.create({
        name: 'Admin Inactivo',
        email: 'admin.inactivo@example.com',
        password: 'Password123!',
        role: 'admin',
        isActive: false,
      });

      const response = await request(app)
        .post('/api/v1/institutional/alerts')
        .set('X-API-Key', key)
        .send({
          title: 'Brote respiratorio regional',
          message: 'Aumento de casos de IRA en Tacna según vigilancia epidemiológica MINSA',
          priority: 'high',
          district: 'Tacna',
        })
        .expect(201);

      expect(response.body.data).toEqual(expect.objectContaining({ distributedTo: 1 }));

      const alerts = await AlertModel.find({ category: 'health_authority' });
      expect(alerts).toHaveLength(1);
      expect(alerts[0].trigger?.source).toBe('external_health_authority');
    });

    it('retorna 400 cuando falta title o message', async () => {
      const key = await createClient(['alerts:write']);

      await request(app)
        .post('/api/v1/institutional/alerts')
        .set('X-API-Key', key)
        .send({ title: 'Solo título' })
        .expect(400);
    });
  });
});
