jest.mock('../../../src/models/InstitutionalApiClient', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../../src/models/InstitutionalAuditLog', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue(undefined),
  },
}));

import {
  authenticateInstitutional,
  requireInstitutionalScope,
} from '../../../src/middleware/institutionalAuth';

const InstitutionalApiClient = require('../../../src/models/InstitutionalApiClient').default as {
  findOne: jest.Mock;
};
const InstitutionalAuditLog = require('../../../src/models/InstitutionalAuditLog').default as {
  create: jest.Mock;
};

const buildRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const on = jest.fn();
  return { status, json, on } as any;
};

const buildNext = () => jest.fn();

describe('institutionalAuth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    InstitutionalAuditLog.create.mockResolvedValue(undefined);
  });

  describe('authenticateInstitutional', () => {
    it('retorna 401 cuando no se envía X-API-Key', async () => {
      const req: any = { headers: {}, method: 'GET', originalUrl: '/api/v1/institutional/x', ip: '127.0.0.1' };
      const res = buildRes();
      const next = buildNext();

      await authenticateInstitutional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 cuando no existe un cliente con ese keyPrefix', async () => {
      InstitutionalApiClient.findOne.mockResolvedValue(null);
      const req: any = {
        headers: { 'x-api-key': 'rcinst_deadbeef000000' },
        method: 'GET',
        originalUrl: '/api/v1/institutional/x',
        ip: '127.0.0.1',
      };
      const res = buildRes();
      const next = buildNext();

      await authenticateInstitutional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 cuando el cliente está inactivo', async () => {
      InstitutionalApiClient.findOne.mockResolvedValue({ isActive: false });
      const req: any = {
        headers: { 'x-api-key': 'rcinst_deadbeef000000' },
        method: 'GET',
        originalUrl: '/api/v1/institutional/x',
        ip: '127.0.0.1',
      };
      const res = buildRes();
      const next = buildNext();

      await authenticateInstitutional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 401 cuando la key no coincide (verifyKey falla)', async () => {
      InstitutionalApiClient.findOne.mockResolvedValue({
        id: 'client-1',
        name: 'MINSA',
        isActive: true,
        verifyKey: jest.fn().mockResolvedValue(false),
      });
      const req: any = {
        headers: { 'x-api-key': 'rcinst_deadbeef000000' },
        method: 'GET',
        originalUrl: '/api/v1/institutional/x',
        ip: '127.0.0.1',
      };
      const res = buildRes();
      const next = buildNext();

      await authenticateInstitutional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('adjunta institutionalClient y llama next() cuando la key es válida', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      InstitutionalApiClient.findOne.mockResolvedValue({
        id: 'client-1',
        name: 'MINSA',
        isActive: true,
        scopes: ['epidemiological:read'],
        verifyKey: jest.fn().mockResolvedValue(true),
        save,
      });
      const req: any = {
        headers: { 'x-api-key': 'rcinst_deadbeef000000' },
        method: 'GET',
        originalUrl: '/api/v1/institutional/x',
        ip: '127.0.0.1',
      };
      const res = buildRes();
      const next = buildNext();

      await authenticateInstitutional(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.institutionalClient).toEqual({
        id: 'client-1',
        name: 'MINSA',
        scopes: ['epidemiological:read'],
      });
      expect(save).toHaveBeenCalled();
    });
  });

  describe('requireInstitutionalScope', () => {
    it('retorna 401 cuando no hay cliente institucional autenticado', () => {
      const middleware = requireInstitutionalScope('epidemiological:read');
      const req: any = {};
      const res = buildRes();
      const next = buildNext();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('retorna 403 cuando el cliente no tiene el scope requerido', () => {
      const middleware = requireInstitutionalScope('alerts:write');
      const req: any = { institutionalClient: { id: '1', name: 'MINSA', scopes: ['epidemiological:read'] } };
      const res = buildRes();
      const next = buildNext();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('permite acceso cuando el cliente tiene el scope requerido', () => {
      const middleware = requireInstitutionalScope('alerts:write');
      const req: any = { institutionalClient: { id: '1', name: 'MINSA', scopes: ['alerts:write'] } };
      const res = buildRes();
      const next = buildNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
