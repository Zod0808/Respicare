# Plan de Iteración General del Proyecto

**Proyecto**: RespiCare — Sistema Web y Móvil para la Detección de Enfermedades Respiratorias en Tacna
**Asignatura**: Construcción de Software I
**Plantilla**: Plan de Iteración — Plantilla Corporativa Avanzada
**Alcance**: consolida las 14 iteraciones del proyecto completo (Sprint 0 a Sprint 13), incluyendo el Sprint 13 (extensión de alcance) ya ejecutado

Versión Word con el formato oficial: [`Plan_Iteracion_Proyecto_RespiCare.docx`](Plan_Iteracion_Proyecto_RespiCare.docx)

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|:---|:---|:---|:---|
| 1.0 | 10/09/2026 | Chávez Linares, Cesar Fabian | Consolidación del Plan de Iteración para las 13 iteraciones del proyecto (Sprint 0 a Sprint 12), sustentado en `METODOLOGIA_AGIL_PROYECTO.md` e `Informe_Resultados_Plan_Iteraciones.md`. |
| 1.1 | 11/09/2026 | Chávez Linares, Cesar Fabian | Se agrega el Sprint 13 (pendiente de ejecución) como extensión de alcance: API de interoperabilidad MINSA/SINADEF e integración wearables-IA. |
| 1.2 | 12/09/2026 | Chávez Linares, Cesar Fabian | Se actualiza el estado del Sprint 13 de "pendiente" a "ejecutado": API de interoperabilidad MINSA/SINADEF (`institutionalAuth.ts`, `institutionalIntegrationService.ts`, `institutionalController.ts`) e integración wearables-IA (`medical_validation_rules.py`) implementadas y con pruebas unitarias/integración pasando. Se actualizan entregables, cronograma, riesgos, criterios de aceptación e indicadores para reflejar las 14 iteraciones completadas. |

## 1. Información General

Este documento consolida en un solo Plan de Iteración las 14 iteraciones (Sprint 0 a Sprint 13) ejecutadas y documentadas en el proyecto, según el sustento verificado en [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md) (framework Scrum adaptado con elementos Kanban y XP, 12 sprints de desarrollo más el Sprint 0 de arquitectura, con métricas de velocity, cobertura y calidad por sprint) y en el [Informe de Resultados del Plan de Iteraciones](Informe_Resultados_Plan_Iteraciones.md) (resultados detallados con aprobación SQA de las iteraciones del módulo de diagnóstico). Adicionalmente incorpora el Sprint 13, una extensión de alcance identificada en una revisión posterior de requerimientos, objetivos y avances del proyecto, y ya ejecutada: API de interoperabilidad MINSA/SINADEF e integración de wearables con los servicios de IA, con código fuente y pruebas verificables en el repositorio (ver [Plan de Iteración del Sprint 13](Plan_Iteracion_Sprint13_RespiCare.md)).

| Campo | Detalle |
|:---|:---|
| Laboratorio | Construcción de Software I — RespiCare |
| Iteración | General del Proyecto (Sprint 0 a Sprint 13 — 14 iteraciones completadas) |
| Fecha Inicio | Semana 1 |
| Fecha Fin | Semana 28 (cierre de las 14 iteraciones, incluyendo el Sprint 13) |
| Líder | Chávez Linares, Cesar Fabian (Scrum Master / Backend Developer) |
| Equipo | Backend Developer, Frontend Developer, Mobile Developer, Data Science/ML, QA/Tester |

## 2. Objetivo de la Iteración

Documentar de manera consolidada la planificación, ejecución y resultados de todas las iteraciones del proyecto RespiCare, desde el establecimiento de la arquitectura base (Sprint 0) hasta la incorporación de analítica predictiva, interoperabilidad HL7/FHIR, dashboards ejecutivos (Sprint 12) e interoperabilidad institucional MINSA/SINADEF con integración wearables-IA (Sprint 13), evidenciando el cumplimiento incremental del alcance funcional completo del sistema.

## 3. Alcance

**Incluye**: las 14 iteraciones documentadas — Sprint 0 (arquitectura y setup), Sprints 1-4 (MVP: autenticación, frontend/dashboard, servicios de IA, chatbot y analytics básicos), Sprints 5-8 (sistema de Machine Learning con Random Forest/XGBoost, explicabilidad SHAP e integración con el chatbot), Sprint 9 (refinamiento, documentación y preparación para producción), Sprints 10-12 (interoperabilidad HL7/FHIR, dashboard ejecutivo y modelos ML predictivos) y Sprint 13, extensión de alcance ya ejecutada: API de interoperabilidad MINSA/SINADEF e integración de wearables con los servicios de IA.

