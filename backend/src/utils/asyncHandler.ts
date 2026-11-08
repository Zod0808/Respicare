/**
 * Nombre de Objeto: asyncHandler
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - utilidad transversal backend
 * Descripción: Manejador de async.
 */

import { Request, Response, NextFunction } from 'express';

// Wrapper para manejar errores asíncronos.
// Return the promise chain so callers (unit tests) can await completion.
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
};
