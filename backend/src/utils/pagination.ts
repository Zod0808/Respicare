/**
 * Nombre de Objeto: pagination
 * Fecha de Creación: 2026-09-02
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - utilidad transversal backend
 * Descripción: Pagination. Parte de: utilidad transversal backend.
 */

import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Extrae page/limit de la query string con valores por defecto.
 * Centraliza el parseo para evitar duplicarlo en cada ruta paginada.
 */
export const parsePagination = (query: Request['query']): PaginationParams => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;

  return { page, limit };
};
