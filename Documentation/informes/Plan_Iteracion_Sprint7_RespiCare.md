# Plan de Iteración — Sprint 7: Integración Chatbot + ML

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 7 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 7: Integración Chatbot + ML |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 7: Integración Chatbot + ML |
| Fecha Inicio | Semana 15 |
| Fecha Fin | Semana 16 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Integrar el modelo ML entrenado dentro del chatbot médico, exponiendo predicciones con explicación SHAP y alternativas de diagnóstico al usuario final.

## 3. Alcance

**Incluye:**

- Integración de ML en el chatbot
- Predicciones con explicaciones SHAP
- Factores de decisión visibles al usuario
- Top 3 predicciones alternativas

**Excluye:**

- Entregables de otras iteraciones (Sprint 6 y anteriores ya cerrados; Sprint 8 y posteriores aún no iniciados).

**Requerimientos Funcionales relacionados** (Documentation/trazabilidad/Matriz_Trazabilidad_RespiCare.xlsx):

- **RF-002**: Diagnóstico inteligente de síntomas — extensión
- **RF-005**: Validación de coherencia médica — extensión
- **RF-006**: Explicabilidad (SHAP) — extensión

**Requerimientos No Funcionales relacionados** (FD03-EPIS-Informe SRS de Proyecto.docx, Cuadro de Requerimientos No Funcionales):

- **RNF-007**: Precisión
- **RNF-011**: Explicabilidad

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 7:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Integración de ML en el chatbot | Integración de ML en el chatbot | Sí |
| Predicciones | Predicciones con explicaciones SHAP | Sí |
| Factores de decisión visibles al usuario | Factores de decisión visibles al usuario | Sí |
| Top 3 predicciones alternativas | Top 3 predicciones alternativas | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 7 (Semana 15 a Semana 16):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 15 | Semana 15 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 15 | Semana 16 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 16 | Semana 16 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 16 | Semana 16 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 16 | Semana 16 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 7:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Latencia percibida al combinar inferencia ML + generación conversacional | Medio | Circuit Breaker heredado del Sprint 3 y cacheo de resultados de predicción |

## 8. Criterios de Aceptación

El Sprint 7 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 7: Integración Chatbot + ML" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Integración de ML en el chatbot | `ai-services/api/routes/chat_analyzer.py`, `ai-services/api/routes/symptom_ml_analyzer.py` | Cesar Fabian Chavez Linares |
| Predicciones con explicación SHAP y factores de decisión | `ai-services/shap_explainer.py`, `ai-services/ml_models/hybrid_system.py` | Cesar Fabian Chavez Linares |
| Top 3 predicciones alternativas (ensamble de modelos) | `ai-services/ml_models/ensemble_predictor.py` | Cesar Fabian Chavez Linares |
| Test del endpoint de explicación ML del chatbot | `ai-services/tests/api/test_symptom_ml_analyzer_explanation_endpoint.py` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Sprint 7: Integración Chatbot + ML" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

**Evidencia de código (extractos reales verificados del repositorio):**

*Entregable: Top 3 predicciones alternativas (ensamble de modelos)*

`ai-services/ml_models/ensemble_predictor.py` (líneas 102-122):

```python
    def predict(self, 
                symptoms: List[str],
                symptoms_text: str = None,
                patient_age: int = 35,
                risk_factors: List[str] = None,
                ensemble_method: str = 'weighted_vote',
                apply_personalization: bool = True) -> Dict[str, Any]:
        """
        Predict using ensemble of models
        
        Args:
            symptoms: List of symptom strings
            symptoms_text: Comma-separated symptoms string (for XGBoost/RF)
            patient_age: Patient age
            ensemble_method: 'weighted_vote' or 'average'
        
        Returns:
            Ensemble prediction result
        """
        if symptoms_text is None:
            symptoms_text = ', '.join(symptoms)
```

*Entregable: Integración de ML en el chatbot*

`ai-services/api/routes/chat_analyzer.py` (líneas 57-58):

```python
@router.post("/v1/analyze", response_model=ChatMessageOutput)
async def analyze_message(
```

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 7:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 23 SP planificados | 23 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 7 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 7 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 8.
