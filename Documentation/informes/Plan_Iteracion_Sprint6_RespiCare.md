# Plan de Iteración — Sprint 6: XGBoost Optimizado

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 6 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 6: XGBoost Optimizado |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 6: XGBoost Optimizado |
| Fecha Inicio | Semana 13 |
| Fecha Fin | Semana 14 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Optimizar el modelo de clasificación con XGBoost y feature engineering avanzado, incorporando explicabilidad SHAP y el dashboard ejecutivo de KPIs.

## 3. Alcance

**Incluye:**

- Modelo XGBoost (99.81% accuracy)
- Feature engineering avanzado (15 features)
- Explicabilidad SHAP
- Validación con test set

**Excluye:**

- Entregables de otras iteraciones (Sprint 5 y anteriores ya cerrados; Sprint 7 y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 6:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Modelo XGBoost (99.81% accuracy) | Modelo XGBoost (99.81% accuracy) | Sí |
| Feature engineering avanzado (15 features) | Feature engineering avanzado (15 features) | Sí |
| Explicabilidad SHAP | Explicabilidad SHAP | Sí |
| Validación | Validación con test set | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 6 (Semana 13 a Semana 14):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 13 | Semana 13 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 13 | Semana 14 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 14 | Semana 14 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 14 | Semana 14 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 14 | Semana 14 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 6:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Integración de SHAP compleja de mantener junto al pipeline de entrenamiento | Medio | Validación cruzada con test set y documentación de factores de decisión por predicción |

## 8. Criterios de Aceptación

El Sprint 6 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK
- US-105 (Dashboard ejecutivo con KPIs y predicciones): KPIs de usuarios/alertas/citas/IA, predicciones de brotes/riesgos en tabla, tendencia diaria, tests Jest de éxito/error — Story Points: 13, Estado: Done

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 6: XGBoost Optimizado" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Modelo XGBoost optimizado | `ai-services/ml_models/xgboost_model.py`, `ai-services/models/xgboost_model.pkl`, `ai-services/scripts/training/train_xgboost_model.py` | Cesar Fabian Chavez Linares |
| Explicabilidad SHAP | `ai-services/shap_explainer.py` | Cesar Fabian Chavez Linares |
| Dashboard ejecutivo de KPIs (US-105) | `web/src/components/ExecutiveDashboard.js`, `web/src/components/__tests__/ExecutiveDashboard.enhanced.test.js` | Cesar Fabian Chavez Linares |
| Tests del modelo XGBoost y del explicador SHAP | `ai-services/tests/ml_models/test_xgboost_model.py`, `ai-services/tests/services/test_shap_explainer.py` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Secciones "Sprint 6: XGBoost Optimizado" y "Casos de Uso por Sprint > Sprint 6" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 6:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 25 SP planificados | 25 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 6 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 6 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 7.
