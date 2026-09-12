# Plan de Iteración — Sprint 0: Setup y Arquitectura

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 0 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 0: Setup y Arquitectura |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 0: Setup y Arquitectura |
| Fecha Inicio | Semana 1 |
| Fecha Fin | Semana 2 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Establecer la base técnica del proyecto: arquitectura de microservicios, contenedores y pipeline de integración continua sobre los que se construirán todas las iteraciones posteriores.

## 3. Alcance

**Incluye:**

- Estructura de microservicios (backend, ai-services, web, mobile)
- Configuración de Docker y Docker Compose
- Base de datos MongoDB inicial
- Integración básica backend-frontend
- Configuración de CI/CD (GitHub Actions)

**Excluye:**

- Entregables de otras iteraciones (Sprint - y anteriores ya cerrados; Sprint 1 y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 0:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Estructura de microservicios (backend, ai-services, web, mob | Estructura de microservicios (backend, ai-services, web, mobile) | Sí |
| Configuración de Docker y Docker Compose | Configuración de Docker y Docker Compose | Sí |
| Base de datos MongoDB inicial | Base de datos MongoDB inicial | Sí |
| Integración básica backend-frontend | Integración básica backend-frontend | Sí |
| Configuración de CI/CD (GitHub Actions) | Configuración de CI/CD (GitHub Actions) | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 0 (Semana 1 a Semana 2):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 1 | Semana 1 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 1 | Semana 2 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 2 | Semana 2 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 2 | Semana 2 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 2 | Semana 2 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 0:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Elección de stack tecnológico inadecuada para el dominio clínico | Medio | Prueba de concepto temprana con Node.js/TypeScript + Python/FastAPI antes de comprometer arquitectura |
| Configuración de Docker multi-servicio compleja para el equipo | Medio | Documentación de setup y Makefile.docker con targets estandarizados |

## 8. Criterios de Aceptación

El Sprint 0 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 0: Setup y Arquitectura" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Estructura de microservicios (backend, ai-services, web, mobile) | `backend/`, `ai-services/`, `web/`, `mobile/` (raíz del repositorio) | Cesar Fabian Chavez Linares |
| Orquestación Docker Compose por entorno (dev, prod, servidor, túnel, VM) | `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, `docker-compose.server.yml`, `docker-compose.tunnel.yml`, `docker-compose.vm.yml` | Cesar Fabian Chavez Linares |
| Dockerfiles de cada microservicio | `backend/Dockerfile`, `backend/dockerfile.dev`, `web/Dockerfile`, `web/dockerfile.dev`, `nginx/Dockerfile`, `ai-services/Dockerfile.prod`, `ai-services/dockerfile` | Cesar Fabian Chavez Linares |
| Makefile con targets estandarizados de Docker (mitigación del riesgo de la sección 7) | `Makefile.docker` | Cesar Fabian Chavez Linares |
| Base de datos MongoDB inicial (definida como servicio en la orquestación Docker) | Servicio `mongo`/`mongodb` en `docker-compose.yml` | Cesar Fabian Chavez Linares |
| Integración básica backend-frontend (rutas Express consumidas por el cliente web) | `backend/src/routes/`, `web/src/services/` (llamadas API del frontend al backend) | Cesar Fabian Chavez Linares |
| Configuración de CI/CD (GitHub Actions) | `.github/workflows/` (20 workflows, entre ellos `backend-tests.yml`, `web-tests.yml`, `mobile-ci.yml`, `ai-services-tests.yml`, `docker-build.yml`, `ci-cd-complete.yml`) | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Fase 1: Setup y Arquitectura (Sprint 0)" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 0:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 5/5 | 5/5 (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 0 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 0 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 1.