**Excluye**: el módulo de emergencias y ambulancias, previsto como iteración futura aún no planificada formalmente. La integración completa de wearables con los servicios de IA y la interoperabilidad institucional con MINSA/SINADEF dejaron de estar excluidas y se ejecutaron como el Sprint 13 (ver sección 4).

## 4. Entregables Esperados

Entregables verificables comprometidos, uno por cada una de las 14 iteraciones completadas del proyecto, incluyendo el Sprint 13 agregado como extensión de alcance:

| Entregable | Descripción | Aceptado |
|:---|:---|:---:|
| Sprint 0 — Arquitectura | Estructura de microservicios, Docker, MongoDB, CI/CD e integración básica backend-frontend | ✅ |
| Sprint 1 — Autenticación | Sistema de autenticación JWT, gestión de usuarios, endpoints de API y documentación Swagger | ✅ |
| Sprint 2 — Frontend y Dashboard | Interfaz web en React, dashboard básico, integración con backend y diseño responsive | ✅ |
| Sprint 3 — AI Services | Servicios de IA en Python/FastAPI, análisis básico de síntomas, integración con OpenAI y patrones Circuit Breaker | ✅ |
| Sprint 4 — Chatbot y Analytics | Chatbot médico integrado, analytics básicos, mapas interactivos y reportes de síntomas | ✅ |
| Sprint 5 — Dataset y Random Forest | Dataset sintético de 64k casos, modelo Random Forest (99.19% accuracy) y reglas de emergencia | ✅ |
| Sprint 6 — XGBoost Optimizado | Modelo XGBoost (99.81% accuracy), feature engineering avanzado y explicabilidad SHAP | ✅ |
| Sprint 7 — Integración Chatbot + ML | Predicciones con explicaciones SHAP, factores de decisión y top 3 predicciones alternativas | ✅ |
| Sprint 8 — Analytics Avanzados | Dashboard completo con tendencias temporales, reportes geográficos y visualizaciones interactivas | ✅ |
| Sprint 9 — Refinamiento | Optimización de rendimiento, documentación completa y testing exhaustivo (>80% cobertura) | ✅ |
| Sprint 10 — Integración HL7 FHIR | Servicio `fhirService.ts`, parser `hl7Parser.ts` y endpoints de sincronización clínica | ✅ |
| Sprint 11 — Dashboard Ejecutivo | `ExecutiveDashboard.js`, `ShapDashboard.js` y servicios de analytics/epidemiología | ✅ |
| Sprint 12 — ML Predictivo y Cobertura | `trend_predictor.py`, `anomaly_detector.py`, `demand_forecasting.py` y endpoints de monitoreo ML | ✅ |
| Sprint 13 — Interoperabilidad MINSA/SINADEF y Wearables-IA | API de interoperabilidad MINSA/SINADEF (`InstitutionalApiClient`, `institutionalAuth.ts`, `institutionalIntegrationService.ts`, `institutionalController.ts`) e integración del pipeline de wearables con los modelos de IA (`medical_validation_rules.py`, `symptom_ml_analyzer.py`) | ✅ |

## 5. Cronograma y Actividades

Cronograma consolidado de las 14 iteraciones, expresado en semanas de proyecto (28 semanas / 6.5 meses en total), conforme a las duraciones documentadas por fase en `METODOLOGIA_AGIL_PROYECTO.md`, incluyendo el Sprint 13 (Semana 27-28) como extensión de alcance ya ejecutada.

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| Sprint 0 | Fase 1: Setup y Arquitectura | Equipo de desarrollo | Semana 1 | Semana 2 | Completado |
| Sprint 1 | Fase 2: Autenticación y Backend Básico | Equipo de desarrollo | Semana 3 | Semana 4 | Completado |
| Sprint 2 | Fase 2: Frontend y Dashboard | Equipo de desarrollo | Semana 5 | Semana 6 | Completado |
| Sprint 3 | Fase 2: AI Services | Equipo de desarrollo | Semana 7 | Semana 8 | Completado |
| Sprint 4 | Fase 2: Chatbot y Analytics | Equipo de desarrollo | Semana 9 | Semana 10 | Completado |
| Sprint 5 | Fase 3: Dataset y Random Forest | Equipo de desarrollo | Semana 11 | Semana 12 | Completado |
| Sprint 6 | Fase 3: XGBoost Optimizado | Equipo de desarrollo | Semana 13 | Semana 14 | Completado |
| Sprint 7 | Fase 3: Integración Chatbot + ML | Equipo de desarrollo | Semana 15 | Semana 16 | Completado |
| Sprint 8 | Fase 3: Analytics Avanzados | Equipo de desarrollo | Semana 17 | Semana 18 | Completado |
| Sprint 9 | Fase 4: Refinamiento | Equipo de desarrollo | Semana 19 | Semana 20 | Completado |
| Sprint 10 | Fase 5: Integración HL7 FHIR | Equipo de desarrollo | Semana 21 | Semana 22 | Completado |
| Sprint 11 | Fase 5: Dashboard Ejecutivo y Analytics | Equipo de desarrollo | Semana 23 | Semana 24 | Completado |
| Sprint 12 | Fase 5: Modelos ML Predictivos y Cobertura | Equipo de desarrollo | Semana 25 | Semana 26 | Completado |
| Sprint 13 | Extensión: Interoperabilidad MINSA/SINADEF y Wearables-IA | Equipo de desarrollo | Semana 27 | Semana 28 | Completado |

