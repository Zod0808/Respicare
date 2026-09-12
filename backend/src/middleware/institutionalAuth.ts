/**
 * Institutional Authentication Middleware (Sprint 13)
 *
 * Authenticates external institutional consumers (MINSA/DIRESA Tacna, SINADEF)
 * via a static API key sent in the `X-API-Key` header, separate from the JWT
 * user-based `authenticate` middleware used by patients/doctors/admins.
 *
 * Also enforces a dedicated rate limit and writes to a dedicated audit log,
 * per the risk mitigation defined for Sprint 13 (see METODOLOGIA_AGIL_PROYECTO.md).
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import InstitutionalApiClient, { InstitutionalApiScope } from '../models/InstitutionalApiClient';
import InstitutionalAuditLog from '../models/InstitutionalAuditLog';
import { logger } from '../utils/logger';

export interface InstitutionalRequest extends Request {
  institutionalClient?: {
    id: string;
    name: string;
    scopes: InstitutionalApiScope[];
  };
}

/**
 * Dedicated, stricter rate limiter for institutional traffic, keyed by API key
 * (falls back to IP when no key was sent, so unauthenticated probing is also limited).
 */
export const institutionalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req.headers['x-api-key'] as string) || req.ip || 'unknown',
  message: {
    success: false,
    message: 'Límite de solicitudes excedido para el API de interoperabilidad institucional',
  },
});

async function writeAuditLog(
  req: Request,
  statusCode: number,
  success: boolean,
  client?: { id?: string; name?: string },
  errorMessage?: string
): Promise<void> {
  try {
    await InstitutionalAuditLog.create({
      clientId: client?.id,
      clientName: client?.name,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      success,
      ip: req.ip,
      errorMessage,
    });
  } catch (error: any) {
    logger.error('No se pudo escribir el log de auditoría institucional', { error: error.message });
  }
}

/**
 * Valida el header X-API-Key contra los clientes institucionales registrados.
 */
export const authenticateInstitutional = async (
  req: InstitutionalRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey || typeof apiKey !== 'string') {
    await writeAuditLog(req, 401, false, undefined, 'API key ausente');
    res.status(401).json({ success: false, message: 'API key requerida (header X-API-Key)' });
    return;
  }

  const keyPrefix = apiKey.slice(0, 14);

  try {
    const client = await InstitutionalApiClient.findOne({ keyPrefix });

    if (!client || !client.isActive) {
      await writeAuditLog(req, 401, false, undefined, 'API key inválida o inactiva');
      res.status(401).json({ success: false, message: 'API key inválida' });
      return;
    }

    const isValid = await client.verifyKey(apiKey);
    if (!isValid) {
      await writeAuditLog(req, 401, false, { id: client.id, name: client.name }, 'API key inválida');
      res.status(401).json({ success: false, message: 'API key inválida' });
      return;
    }

    client.lastUsedAt = new Date();
    await client.save();

    req.institutionalClient = {
      id: client.id,
      name: client.name,
      scopes: client.scopes,
    };

    res.on('finish', () => {
      void writeAuditLog(req, res.statusCode, res.statusCode < 400, { id: client.id, name: client.name });
    });

    next();
  } catch (error: any) {
    logger.error('Error autenticando cliente institucional', { error: error.message });
    await writeAuditLog(req, 500, false, undefined, error.message);
    res.status(500).json({ success: false, message: 'Error interno de autenticación institucional' });
  }
};

/**
 * Exige que el cliente institucional autenticado tenga el scope indicado.
 */
export function requireInstitutionalScope(scope: InstitutionalApiScope) {
  return (req: InstitutionalRequest, res: Response, next: NextFunction): void => {
    if (!req.institutionalClient) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    if (!req.institutionalClient.scopes.includes(scope)) {
      res.status(403).json({ success: false, message: `Scope insuficiente: se requiere '${scope}'` });
      return;
    }

    next();
  };
}
