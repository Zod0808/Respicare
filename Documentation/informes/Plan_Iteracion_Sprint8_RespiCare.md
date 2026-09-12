# Plan de Iteración — Sprint 8: Analytics Avanzados

> Proyecto RespiCare — Sistema Web y Móvil para la detección de enfermedades respiratorias en Tacna
> Sprint 8 de 13 (Sprint 0 a Sprint 12)

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|---|---|---|---|
| v1.0 | 11/09/2026 | Cesar Fabian Chavez Linares | Plan de Iteración — Sprint 8: Analytics Avanzados |

## 1. Información General

| Campo | Valor |
|---|---|
| Laboratorio | Construcción de Software I — Proyecto RespiCare |
| Iteración | Sprint 8: Analytics Avanzados |
| Fecha Inicio | Semana 17 |
| Fecha Fin | Semana 18 |
| Líder | Cesar Fabian Chavez Linares |
| Equipo | Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD) |

## 2. Objetivo de la Iteración

Completar el dashboard de analítica con tendencias temporales, reportes geográficos y visualizaciones interactivas, cerrando la Fase 3 (Machine Learning).

## 3. Alcance

**Incluye:**

- Dashboard completo
- Tendencias temporales
- Reportes geográficos
- Visualizaciones interactivas

**Excluye:**

- Entregables de otras iteraciones (Sprint 7 y anteriores ya cerrados; Sprint 9 y posteriores aún no iniciados).

**Requerimientos Funcionales relacionados** (Documentation/trazabilidad/Matriz_Trazabilidad_RespiCare.xlsx):

- **RF-010**: Reportes y estadísticas — extensión
- **RF-012**: Geolocalización de centros de salud — asociado temáticamente — mapas geográficos, precursor de la geolocalización de centros de salud

**Requerimientos No Funcionales relacionados** (FD03-EPIS-Informe SRS de Proyecto.docx, Cuadro de Requerimientos No Funcionales):

- **RNF-002**: Rendimiento

## 4. Entregables Esperados

Entregables verificables comprometidos para el Sprint 8:

| Entregable | Descripción | Aceptado |
|---|---|---|
| Dashboard completo | Dashboard completo | Sí |
| Tendencias temporales | Tendencias temporales | Sí |
| Reportes geográficos | Reportes geográficos | Sí |
| Visualizaciones interactivas | Visualizaciones interactivas | Sí |

## 5. Cronograma y Actividades

Ceremonias y actividades del Sprint 8 (Semana 17 a Semana 18):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|---|---|---|---|---|---|
| A1 | Sprint Planning | Scrum Master + equipo | Semana 17 | Semana 17 | Completado |
| A2 | Desarrollo e implementación | Equipo de desarrollo | Semana 17 | Semana 18 | Completado |
| A3 | Code review y testing | Equipo de desarrollo | Semana 18 | Semana 18 | Completado |
| A4 | Sprint Review (Demo) | Product Owner + equipo | Semana 18 | Semana 18 | Completado |
| A5 | Retrospectiva | Scrum Master + equipo | Semana 18 | Semana 18 | Completado |

## 6. Recursos Requeridos

Personal, infraestructura y software utilizados en este Sprint:

- **Equipo**: Product Owner, Scrum Master, 2 Backend Developers (Node.js/TypeScript), 1 Frontend Developer (React), 1-2 AI/ML Engineers (Python/FastAPI), 1 DevOps Engineer (Docker/CI-CD)
- **Infraestructura**: Docker/Docker Compose, MongoDB, Redis, GitHub Actions (CI/CD)
- **Software**: Node.js/TypeScript, React, Python/FastAPI (según corresponda al sprint)

## 7. Riesgos y Mitigaciones

Riesgos identificados y gestionados durante el Sprint 8:

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Rendimiento de visualizaciones con volúmenes crecientes de datos históricos | Medio | Agregaciones pre-calculadas en backend y paginación en las consultas de tendencias |

## 8. Criterios de Aceptación

El Sprint 8 se considera exitoso cuando se cumple lo siguiente:

- Código implementado según estándares y aprobado en code review por al menos 2 peers
- Tests unitarios y de integración escritos y en verde (cobertura >80%)
- Sin regresiones ni bugs críticos introducidos
- Documentación actualizada (README, Swagger, comentarios en código complejo)
- Build pasa en CI/CD, imágenes Docker actualizadas y health checks OK

## 9. Evidencias

Fuentes documentales y de código verificadas para este Sprint:

| Evidencia | Ubicación | Responsable |
|---|---|---|
| Sección "Sprint 8: Analytics Avanzados" documentada | Documentation/METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |
| Dashboard de analítica con tendencias y visualizaciones | `web/src/components/AnalyticsDashboard.js`, `web/src/components/AnalyticsDashboardSimple.js` | Cesar Fabian Chavez Linares |
| Reportes geográficos y epidemiológicos (backend) | `backend/src/services/epidemiologicalService.ts`, `backend/src/services/analyticsService.ts` | Cesar Fabian Chavez Linares |
| Mapas de calor interactivos de reportes (heredados/extendidos desde Sprint 4) | `web/src/components/EpidemiologicalHeatmap.js`, `web/src/components/InteractiveHeatMap.js` | Cesar Fabian Chavez Linares |
| Tests de analítica y servicio epidemiológico | `web/src/components/__tests__/AnalyticsDashboard.test.js`, `backend/tests/unit/services/analyticsService.test.ts`, `backend/tests/unit/services/epidemiologicalService.test.ts`, `backend/tests/integration/analytics.integration.test.ts` | Cesar Fabian Chavez Linares |
| Fuente y verificación narrativa del Sprint | Sección "Sprint 8: Analytics Avanzados" de METODOLOGIA_AGIL_PROYECTO.md | Cesar Fabian Chavez Linares |

**Evidencia de código (extractos reales verificados del repositorio):**

*Entregable: Reportes geográficos*

`backend/src/services/epidemiologicalService.ts` (líneas 115-133):

```typescript
async predictOutbreaks(
  options: OutbreakPredictionOptions = {},
): Promise<OutbreakPrediction[]> {
  const {
    recentWindowDays = 7,
    baselineWindowDays = 21,
    growthThreshold = 0.35,
    minCases = 10,
  } = options;

  const now = new Date();
  const recentStart = new Date(now.getTime() - recentWindowDays * 24 * 60 * 60 * 1000);
  const baselineStart = new Date(
    recentStart.getTime() - baselineWindowDays * 24 * 60 * 60 * 1000,
  );

  try {
    const aggregation = await SymptomReportModel.aggregate([
      { $match: { createdAt: { $gte: baselineStart } } },
```

*Entregable: Dashboard completo / visualizaciones interactivas*

`web/src/components/AnalyticsDashboard.js` (líneas 20-28):

```javascript
function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [mlMetrics, setMlMetrics] = useState(null);
  const [mlError, setMlError] = useState(null);
  const [mlExperiments, setMlExperiments] = useState([]);
```

## 10. Indicadores de Éxito

Métricas que evidencian el resultado del Sprint 8:

| Indicador | Meta | Resultado | Estado |
|---|---|---|---|
| Entregables completados | 4/4 | 4/4 (100%) | ✅ Cumplido |
| Story Points | 24 SP planificados | 24 SP completados (100%) | ✅ Cumplido |
| Definition of Done | Todos los criterios de DoD cumplidos | Cumplido | ✅ Cumplido |

## 11. Seguimiento y Control

Ceremonias Scrum realizadas durante el Sprint según [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md): Daily Standups (15 min, diarios), Sprint Review (demo del incremento) y Retrospectiva (formato Start-Stop-Continue) al cierre del Sprint.

Sin impedimentos críticos reportados que afectaran el cierre del Sprint 8 según la documentación del proyecto.

## 12. Lecciones Aprendidas y Cierre

Cierre del Sprint 8 y aprendizajes incorporados a las siguientes iteraciones:

Aprendizajes documentados en la sección "Resultados y Lecciones Aprendidas" de `METODOLOGIA_AGIL_PROYECTO.md`, aplicados de forma acumulativa en el Sprint 9.