## 6. Recursos Requeridos

**Personal**: equipo de desarrollo distribuido (Backend, Frontend, Mobile, Data Science/ML y QA), con roles de Scrum Master y Product Owner rotativos, consistente con la metodología ágil personalizada descrita en `METODOLOGIA_AGIL_PROYECTO.md`.

**Infraestructura y software**: microservicios en Docker, MongoDB, GitHub Actions (CI/CD), Node.js/TypeScript + Express (backend), React (frontend web), Capacitor + Next.js (mobile), Python/FastAPI (AI Services), scikit-learn/XGBoost/SHAP (Machine Learning) y servicios de interoperabilidad HL7/FHIR.

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|:---|:---|:---|
| Adaptación a TypeScript strict mode y a un stack multi-servicio (Docker) | Medio | Sprint 0 dedicado exclusivamente a establecer y validar la arquitectura antes de iniciar el desarrollo funcional |
| Complejidad de la integración SHAP y explicabilidad del modelo ML | Alto | Sprints 6-7 dedicados a validación con test set y a la integración incremental de SHAP en el chatbot antes de exponerlo a producción |
| Cobertura de pruebas insuficiente en un desarrollo iterativo rápido | Medio | Sprint 9 dedicado a testing exhaustivo (>80% cobertura web/mobile) antes de las iteraciones finales de analítica avanzada |
| Wearables (Health Connect/HealthKit) permanecían como stubs sin integrarse al pipeline de IA | Medio (resuelto) | Ejecutado en el Sprint 13: capa de validación clínica basada en reglas (`MedicalValidationRules.validate_vitals()` en `ai-services/services/medical_validation_rules.py`), integrada vía `symptom_ml_analyzer.py`, `aiIntegration.ts` y `symptomAnalyzerController.ts`, con fallback automático al modelo sin wearables |
| Ausencia de integración institucional con MINSA/SINADEF (Fase 4 del Documento de Visión, no ejecutada) | Medio (resuelto) | Ejecutado en el Sprint 13: API de interoperabilidad institucional (`InstitutionalApiClient`, `InstitutionalAuditLog`, `institutionalAuth.ts`, `institutionalIntegrationService.ts`, `institutionalController.ts`, `institutionalRoutes.ts`) construida sobre el estándar HL7/FHIR ya adoptado (`fhirService.ts`), con autenticación por API key, rate limiting y auditoría |

## 8. Criterios de Aceptación

Las 14 iteraciones (Sprint 0 a Sprint 13) quedan marcadas como completadas cuando se cumplen los siguientes criterios, verificados en `METODOLOGIA_AGIL_PROYECTO.md` y en el [Plan de Iteración del Sprint 13](Plan_Iteracion_Sprint13_RespiCare.md):

- 12 de 12 sprints de desarrollo completados (120% de la meta de 10 sprints planificados), más el Sprint 13 como extensión de alcance ejecutada.
- 278 story points totales entregados (116% de la meta de 240 SP) en Sprint 0-12.
- Cobertura de pruebas web/mobile ≥80% (resultado real: 82%) y cobertura pytest ML ≥70% (resultado real: 78%).
- Modelo ML de producción (XGBoost) con accuracy >95% (resultado real: 99.81%).
- Integraciones HL7/FHIR y dashboards ejecutivos entregados de forma completa, no solo como prototipo.
- Sprint 13: API de interoperabilidad MINSA/SINADEF funcional con autenticación, rate limiting y auditoría, e integración wearables-IA con validación clínica basada en reglas, ambas con pruebas unitarias/integración pasando (18 pruebas nuevas).

## 9. Evidencias

Evidencias verificables que respaldan la ejecución de las 14 iteraciones documentadas:

