/**
 * Nombre de Objeto: authRoutes
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-001 - Gestión de usuarios
 * Descripción: Define las rutas HTTP de autenticación y gestión de cuentas
 * (registro, login, refresh, perfil, cambio de contraseña y administración
 * de usuarios) bajo /api/v1/auth.
 */
import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getUserStats,
  getUsers,
  adminCreateUser,
  adminUpdateUser,
  adminToggleUserActive
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/authValidators';

const router = Router();

// Rutas públicas: no requieren token
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);

// Rutas protegidas
router.use(authenticate); // Todas las rutas siguientes requieren autenticación

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);
router.put('/change-password', validateRequest(changePasswordSchema), changePassword);
router.put('/deactivate', deactivateAccount);

// Rutas de administrador
router.get('/users', authorize('admin'), getUsers);
router.get('/stats', authorize('admin'), getUserStats);
router.post('/users', authorize('admin'), adminCreateUser);
router.patch('/users/:id', authorize('admin'), adminUpdateUser);
router.patch('/users/:id/toggle', authorize('admin'), adminToggleUserActive);

export default router;
