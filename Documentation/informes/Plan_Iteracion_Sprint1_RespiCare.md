# Plan de Iteración — Sprint 1: Autenticación y Backend Básico

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 1 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 1: Autenticación y Backend Básico |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 1: Autenticación y Backend Básico |
| Fecha Inicio | Semana 3 |
| Fecha Fin | Semana 4 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Construir el núcleo de autenticación y los endpoints básicos de la API REST que servirán de base al resto de módulos del MVP.

## 3. Alcance

**Incluye:**

- Sistema de autenticación JWT (login, refresh token)
- Gestión de usuarios (CRUD, roles admin/doctor/patient)
- Endpoints básicos de API
- Documentación Swagger

**Excluye:**

- Entregables de otras iteraciones (Sprint 0 y anteriores ya cerrados; Sprint 2 y posteriores aún no iniciados).

**Requerimientos Funcionales relacionados** (Documentation/trazabilidad/Matriz_Trazabilidad_RespiCare.xlsx):

- **RF-001**: Gestión de usuarios

**Requerimientos No Funcionales relacionados** (FD03-EPIS-Informe SRS de Proyecto.docx, Cuadro de Requerimientos No Funcionales):

- **RNF-004**: Seguridad
- **RNF-012**: Cobertura de pruebas

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 1:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Sistema de autenticación JWT (login, refresh token) | Sistema de autenticación JWT (login, refresh token) | Sí |
| Gestión de usuarios (CRUD, roles admin/doctor/patient) | Gestión de usuarios (CRUD, roles admin/doctor/patient) | Sí |
| Endpoints básicos de API | Endpoints básicos de API | Sí |
| Documentación Swagger | Documentación Swagger | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 1 (Semana 3 a Semana 4):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 3 | Semana 3 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 3 | Semana 4 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 4 | Semana 4 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 4 | Semana 4 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 4 | Semana 4 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 1:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Manejo inseguro de credenciales/tokens en etapa inicial | Medio | Cifrado de campos sensibles (AES-256-GCM) y JWT con expiración/refresh desde el primer sprint |

## 8. Criterios de Aceptación

El Sprint 1 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 1: Autenticación y Backend Básico" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Sistema de autenticación JWT (login, refresh, middleware) | `backend/src/controllers/authController.ts`, `backend/src/middleware/auth.ts`, `backend/src/routes/authRoutes.ts`, `backend/src/services/oauth2Service.ts` | Cesar Fabian Chavez Linares |
| Validación de credenciales | `backend/src/validators/authValidators.ts` | Cesar Fabian Chavez Linares |
| Gestión de usuarios (modelo, roles admin/doctor/patient, repositorio) | `backend/src/models/User.ts`, `backend/src/domain/entities/User.ts`, `backend/src/domain/repositories/UserRepository.ts`, `backend/src/infrastructure/repositories/MongoUserRepository.ts` | Cesar Fabian Chavez Linares |
| Documentación Swagger de la API | `backend/src/config/swagger.ts`, montada en `/api/docs` (`swaggerUi.setup`) | Cesar Fabian Chavez Linares |
| Tests de autenticación y autorización | `backend/tests/unit/controllers/authController.test.ts`, `backend/tests/unit/middleware/auth.test.ts`, `backend/tests/unit/validators/authValidators.test.ts`, `backend/tests/integration/auth.integration.test.ts`, `backend/tests/security/auth-authorization.security.test.ts` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Sprint 1: Autenticación y Backend Básico" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

**Evidencia de código (extractos reales verificados del repositorio):**

*Entregable: Sistema de autenticación JWT (login, refresh token)*

`backend/src/controllers/authController.ts` (líneas 103-128):

```typescript
export const login = asyncHandler(async (req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  // Buscar usuario y incluir contraseña
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    logger.warn('Login fallido: email no encontrado', { email });
    throw new AppError('Credenciales inválidas', 401);
  }

  // Verificar si el usuario está activo
  if (!user.isActive) {
    logger.warn('Login fallido: cuenta desactivada', { email });
    throw new AppError('La cuenta está desactivada', 401);
  }

  // Verificar contraseña
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    logger.warn('Login fallido: contraseña incorrecta', { email });
    throw new AppError('Credenciales inválidas', 401);
  }

  // Generar tokens
  const token = generateToken((user._id as mongoose.Types.ObjectId).toString());
  const refreshToken = generateRefreshToken((user._id as mongoose.Types.ObjectId).toString());
```

*Entregable: Gestión de usuarios (CRUD, roles admin/doctor/patient)*

`backend/src/models/User.ts` (líneas 27-54):

```typescript
const UserSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir en consultas por defecto
  },
  role: {
    type: String,
    enum: {
      values: ['patient', 'doctor', 'admin'],
```

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 1:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 21 SP planificados | 21 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 1 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 1 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 2.
