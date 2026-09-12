# Plan de Iteración — Sprint 9: Refinamiento y Preparación para Producción

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 9 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 9: Refinamiento y Preparación para Producción |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 9: Refinamiento y Preparación para Producción |
| Fecha Inicio | Semana 19 |
| Fecha Fin | Semana 20 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Optimizar el rendimiento del sistema, completar la documentación técnica y dejar el proyecto listo para el despliegue en producción.

## 3. Alcance

**Incluye:**

- Optimización de rendimiento
- Documentación completa (READMEs, TESTING_STRATEGY, ROADMAPs actualizados)
- Testing exhaustivo (web y mobile, objetivo >80% cobertura)
- Preparación para producción (verificación CI/CD, auditoría de despliegues)

**Excluye:**

- Entregables de otras iteraciones (Sprint 8 y anteriores ya cerrados; Sprint 10 y posteriores aún no iniciados).

**Requerimientos Funcionales relacionados** (Documentation/trazabilidad/Matriz_Trazabilidad_RespiCare.xlsx):

- **RF-011**: Módulo educativo — asociado temáticamente — funcionalidad transversal cerrada en la fase de refinamiento

**Requerimientos No Funcionales relacionados** (FD03-EPIS-Informe SRS de Proyecto.docx, Cuadro de Requerimientos No Funcionales):

- **RNF-003**: Disponibilidad
- **RNF-009**: Mantenibilidad
- **RNF-012**: Cobertura de pruebas

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 9:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Optimización de rendimiento | Optimización de rendimiento | Sí |
| Documentación completa (READMEs, TESTING_STRATEGY, ROADMAPs  | Documentación completa (READMEs, TESTING_STRATEGY, ROADMAPs actualizados) | Sí |
| Testing exhaustivo (web y mobile, objetivo >80% cobertura) | Testing exhaustivo (web y mobile, objetivo >80% cobertura) | Sí |
| Preparación para producción (verificación CI/CD, auditoría d | Preparación para producción (verificación CI/CD, auditoría de despliegues) | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 9 (Semana 19 a Semana 20):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 19 | Semana 19 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 19 | Semana 20 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 20 | Semana 20 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 20 | Semana 20 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 20 | Semana 20 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 9:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Deuda técnica acumulada durante las Fases 2 y 3 sin visibilidad | Medio | Sprint dedicado íntegramente a refinamiento, sin nuevas features, y auditoría de cobertura |

## 8. Criterios de Aceptación

El Sprint 9 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 9: Refinamiento y Preparación para Producción" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Documentación técnica por servicio (READMEs) | `README.md`, `backend/README.md`, `web` (README propio), `mobile/README.md`, `ai-services/README.md`, `ai-services/README_TESTS.md` | Cesar Fabian Chavez Linares |
| Estrategia de testing documentada | `docs/testing/TESTING_STRATEGY.md` | Cesar Fabian Chavez Linares |
| ROADMAPs actualizados por módulo | `docs/roadmaps/PROJECT_ROADMAP.md`, `docs/roadmaps/BACKEND_ROADMAP.md`, `docs/roadmaps/WEB_ROADMAP.md`, `docs/roadmaps/MOBILE_ROADMAP.md`, `docs/roadmaps/AI_SERVICES_ROADMAP.md`, `docs/roadmaps/ML_ROADMAP.md`, `docs/roadmaps/TESTS_ROADMAP.md`, `docs/roadmaps/WORKFLOWS_ROADMAP.md` | Cesar Fabian Chavez Linares |
| Preparación para producción (CI/CD verificado) | `.github/workflows/ci-cd-complete.yml`, `.github/workflows/deploy-production.yml`, `.github/workflows/deploy-staging.yml` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Fase 4: Refinamiento (Sprint 9)" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

**Evidencia de código (extractos reales verificados del repositorio):**

*Entregable: Preparación para producción (verificación CI/CD)*

`.github/workflows/deploy-production.yml` (líneas 1-13):

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Image tag to deploy (must be a version tag like v1.0.0)'
        required: true
      confirm_deploy:
        description: 'Type "DEPLOY" to confirm production deployment'
        required: true
```

*Entregable: Testing exhaustivo (web y mobile, objetivo >80% cobertura)*

`.github/workflows/ci-cd-complete.yml` (líneas 33-53):

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run unit tests
        working-directory: ./backend
        run: npm run test:unit
```

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 9:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 9 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 9 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 10.
