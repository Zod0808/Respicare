/**
 * Unit tests for institutionalIntegrationService.sendAutomaticReportToSinadef
 * (envío automático diario del reporte epidemiológico a SINADEF).
 */

jest.mock('../../../src/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../../../src/services/epidemiologicalService', () => ({
  epidemiologicalService: {
    getDistrictTrends: jest.fn().mockResolvedValue([{ district: 'Tacna', trend: 'stable' }]),
    predictOutbreaks: jest.fn().mockResolvedValue([
      { district: 'Tacna', riskLevel: 'stable' },
      { district: 'Alto de la Alianza', riskLevel: 'high' },
    ]),
  },
}));

jest.mock('axios');

import axios from 'axios';
import institutionalIntegrationService from '../../../src/services/institutionalIntegrationService';
import { AppError } from '../../../src/utils/AppError';

const mockedAxiosPost = axios.post as jest.Mock;

describe('institutionalIntegrationService.sendAutomaticReportToSinadef', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('omite el envío sin lanzar error si SINADEF_REPORT_URL no está configurado', async () => {
    delete process.env.SINADEF_REPORT_URL;

    const result = await institutionalIntegrationService.sendAutomaticReportToSinadef();

    expect(result.sent).toBe(false);
    expect(result.skippedReason).toMatch(/SINADEF_REPORT_URL/);
    expect(mockedAxiosPost).not.toHaveBeenCalled();
  });

  it('envía el reporte epidemiológico agregado a la URL configurada', async () => {
    process.env.SINADEF_REPORT_URL = 'https://sinadef.example.gob.pe/reportes';
    process.env.SINADEF_API_KEY = 'sinadef-key-123';
    mockedAxiosPost.mockResolvedValue({ status: 202 });

    const result = await institutionalIntegrationService.sendAutomaticReportToSinadef(15);

    expect(result.sent).toBe(true);
    expect(result.status).toBe(202);
    expect(mockedAxiosPost).toHaveBeenCalledWith(
      'https://sinadef.example.gob.pe/reportes',
      expect.objectContaining({ periodDays: 15, outbreakAlerts: expect.any(Array) }),
      expect.objectContaining({ headers: expect.objectContaining({ 'X-API-Key': 'sinadef-key-123' }) })
    );
  });

  it('lanza AppError si la petición a SINADEF falla', async () => {
    process.env.SINADEF_REPORT_URL = 'https://sinadef.example.gob.pe/reportes';
    mockedAxiosPost.mockRejectedValue(new Error('timeout'));

    await expect(institutionalIntegrationService.sendAutomaticReportToSinadef()).rejects.toThrow(AppError);
  });
});