| Evidencia | Ubicación | Responsable |
|:---|:---|:---|
| Metodología ágil y detalle de las 13 iteraciones (Sprint 0 a Sprint 12) | `Documentation/METODOLOGIA_AGIL_PROYECTO.md` | Equipo de desarrollo |
| Resultados detallados con aprobación SQA (módulo de diagnóstico) | `Documentation/informes/Informe_Resultados_Plan_Iteraciones.md` | Equipo de desarrollo |
| Código fuente de cada iteración (backend, frontend, mobile, AI Services) | `backend/src/`, `frontend/src/`, `mobile/`, `ai-services/` | Equipo de desarrollo |
| Reportes de cobertura de pruebas por sprint | Reportes HTML de Jest (web/mobile) y pytest-html (ML) | Equipo de desarrollo |
| Plan de Iteración detallado del Sprint 13 (ejecutado) | `Documentation/informes/Plan_Iteracion_Sprint13_RespiCare.docx` | Cesar Fabian Chavez Linares |
| Código fuente e integración institucional MINSA/SINADEF (Sprint 13) | `backend/src/models/InstitutionalApiClient.ts`, `backend/src/middleware/institutionalAuth.ts`, `backend/src/services/institutionalIntegrationService.ts`, `backend/src/controllers/institutionalController.ts`, `backend/src/routes/institutionalRoutes.ts` | Equipo de desarrollo |
| Código fuente e integración wearables-IA (Sprint 13) | `ai-services/services/medical_validation_rules.py`, `ai-services/api/routes/symptom_ml_analyzer.py`, `backend/src/services/aiIntegration.ts` | Equipo de desarrollo |
| Pruebas del Sprint 13 (unitarias e integración) | `backend/tests/unit/middleware/institutionalAuth.test.ts`, `backend/tests/integration/institutional.integration.test.ts`, `ai-services/tests/services/test_medical_validation_rules.py`, `ai-services/tests/api/test_symptom_ml_analyzer_endpoints.py` | Equipo de desarrollo |

## 10. Indicadores de Éxito

Métricas finales consolidadas del proyecto completo (14 iteraciones), tomadas de `METODOLOGIA_AGIL_PROYECTO.md`. Los indicadores de sprints/story points/velocity reflejan las 13 iteraciones base (Sprint 0 a Sprint 12); el Sprint 13 se añade como extensión de alcance ya ejecutada, con sus propios resultados de calidad.

| Indicador | Meta | Resultado | Estado |
|:---|:---:|:---:|:---:|
| Sprints completados | 10 | 12 (+ Sprint 13 ejecutado) | ✅ 120% |
| Story points totales | 240 | 278 | ✅ 116% |
| ML Accuracy (XGBoost) | >95% | 99.81% | ✅ 105% |
| Test Coverage (web/mobile) | >80% | 82% | ✅ 103% |
| Cobertura pytest ML | >70% | 78% | ✅ 111% |
| Delivery Predictability | >80% | 87% | ✅ 109% |
| Team Velocity | 20 SP/sprint | 23.1 SP/sprint | ✅ 116% |
| Suite de pruebas AI Services (Sprint 0-13) | Sin fallas | 2034/2034 pasando | ✅ 100% |
| Suite de pruebas Backend (Sprint 0-13) | Sin fallas | 2479/2488 pasando (1 falla ambiental) | ✅ 99.6% |

## 11. Seguimiento y Control

Cada una de las 14 iteraciones se gestionó mediante Sprint Planning, Daily Standups, Sprint Review y Retrospectiva, con seguimiento de Story Points, Burndown Charts, Velocity Tracking y Coverage Dashboards, conforme al framework Scrum adaptado descrito en `METODOLOGIA_AGIL_PROYECTO.md`.

## 12. Lecciones Aprendidas y Cierre

Las 14 iteraciones documentadas demuestran una ejecución ágil exitosa del proyecto completo, superando las metas planificadas de sprints (120%), story points (116%) y calidad (accuracy ML 105%, cobertura de pruebas 103-111%). Los desafíos superados incluyen la adaptación a TypeScript strict mode, la integración SHAP compleja y el despliegue multi-servicio con Docker. Como extensión de alcance identificada tras el cierre del proyecto original, se ejecutó el Sprint 13 para completar la integración de wearables con el pipeline de IA y una API de interoperabilidad con MINSA/SINADEF — documentado en `Plan_Iteracion_Sprint13_RespiCare` y verificado mediante 18 pruebas nuevas (unitarias e integración) sobre backend y ai-services. El módulo de emergencias y ambulancias permanece como iteración futura aún no planificada formalmente.
