# Plan de Iteración — Sprint 11: Dashboard Ejecutivo y Analytics

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 11 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 11: Dashboard Ejecutivo y Analytics |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 11: Dashboard Ejecutivo y Analytics |
| Fecha Inicio | Semana 23 |
| Fecha Fin | Semana 24 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Entregar un dashboard ejecutivo con analítica epidemiológica, predicciones de brotes/demanda y explicabilidad de modelos, orientado a tomadores de decisión.

## 3. Alcance

**Incluye:**

- Servicios analyticsService.ts y epidemiologicalService.ts
- Componente web ExecutiveDashboard.js con visualizaciones avanzadas
- Predicciones de brotes, demanda y KPIs en tiempo real
- Pruebas unitarias del dashboard (ExecutiveDashboard.test.js)
- Dashboard de explicabilidad ShapDashboard.js + pruebas (ShapDashboard.test.js) con métricas de confianza y fairness desde AI Services

**Excluye:**

- Entregables de otras iteraciones (Sprint 10 y anteriores ya cerrados; Sprint 12 y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 11:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Servicios analyticsService.ts y epidemiologicalService.ts | Servicios analyticsService.ts y epidemiologicalService.ts | Sí |
| Componente web ExecutiveDashboard.js | Componente web ExecutiveDashboard.js con visualizaciones avanzadas | Sí |
| Predicciones de brotes, demanda y KPIs en tiempo real | Predicciones de brotes, demanda y KPIs en tiempo real | Sí |
| Pruebas unitarias del dashboard (ExecutiveDashboard.test.js) | Pruebas unitarias del dashboard (ExecutiveDashboard.test.js) | Sí |
| Dashboard de explicabilidad ShapDashboard.js + pruebas (Shap | Dashboard de explicabilidad ShapDashboard.js + pruebas (ShapDashboard.test.js) con métricas de confianza y fairness desde AI Services | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 11 (Semana 23 a Semana 24):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 23 | Semana 23 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 23 | Semana 24 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 24 | Semana 24 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 24 | Semana 24 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 24 | Semana 24 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 11:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Visualizaciones poco claras para stakeholders no técnicos (ejecutivos) | Medio | Sprint Review con feedback directo de stakeholders ejecutivos y ajuste de etiquetas de riesgo |

## 8. Criterios de Aceptación

El Sprint 11 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 11: Dashboard Ejecutivo y Analytics" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Fuente y verificación de código real | Sección "Sprint 11: Dashboard Ejecutivo y Analytics" de METODOLOGIA_AGIL_PROYECTO.md — verificado en código real: web/src/components/ShapDashboard.js, backend/src/services/epidemiologicalService.ts | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 11:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 5/5 | 5/5 (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 11 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 11 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 12.
