# Plan de Iteración — Sprint 4: Chatbot y Analytics

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 4 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 4: Chatbot y Analytics |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 4: Chatbot y Analytics |
| Fecha Inicio | Semana 9 |
| Fecha Fin | Semana 10 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Entregar el chatbot médico integrado y las primeras analíticas y visualizaciones geográficas de reportes de síntomas, cerrando la Fase 2 (MVP).

## 3. Alcance

**Incluye:**

- Chatbot médico integrado
- Analytics básicos
- Mapas interactivos
- Reportes de síntomas

**Excluye:**

- Entregables de otras iteraciones (Sprint 3 y anteriores ya cerrados; Sprint 5 y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 4:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Chatbot médico integrado | Chatbot médico integrado | Sí |
| Analytics básicos | Analytics básicos | Sí |
| Mapas interactivos | Mapas interactivos | Sí |
| Reportes de síntomas | Reportes de síntomas | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 4 (Semana 9 a Semana 10):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 9 | Semana 9 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 9 | Semana 10 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 10 | Semana 10 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 10 | Semana 10 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 10 | Semana 10 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 4:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Alcance del MVP en riesgo de crecer sin control (scope creep) | Medio | Priorización MoSCoW estricta: Analytics/Chatbot como Should Have, visualizaciones avanzadas diferidas |

## 8. Criterios de Aceptación

El Sprint 4 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 4: Chatbot y Analytics" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Chatbot médico integrado | `web/src/components/ChatBot.js`, `web/src/components/ChatBotEnhanced.js` | Cesar Fabian Chavez Linares |
| Analytics básicos y reportes de síntomas (backend) | `backend/src/models/SymptomReport.js`, `backend/src/routes/symptomReportsRoutes.ts`, `backend/src/services/analyticsService.ts`, `backend/src/routes/analyticsRoutes.ts` | Cesar Fabian Chavez Linares |
| Mapas interactivos de reportes | `web/src/components/HeatMap.js`, `web/src/components/InteractiveHeatMap.js`, `web/src/components/EpidemiologicalHeatmap.js`, `web/src/pages/HeatMapPage.js` | Cesar Fabian Chavez Linares |
| Tests del chatbot | `web/src/components/__tests__/ChatBot.test.js`, `web/src/components/__tests__/ChatBotEnhanced.test.js`, `web/src/tests/accessibility/chatbot.accessibility.test.js` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Sprint 4: Chatbot y Analytics" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 4:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 22 SP planificados | 22 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 4 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 4 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 5.
