# Plan de Iteración — Sprint 3: AI Services

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 3 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 3: AI Services |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 3: AI Services |
| Fecha Inicio | Semana 7 |
| Fecha Fin | Semana 8 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Introducir el microservicio de IA en Python/FastAPI con análisis básico de síntomas e integración inicial con OpenAI, protegido con patrones de resiliencia.

## 3. Alcance

**Incluye:**

- Servicios de IA con Python/FastAPI
- Análisis básico de síntomas
- Integración con OpenAI
- Circuit Breaker patterns para llamadas externas

**Excluye:**

- Entregables de otras iteraciones (Sprint 2 y anteriores ya cerrados; Sprint 4 y posteriores aún no iniciados).

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 3:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Servicios de IA | Servicios de IA con Python/FastAPI | Sí |
| Análisis básico de síntomas | Análisis básico de síntomas | Sí |
| Integración | Integración con OpenAI | Sí |
| Circuit Breaker patterns para llamadas externas | Circuit Breaker patterns para llamadas externas | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 3 (Semana 7 a Semana 8):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 7 | Semana 7 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 7 | Semana 8 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 8 | Semana 8 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 8 | Semana 8 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 8 | Semana 8 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 3:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Dependencia de disponibilidad/latencia de la API externa de OpenAI | Medio | Circuit Breaker y fallback local para mantener el servicio disponible ante fallos externos |

## 8. Criterios de Aceptación

El Sprint 3 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 3: AI Services" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Microservicio de IA en Python/FastAPI | `ai-services/main.py` | Cesar Fabian Chavez Linares |
| Análisis básico de síntomas | `ai-services/api/routes/symptom_analyzer.py`, `ai-services/api/routes/symptom_ml_analyzer.py` | Cesar Fabian Chavez Linares |
| Integración con OpenAI | `ai-services/strategies/openai_strategy.py`, `ai-services/models/model_manager.py`, `ai-services/factories/model_factory.py` | Cesar Fabian Chavez Linares |
| Circuit Breaker para llamadas externas | `ai-services/circuit_breaker/openai_circuit_breaker.py`, `ai-services/circuit_breaker/external_service_circuit_breaker.py` | Cesar Fabian Chavez Linares |
| Tests de análisis de síntomas y Circuit Breaker | `ai-services/tests/api/test_symptom_analyzer_endpoints.py`, `ai-services/tests/services/test_symptom_analysis_service.py`, `ai-services/tests/circuit_breaker/test_openai_circuit_breaker.py`, `ai-services/tests/circuit_breaker/test_external_service_circuit_breaker.py`, `ai-services/tests/patterns/test_circuit_breaker_pattern.py` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Sprint 3: AI Services" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 3:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 24 SP planificados | 24 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 3 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 3 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 4.
