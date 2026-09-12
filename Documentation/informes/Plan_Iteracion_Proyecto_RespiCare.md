# Plan de Iteración General del Proyecto

**Proyecto**: RespiCare — Sistema Web y Móvil para la Detección de Enfermedades Respiratorias en Tacna
**Asignatura**: Construcción de Software I
**Plantilla**: Plan de Iteración — Plantilla Corporativa Avanzada
**Alcance**: consolida las 13 iteraciones del proyecto completo (Sprint 0 a Sprint 12), más el Sprint 13 (pendiente de ejecución) como extensión de alcance

Versión Word con el formato oficial: [`Plan_Iteracion_Proyecto_RespiCare.docx`](Plan_Iteracion_Proyecto_RespiCare.docx)

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|:---|:---|:---|:---|
| 1.0 | 10/09/2026 | Chávez Linares, Cesar Fabian | Consolidación del Plan de Iteración para las 13 iteraciones del proyecto (Sprint 0 a Sprint 12), sustentado en `METODOLOGIA_AGIL_PROYECTO.md` e `Informe_Resultados_Plan_Iteraciones.md`. |
| 1.1 | 11/09/2026 | Chávez Linares, Cesar Fabian | Se agrega el Sprint 13 (pendiente de ejecución) como extensión de alcance: API de interoperabilidad MINSA/SINADEF e integración wearables-IA. |

## 1. Información General

Este documento consolida en un solo Plan de Iteración las 13 iteraciones (Sprint 0 a Sprint 12) ya ejecutadas y documentadas en el proyecto, según el sustento verificado en [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md) (framework Scrum adaptado con elementos Kanban y XP, 12 sprints de desarrollo más el Sprint 0 de arquitectura, con métricas de velocity, cobertura y calidad por sprint) y en el [Informe de Resultados del Plan de Iteraciones](Informe_Resultados_Plan_Iteraciones.md) (resultados detallados con aprobación SQA de las iteraciones del módulo de diagnóstico). Adicionalmente incorpora el Sprint 13 (pendiente de ejecución), una extensión de alcance identificada en una revisión posterior de requerimientos, objetivos y avances del proyecto.

| Campo | Detalle |
|:---|:---|
| Laboratorio | Construcción de Software I — RespiCare |
| Iteración | General del Proyecto (Sprint 0 a Sprint 12 — 13 iteraciones completadas) + Sprint 13 (extensión pendiente) |
| Fecha Inicio | Semana 1 |
| Fecha Fin | Semana 26 (cierre de las 13 iteraciones) / Semana 28 (fin planificado del Sprint 13, pendiente) |
| Líder | Chávez Linares, Cesar Fabian (Scrum Master / Backend Developer) |
| Equipo | Backend Developer, Frontend Developer, Mobile Developer, Data Science/ML, QA/Tester |

## 2. Objetivo de la Iteración

Documentar de manera consolidada la planificación, ejecución y resultados de todas las iteraciones del proyecto RespiCare, desde el establecimiento de la arquitectura base (Sprint 0) hasta la incorporación de analítica predictiva, interoperabilidad HL7/FHIR y dashboards ejecutivos (Sprint 12), evidenciando el cumplimiento incremental del alcance funcional completo del sistema.

## 3. Alcance

**Incluye**: las 13 iteraciones documentadas — Sprint 0 (arquitectura y setup), Sprints 1-4 (MVP: autenticación, frontend/dashboard, servicios de IA, chatbot y analytics básicos), Sprints 5-8 (sistema de Machine Learning con Random Forest/XGBoost, explicabilidad SHAP e integración con el chatbot), Sprint 9 (refinamiento, documentación y preparación para producción) y Sprints 10-12 (interoperabilidad HL7/FHIR, dashboard ejecutivo y modelos ML predictivos). Como extensión de alcance, se agrega el Sprint 13 (pendiente de ejecución): API de interoperabilidad MINSA/SINADEF e integración de wearables con los servicios de IA.

**Excluye**: el módulo de emergencias y ambulancias, previsto como iteración futura aún no planificada formalmente. La integración completa de wearables con los servicios de IA y la interoperabilidad institucional con MINSA/SINADEF dejan de estar excluidas y pasan a planificarse como el Sprint 13 (pendiente de ejecución, ver sección 4).

## 4. Entregables Esperados

Entregables verificables comprometidos, uno por cada una de las 13 iteraciones completadas del proyecto, más el Sprint 13 (pendiente de ejecución) agregado como extensión de alcance:

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
| Sprint 13 — Interoperabilidad MINSA/SINADEF y Wearables-IA (PENDIENTE) | API de interoperabilidad MINSA/SINADEF (envío/recepción de información) e integración del pipeline de wearables (BLE) con los modelos de IA | 🔲 Pendiente |

## 5. Cronograma y Actividades

Cronograma consolidado de las 13 iteraciones, expresado en semanas de proyecto (26 semanas / 6 meses en total), conforme a las duraciones documentadas por fase en `METODOLOGIA_AGIL_PROYECTO.md`, más el Sprint 13 (extensión pendiente, Semana 27-28, aún no iniciado).

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
| Sprint 13 | Extensión: Interoperabilidad MINSA/SINADEF y Wearables-IA | Equipo de desarrollo | Semana 27 | Semana 28 | Pendiente |

## 6. Recursos Requeridos

**Personal**: equipo de desarrollo distribuido (Backend, Frontend, Mobile, Data Science/ML y QA), con roles de Scrum Master y Product Owner rotativos, consistente con la metodología ágil personalizada descrita en `METODOLOGIA_AGIL_PROYECTO.md`.

