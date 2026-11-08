/**
 * Nombre de Objeto: AuthResponseDto
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-001 - Gestión de usuarios
 * Descripción: DTO (objeto de transferencia de datos) de autenticación response.
 */

// DTO para Respuesta de Autenticación - Capa de Interfaz
import { UserResponseDto } from './UserResponseDto';

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  refreshToken: string;
}
