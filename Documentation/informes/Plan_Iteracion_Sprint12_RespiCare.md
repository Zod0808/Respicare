# Plan de Iteración — Sprint 12: Modelos ML Predictivos y Cobertura

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 12 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 12: Modelos ML Predictivos y Cobertura |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 12: Modelos ML Predictivos y Cobertura |
| Fecha Inicio | Semana 25 |
| Fecha Fin | Semana 26 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Cerrar el proyecto con modelos ML predictivos (tendencias, anomalías, demanda), su suite de pruebas pytest y la actualización final de la documentación y monitoreo.

## 3. Alcance

**Incluye:**

- Modelos ML: trend_predictor.py, anomaly_detector.py, demand_forecasting.py
- Suite tests/ml_models/test_analytics_models.py con pytest
- Ajuste de requirements-test.txt (pytest-asyncio, httpx<0.24, fakeredis)
- Ejecución de pytest y pipeline ML documentado en ML_ROADMAP.md
- Endpoints REST de monitoreo (api/routes/ml_monitoring.py) y fairness/SHAP en prediction_monitor.py
- Actualización de documentación (README.md, PROJECT_ROADMAP.md, TESTING_*, ML_ROADMAP.md)

**Excluye:**

- Entregables de otras iteraciones (Sprint 11 y anteriores ya cerrados; Sprint - y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 12:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Modelos ML | Modelos ML: trend_predictor.py, anomaly_detector.py, demand_forecasting.py | Sí |
| Suite tests/ml_models/test_analytics_models.py | Suite tests/ml_models/test_analytics_models.py con pytest | Sí |
| Ajuste de requirements-test.txt (pytest-asyncio, httpx<0.24, | Ajuste de requirements-test.txt (pytest-asyncio, httpx<0.24, fakeredis) | Sí |
| Ejecución de pytest y pipeline ML documentado en ML_ROADMAP. | Ejecución de pytest y pipeline ML documentado en ML_ROADMAP.md | Sí |
| Endpoints REST de monitoreo (api/routes/ml_monitoring.py) y  | Endpoints REST de monitoreo (api/routes/ml_monitoring.py) y fairness/SHAP en prediction_monitor.py | Sí |
| Actualización de documentación (README.md, PROJECT_ROADMAP.m | Actualización de documentación (README.md, PROJECT_ROADMAP.md, TESTING_*, ML_ROADMAP.md) | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 12 (Semana 25 a Semana 26):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 25 | Semana 25 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 25 | Semana 26 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 26 | Semana 26 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 26 | Semana 26 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 26 | Semana 26 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 12:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Conflicto de versiones httpx vs pytest-httpx bloqueando la suite pytest | Medio | Resuelto ajustando versiones en requirements-test.txt (httpx<0.24) |
| Subestimación del esfuerzo de documentación multi-repo (retro real del sprint) | Medio | Action item de retro: registrar métricas de cobertura tras cada suite y automatizar instalación de requirements-test en CI |

## 8. Criterios de Aceptación

El Sprint 12 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK
- Sprint Report: Planificado 24 SP, Completado 24 SP (100%), Velocidad 24 SP

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 12: Modelos ML Predictivos y Cobertura" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Modelos ML predictivos (tendencias, anomalías, demanda) | `ai-services/ml_models/trend_predictor.py`, `ai-services/ml_models/anomaly_detector.py`, `ai-services/ml_models/demand_forecasting.py` | Cesar Fabian Chavez Linares |
| Suite de tests pytest de los modelos analíticos | `ai-services/tests/ml_models/test_analytics_models.py` | Cesar Fabian Chavez Linares |
| Ajuste de dependencias de testing | `ai-services/requirements-test.txt` | Cesar Fabian Chavez Linares |
| Endpoints REST de monitoreo y fairness/SHAP | `ai-services/api/routes/ml_monitoring.py`, `ai-services/ml_models/prediction_monitor.py` | Cesar Fabian Chavez Linares |
| Tests del monitor de predicciones | `ai-services/tests/ml_models/test_prediction_monitor.py` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Secciones "Sprint 12: Modelos ML Predictivos y Cobertura", "Retrospectiva (Sprint 12)" y "Reportes de Progreso" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 12:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 6/6 | 6/6 (100%) | ✅ Cumplido |
| Story Points | 24 SP planificados | 24 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Retrospectiva real registrada: **Start** — registrar métricas de cobertura tras cada suite y automatizar instalación de requirements-test en CI; **Stop** — subestimar esfuerzos de documentación multi-repo y ejecutar pytest sin dependencias sincronizadas; **Continue** — sincronía web/mobile/backend, revisión de PRs cruzados y pair testing en componentes críticos.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 12 y aprendizajes incorporados a las siguientes iteraciones:

Última iteración del proyecto (13/13). Resultado consolidado: 99.81% ML accuracy, 82% cobertura de tests web/mobile, 78% cobertura pytest ML, integración HL7/FHIR completa y dashboards ejecutivos desplegados — ver Métricas Finales en `METODOLOGIA_AGIL_PROYECTO.md`.
