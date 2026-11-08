/**
 * Nombre de Objeto: AppError
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - utilidad transversal backend
 * Descripción: App error. Parte de: utilidad transversal backend.
 */

// Clase personalizada para errores de la aplicación
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string; // Código de error para localización
  public field?: string; // Campo relacionado (para validación)

  constructor(message: string, statusCode: number = 500, code?: string, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}
