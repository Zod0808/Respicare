import { NextFunction, Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { getRedisClient } from '../config/redisClient';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

interface LimitConfig {
  windowMs: number;
  max: number;
  scope: string;
}

const baseWindowMs = config.security.rateLimitWindow;
const baseMax = config.security.rateLimitMax;

const calculateLimitConfig = (req: AuthenticatedRequest): LimitConfig => {
  const path = req.path;

  if (path.startsWith('/api/v1/auth')) {
    return {
      windowMs: baseWindowMs,
      max: Math.max(Math.floor(baseMax * 0.4), 20),
      scope: 'auth'
    };
  }

  if (path.startsWith('/api/v1/export')) {
    return {
      windowMs: baseWindowMs * 4,
      max: Math.max(Math.floor(baseMax * 0.25), 10),
      scope: 'export'
    };
  }

  const role = req.user?.role;

  switch (role) {
    case 'admin':
      return { windowMs: baseWindowMs, max: baseMax * 2, scope: 'admin' };
    case 'doctor':
      return { windowMs: baseWindowMs, max: Math.floor(baseMax * 1.2), scope: 'doctor' };
    case 'patient':
      return { windowMs: baseWindowMs, max: Math.floor(baseMax * 0.8), scope: 'patient' };
    default:
      return { windowMs: baseWindowMs, max: Math.max(Math.floor(baseMax * 0.6), 50), scope: 'anonymous' };
  }
};

const fallbackLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: baseWindowMs,
  limit: baseMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const loginWindowMs = config.security.loginRateLimitWindow;
const loginMax = config.security.loginRateLimitMax;

// Limitador de respaldo en memoria, solo para cuando Redis no está disponible.
// Se omite en tests (NODE_ENV=test) porque varios archivos de test disparan
// varios intentos de login contra el mismo IP en el mismo proceso; el control
// real en ese entorno lo cubren los tests dedicados de este middleware.
const loginFallbackLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: loginWindowMs,
  limit: loginMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.server.env === 'test'
});

// Límite específico y agresivo para /auth/login: el limitador global no es
// suficiente para frenar fuerza bruta contra credenciales.
export const loginRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return loginFallbackLimiter(req, res, next);
  }

  const identifier = req.ip;
  const windowBucket = Math.floor(Date.now() / loginWindowMs);
  const redisKey = `rate-limit:login-ip:${identifier}:${windowBucket}`;

  try {
    const current = await redisClient.incr(redisKey);

    if (current === 1) {
      await redisClient.expire(redisKey, Math.ceil(loginWindowMs / 1000));
    }

    if (current > loginMax) {
      const ttl = await redisClient.ttl(redisKey);
      if (ttl > 0) {
        res.setHeader('Retry-After', ttl.toString());
      }

      logger.warn('Rate limit de login excedido', { identifier, loginWindowMs, loginMax });

      res.status(429).json({
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.',
        limit: loginMax,
        retryAfterSeconds: ttl > 0 ? ttl : undefined
      });
      return;
    }

    return next();
  } catch (error) {
    logger.warn('Fallo al aplicar rate limit de login, utilizando fallback', { error });
    return loginFallbackLimiter(req, res, next);
  }
};

export const smartRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return fallbackLimiter(req, res, next);
  }

  const authenticatedReq = req as AuthenticatedRequest;
  const { windowMs, max, scope } = calculateLimitConfig(authenticatedReq);
  const identifier = authenticatedReq.user?._id?.toString() ?? req.ip;

  const windowBucket = Math.floor(Date.now() / windowMs);
  const redisKey = `rate-limit:${scope}:${identifier}:${windowBucket}`;

  try {
    const current = await redisClient.incr(redisKey);

    if (current === 1) {
      await redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(max - current, 0);
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-WindowMS', windowMs.toString());

    if (current > max) {
      const ttl = await redisClient.ttl(redisKey);
      if (ttl > 0) {
        res.setHeader('Retry-After', ttl.toString());
      }

      logger.warn('Rate limit exceeded', {
        scope,
        identifier,
        windowMs,
        max
      });

      res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        limit: max,
        scope,
        retryAfterSeconds: ttl > 0 ? ttl : undefined
      });
      return;
    }

    return next();
  } catch (error) {
    logger.warn('Fallo al aplicar rate limit inteligente, utilizando fallback', { error });
    fallbackLimiter(req, res, next);
    return;
  }
};

