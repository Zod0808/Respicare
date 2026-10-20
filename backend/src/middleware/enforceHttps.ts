/**
 * Nombre de Objeto: enforceHttps (middleware)
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RNF-004 - Seguridad (protección de datos médicos sensibles)
 * Descripción: Redirige tráfico HTTP a HTTPS en producción (excepto el probe
 * /health), evitando que datos médicos viajen sin cifrar en tránsito.
 */

import { Request, Response, NextFunction } from 'express';

export function enforceHttps(req: Request, res: Response, next: NextFunction) {
  // Permitir HTTP en desarrollo/local
  if (process.env.NODE_ENV !== 'production') return next();
  // Los health checks de orquestadores (Kubernetes, balanceadores internos)
  // suelen llamar por HTTP plano dentro del clúster, sin `x-forwarded-proto`;
  // redirigirlos rompería el probe. Se excluyen de la exigencia de HTTPS.
  if (req.path === '/health') return next();
  const proto = (req.headers['x-forwarded-proto'] as string) || '';
  if (proto.toLowerCase() !== 'https') {
    const host = req.headers.host;
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  next();
}


