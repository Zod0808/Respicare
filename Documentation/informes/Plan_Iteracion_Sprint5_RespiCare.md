# Plan de Iteración — Sprint 5: Dataset y Random Forest

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 5 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 5: Dataset y Random Forest |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 5: Dataset y Random Forest |
| Fecha Inicio | Semana 11 |
| Fecha Fin | Semana 12 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Generar el dataset sintético de enfermedades respiratorias y entrenar el primer modelo de clasificación (Random Forest) junto con el motor de reglas de emergencia.

## 3. Alcance

**Incluye:**

- Dataset sintético (64k+ casos, 26 enfermedades principales)
- Modelo Random Forest (99.19% accuracy)
- Feature engineering básico
- Sistema de reglas de emergencia

**Excluye:**

- Entregables de otras iteraciones (Sprint 4 y anteriores ya cerrados; Sprint 6 y posteriores aún no iniciados).

**Requerimientos Funcionales relacionados** (Documentation/trazabilidad/Matriz_Trazabilidad_RespiCare.xlsx):

- **RF-002**: Diagnóstico inteligente de síntomas — extensión
- **RF-004**: Reglas clínicas de emergencia
- **RF-005**: Validación de coherencia médica
- **RF-009**: Sistema de alertas y notificaciones — asociado temáticamente — las reglas de emergencia disparan alertas

**Requerimientos No Funcionales relacionados** (FD03-EPIS-Informe SRS de Proyecto.docx, Cuadro de Requerimientos No Funcionales):

- **RNF-007**: Precisión
- **RNF-010**: Confiabilidad

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 5:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Dataset sintético (64k+ casos, 26 enfermedades principales) | Dataset sintético (64k+ casos, 26 enfermedades principales) | Sí |
| Modelo Random Forest (99.19% accuracy) | Modelo Random Forest (99.19% accuracy) | Sí |
| Feature engineering básico | Feature engineering básico | Sí |
| Sistema de reglas de emergencia | Sistema de reglas de emergencia | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 5 (Semana 11 a Semana 12):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 11 | Semana 11 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 11 | Semana 12 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 12 | Semana 12 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 12 | Semana 12 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 12 | Semana 12 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 5:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Dataset sintético no representativo de la distribución real de casos | Medio | Distribución controlada de 1k-5k casos por enfermedad común y validación con test set |

## 8. Criterios de Aceptación

El Sprint 5 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK
- US-101 (Generar dataset sintético): dataset con 64k+ casos, 26 enfermedades principales, distribución 1k-5k casos/enfermedad común, CSV exportado correctamente — Story Points: 8, Estado: Done

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 5: Dataset y Random Forest" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Generador de dataset sintético | `ai-services/ml_models/synthetic_dataset_generator.py`, `ai-services/scripts/training/generate_dataset.py`, `ai-services/data/datasets/dataset_registry.py` | Cesar Fabian Chavez Linares |
| Modelo Random Forest entrenado | `ai-services/ml_models/random_forest_model.py`, `ai-services/models/base_random_forest.pkl`, `ai-services/scripts/training/train_base_model.py` | Cesar Fabian Chavez Linares |
| Sistema de reglas de emergencia | `ai-services/strategies/rule_based_strategy.py`, `ai-services/services/medical_validation_rules.py` | Cesar Fabian Chavez Linares |
| Tests de componentes de ML y estrategia basada en reglas | `ai-services/tests/ml_models/test_ml_components.py`, `ai-services/tests/strategies/test_rule_based_strategy.py` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Secciones "Sprint 5: Dataset y Random Forest" y "Casos de Uso por Sprint > Sprint 5" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

**Evidencia de código (extractos reales verificados del repositorio):**

*Entregable: Sistema de reglas de emergencia / validación de coherencia médica*

`ai-services/services/medical_validation_rules.py` (líneas 113-134):

```python
    def validate_prediction(
        self,
        disease: str,
        symptoms: str,
        age: int,
        vitals: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Validate if predicted disease is plausible given symptoms, age and
        (optionally) wearable vitals captured near the time of the report (Sprint 13).

        Returns:
            Dict with validation status and any warnings
        """
        symptoms_lower = symptoms.lower()

        validation_status = {
            'is_valid': True,
            'warnings': [],
            'confidence_adjustment': 0.0,
            'urgency_escalation': False,
        }
```

*Entregable: Modelo Random Forest entrenado*

`ai-services/ml_models/random_forest_model.py` (líneas 128-147):

```python
    def train(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2):
        """
        Train Random Forest model
        
        Args:
            X: Feature matrix
            y: Labels
            test_size: Proportion of test set
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state, stratify=y
        )
        
        print(f"Training Random Forest with {self.n_estimators} trees...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        oob_score = self.model.oob_score_
```

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 5:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 26 SP planificados | 26 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 5 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 5 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 6.