**Infraestructura y software**: microservicios en Docker, MongoDB, GitHub Actions (CI/CD), Node.js/TypeScript + Express (backend), React (frontend web), Capacitor + Next.js (mobile), Python/FastAPI (AI Services), scikit-learn/XGBoost/SHAP (Machine Learning) y servicios de interoperabilidad HL7/FHIR.

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|:---|:---|:---|
| Adaptación a TypeScript strict mode y a un stack multi-servicio (Docker) | Medio | Sprint 0 dedicado exclusivamente a establecer y validar la arquitectura antes de iniciar el desarrollo funcional |
| Complejidad de la integración SHAP y explicabilidad del modelo ML | Alto | Sprints 6-7 dedicados a validación con test set y a la integración incremental de SHAP en el chatbot antes de exponerlo a producción |
| Cobertura de pruebas insuficiente en un desarrollo iterativo rápido | Medio | Sprint 9 dedicado a testing exhaustivo (>80% cobertura web/mobile) antes de las iteraciones finales de analítica avanzada |
| Wearables (Health Connect/HealthKit) permanecen como stubs sin integrarse al pipeline de IA | Medio | Planificado y documentado como Sprint 13 (pendiente de ejecución): extensión del pipeline backend→ai-services para incorporar features de wearables, con fallback automático al modelo sin wearables |
| Ausencia de integración institucional con MINSA/SINADEF (Fase 4 del Documento de Visión, no ejecutada) | Medio | Planificado como Sprint 13 (pendiente): API de interoperabilidad construida sobre el estándar HL7/FHIR ya adoptado (`fhirService.ts`), evitando un formato ad-hoc |

## 8. Criterios de Aceptación

Las 13 iteraciones (Sprint 0 a Sprint 12) quedan marcadas como completadas cuando se cumplen los siguientes criterios, verificados en `METODOLOGIA_AGIL_PROYECTO.md`:

- 12 de 12 sprints de desarrollo completados (120% de la meta de 10 sprints planificados).
- 278 story points totales entregados (116% de la meta de 240 SP).
- Cobertura de pruebas web/mobile ≥80% (resultado real: 82%) y cobertura pytest ML ≥70% (resultado real: 78%).
- Modelo ML de producción (XGBoost) con accuracy >95% (resultado real: 99.81%).
- Integraciones HL7/FHIR y dashboards ejecutivos entregados de forma completa, no solo como prototipo.

## 9. Evidencias

Evidencias verificables que respaldan la ejecución de las 13 iteraciones documentadas:

| Evidencia | Ubicación | Responsable |
|:---|:---|:---|
| Metodología ágil y detalle de las 13 iteraciones | `Documentation/METODOLOGIA_AGIL_PROYECTO.md` | Equipo de desarrollo |
| Resultados detallados con aprobación SQA (módulo de diagnóstico) | `Documentation/informes/Informe_Resultados_Plan_Iteraciones.md` | Equipo de desarrollo |
| Código fuente de cada iteración (backend, frontend, mobile, AI Services) | `backend/src/`, `frontend/src/`, `mobile/`, `ai-services/` | Equipo de desarrollo |
| Reportes de cobertura de pruebas por sprint | Reportes HTML de Jest (web/mobile) y pytest-html (ML) | Equipo de desarrollo |
| Plan de Iteración detallado del Sprint 13 (pendiente) | `Documentation/informes/Plan_Iteracion_Sprint13_RespiCare.docx` | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas finales consolidadas del proyecto completo (13 iteraciones), tomadas de `METODOLOGIA_AGIL_PROYECTO.md`. Estas métricas reflejan únicamente las 13 iteraciones completadas (Sprint 0 a Sprint 12); el Sprint 13 (extensión pendiente) aún no aporta resultados medibles.

| Indicador | Meta | Resultado | Estado |
|:---|:---:|:---:|:---:|
| Sprints completados | 10 | 12 | ✅ 120% |
| Story points totales | 240 | 278 | ✅ 116% |
| ML Accuracy (XGBoost) | >95% | 99.81% | ✅ 105% |
| Test Coverage (web/mobile) | >80% | 82% | ✅ 103% |
| Cobertura pytest ML | >70% | 78% | ✅ 111% |
| Delivery Predictability | >80% | 87% | ✅ 109% |
| Team Velocity | 20 SP/sprint | 23.1 SP/sprint | ✅ 116% |

## 11. Seguimiento y Control

Cada una de las 13 iteraciones se gestionó mediante Sprint Planning, Daily Standups, Sprint Review y Retrospectiva, con seguimiento de Story Points, Burndown Charts, Velocity Tracking y Coverage Dashboards, conforme al framework Scrum adaptado descrito en `METODOLOGIA_AGIL_PROYECTO.md`.

## 12. Lecciones Aprendidas y Cierre

Las 13 iteraciones documentadas demuestran una ejecución ágil exitosa del proyecto completo, superando las metas planificadas de sprints (120%), story points (116%) y calidad (accuracy ML 105%, cobertura de pruebas 103-111%). Los desafíos superados incluyen la adaptación a TypeScript strict mode, la integración SHAP compleja y el despliegue multi-servicio con Docker. Como extensión de alcance identificada tras el cierre del proyecto original, se agregó el Sprint 13 (pendiente de ejecución) para abordar la integración completa de wearables con el pipeline de IA y una API de interoperabilidad con MINSA/SINADEF — documentado en `Plan_Iteracion_Sprint13_RespiCare`. El módulo de emergencias y ambulancias permanece como iteración futura aún no planificada formalmente.
