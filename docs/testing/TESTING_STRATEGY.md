# 📋 Estrategia de Testing - RespiCare

## 🎯 Resumen Ejecutivo

Este documento presenta la estrategia integral de testing implementada para el sistema RespiCare, un sistema de gestión de enfermedades respiratorias que combina tecnologías de vanguardia con patrones de arquitectura robustos.

### Objetivos de Testing
- **Calidad**: Asegurar la calidad del software mediante pruebas exhaustivas
- **Confiabilidad**: Garantizar la estabilidad y confiabilidad del sistema
- **Mantenibilidad**: Facilitar el mantenimiento y evolución del código
- **Cumplimiento**: Cumplir con estándares de calidad médica y normativas
- **Documentación**: Proporcionar evidencia de calidad para stakeholders
- **Evidencia Regulada**: Mantener trazabilidad frente a auditorías de salud (HIPAA, LPD Perú)
- **Gobernanza ML**: Demostrar que los modelos mantienen precisión, equidad y resiliencia en el tiempo

## 🏗️ Arquitectura de Testing

### Estructura del Sistema
```
RespiCare Testing Architecture
├── 🤖 AI Services (Python/FastAPI)
│   ├── Unit Tests
│   ├── Integration Tests
│   ├── Pattern Tests
│   └── Performance Tests
├── 🖥️ Backend API (Node.js/TypeScript)
│   ├── Unit Tests
│   ├── Integration Tests
│   ├── API Tests
│   └── Security Tests
├── 🌐 Web Frontend (React/TypeScript)
│   ├── Unit Tests
│   ├── Component Tests
│   ├── Integration Tests
│   └── E2E Tests
└── 📱 Mobile App (React Native)
    ├── Unit Tests
    ├── Component Tests
    ├── Integration Tests
    └── E2E Tests
```

## 🧪 Tipos de Pruebas Implementadas

### 1. Pruebas Unitarias (Unit Tests)

#### AI Services - Python/FastAPI
- **Cobertura**: 85%+ de líneas de código
- **Framework**: pytest + pytest-asyncio
- **Patrones Probados**:
  - Strategy Pattern (OpenAI, Local Models, Rule-based)
  - Factory Pattern (Service, Model, Strategy Factories)
  - Circuit Breaker Pattern (OpenAI, External Services)
  - Repository Pattern (Medical History, AI Results, Patients)
  - Decorator Pattern (Cache, Logging, Retry, Metrics)

#### Backend API - Node.js/TypeScript
- **Cobertura**: 80%+ de líneas de código
- **Framework**: Jest + Supertest
- **Componentes Probados**:
  - Controllers (Auth, Medical History, Symptom Analysis)
  - Services (AI Integration, Export, File Upload)
  - Models (User, Medical History, AI Analysis)
  - Middleware (Auth, Validation, Error Handling)
  - Routes (API endpoints)

#### Web Frontend - React/TypeScript
- **Cobertura**: 70%+ de líneas de código
- **Framework**: Jest + React Testing Library
- **Componentes Probados**:
  - UI Components (Forms, Tables, Charts)
  - Hooks (Custom hooks para estado y API)
  - Utils (Helpers, validators, formatters)
  - Pages (Dashboard, Patient Management, Reports)

### 2. Pruebas de Componente (Component Tests)

A diferencia de las pruebas unitarias de la sección 1 (funciones puras, servicios, utils), las pruebas de componente renderizan el árbol de un componente de UI real con `@testing-library/react` (tanto en web como en mobile, que es una app React sobre Next.js + Capacitor), verificando su salida DOM, props, estado interno e interacción del usuario, con los servicios de backend/API siempre mockeados (nunca se levanta un servidor real).

#### Web Frontend — React
- **Framework**: Jest + `@testing-library/react` + `@testing-library/user-event`
- **Cobertura real**: 41 archivos en `web/src/components/__tests__/*.test.js` (p.ej. `Navbar.test.js`, `ChatBotEnhanced.test.js`, `AnalyticsDashboard.test.js`, `SHAPVisualization.test.js`, `AlertConsole.test.js`) más 9 en `web/src/pages/__tests__/`, para un total de 60 archivos de prueba a nivel de componente/página.
- **Qué verifican**: renderizado condicional, manejo de estados de carga/error, interacciones (`fireEvent`/`userEvent`), atributos ARIA, y mocking de `axios` para aislar el componente del backend real.
- **Detalle por componente**: ver `docs/testing/WEB_UNIT_TESTS_SUMMARY.md`.

#### Mobile App — React (Next.js + Capacitor)
- **Framework**: Jest + `@testing-library/react`
- **Cobertura real**: `mobile/__tests__/components/symptomAnalyzer.test.tsx` (renderizado, selección de síntomas y flujo de análisis del componente `SymptomAnalyzer`), `mobile/__tests__/components/audioPermissions.test.tsx`, y `mobile/medical-app/__tests__/tabs/wearables.test.tsx` (renderizado del tab `WearablesView` con `wearableService`, `useVitalsSource` y estados BLE mockeados).
- **Qué verifican**: renderizado de vistas/tabs con dependencias nativas (iconos, hooks de sensores, servicios de wearables) mockeadas, para aislar el componente de hardware real o del backend.

#### Backend API — Node.js/TypeScript
- El backend no expone componentes de UI; su nivel equivalente de "component testing" (ISO/IEC/IEEE 29119-3) queda cubierto por las pruebas unitarias de controllers/services/models de la sección 1, cada uno probado de forma aislada con sus dependencias (MongoDB, servicios externos) mockeadas.

### 3. Pruebas de Integración (Integration Tests)

#### API Integration Tests
- **Endpoints**: Todos los endpoints REST
- **Autenticación**: JWT, Refresh Tokens, RBAC
- **Base de Datos**: Operaciones CRUD, Transacciones
- **Servicios Externos**: OpenAI API, File Storage, Email

#### Service Integration Tests
- **AI Services**: Comunicación entre servicios
- **Data Flow**: Flujo de datos entre componentes
- **Error Handling**: Manejo de errores en cascada
- **Performance**: Tiempos de respuesta y throughput
- **Analytics/Monitoring**: Endpoints `/api/v1/analytics/*` y `/api/v1/analytics/ml/*` verifican KPIs, predicciones, explicabilidad SHAP y métricas de fairness

### 4. Pruebas de Patrones de Diseño

#### Strategy Pattern Tests
- **Intercambiabilidad**: Cambio dinámico de estrategias
- **Fallback**: Estrategias de respaldo
- **Performance**: Comparación de rendimiento entre estrategias
- **Error Handling**: Manejo de fallos por estrategia

#### Circuit Breaker Tests
- **Threshold**: Apertura de circuitos por umbral de fallos
- **Recovery**: Recuperación automática
- **Half-Open State**: Estado de recuperación
- **Metrics**: Métricas de circuitos

#### Repository Pattern Tests
- **CRUD Operations**: Operaciones básicas de datos
- **Audit Trail**: Trazabilidad de cambios
- **Soft Delete**: Eliminación lógica
- **Versioning**: Control de versiones

#### Decorator Pattern Tests
- **Cross-cutting Concerns**: Funcionalidades transversales
- **Performance**: Impacto en rendimiento
- **Error Propagation**: Propagación de errores
- **Composition**: Combinación de decoradores

### 5. Pruebas de Rendimiento (Performance Tests)

#### Load Testing
- **Concurrent Users**: 100+ usuarios simultáneos
- **API Endpoints**: Tiempo de respuesta < 500ms
- **Database Queries**: Optimización de consultas
- **Memory Usage**: Uso eficiente de memoria

#### Stress Testing
- **Peak Load**: Carga máxima del sistema
- **Resource Limits**: Límites de recursos
- **Degradation**: Degradación gradual
- **Recovery**: Recuperación post-stress

### 6. Pruebas de Seguridad (Security Tests)

#### Authentication & Authorization
- **JWT Validation**: Validación de tokens
- **Role-based Access**: Control de acceso por roles
- **Session Management**: Gestión de sesiones
- **Password Security**: Seguridad de contraseñas

#### Data Protection
- **Input Validation**: Validación de entrada
- **SQL Injection**: Prevención de inyección SQL
- **XSS Protection**: Protección contra XSS
- **Data Encryption**: Encriptación de datos

### 7. Pruebas End-to-End (E2E Tests)

#### User Journeys
- **Patient Registration**: Registro de pacientes
- **Medical History**: Creación de historias médicas
- **Symptom Analysis**: Análisis de síntomas (incluye recomendaciones IA)
- **Report Generation**: Generación de reportes PDF/CSV
- **Alert Response**: Flujo completo de alertas respiratorias
- **Offline Sync**: Uso móvil sin conexión y posterior sincronización

#### Cross-Platform Testing
- **Web Application**: Navegadores modernos
- **Mobile Application**: iOS y Android
- **API Integration**: Integración entre servicios
- **Real-time Features**: Funcionalidades en tiempo real
- **Interoperabilidad**: HL7 → FHIR → almacenamiento interno

---

### 8. Pruebas de Humo (Smoke Tests)
- **Objetivo**: Validación rápida de "¿sigue vivo el sistema?" tras cada deploy, antes de correr las suites completas o de promover tráfico.
- **AI Services**: `ai-services/tests/ml_models/test_advanced_ml_smoke.py` — `TestAdvancedNLPSmoke` (procesamiento de texto, resumen médico, traducción de términos, sentimiento, extracción de entidades) y `TestAutoMLSmoke` (selección de modelo, tuning de hiperparámetros, selección de features, detección de drift, reentrenamiento automático), más `TestFederatedLearningSmoke` (registro de clientes y ronda FedAvg).
- **Staging (CI/CD)**: job `smoke-tests` en `.github/workflows/deploy-staging.yml` — health check de Backend y de AI Services, y "Run API Smoke Tests" contra endpoints básicos, ejecutado post-deploy antes de habilitar el job `rollback-on-failure`.
- **Producción (CI/CD)**: job `production-smoke-tests` en `.github/workflows/deploy-production.yml` — health checks de Backend/AI Services con reintentos (5 intentos, backoff de 10s) y verificación del endpoint crítico de autenticación, condición previa al blue-green promote; su fallo dispara `rollback-production`.
- **Alcance**: intencionalmente superficial (sin datos ni escenarios complejos) para dar una señal go/no-go en segundos, a diferencia de la sección 9 (Regresión), que sí corre las suites completas.

### 9. Pruebas de Regresión
- **Objetivo**: Detectar regresiones funcionales tras nuevas features o reentrenamiento ML.
- **Disparo real**: GitHub Actions ejecuta las suites completas por servicio en cada `push`/`pull_request` a `main`/`develop` filtrado por paths (`backend-tests.yml`, `web-tests.yml`, `ai-services-tests.yml`, `mobile-ci.yml`, `testing.yml`). No existe actualmente un job `schedule:` (nightly) para estas suites funcionales — el `schedule:` solo está configurado en los workflows de seguridad (`dast-scan.yml`, `sast-scan.yml`, `scorecard.yml`, `security-zap.yml`, `static-code-analysis.yml`); esta ausencia queda registrada explícitamente en vez de asumida.
- **Suite dedicada de regresión de prompts LLM**: `ai-services/tests/llm/test_prompt_regression.py` — captura snapshots de prompts (`TestPromptSnapshots`), compatibilidad de parsers hacia atrás (`TestParserBackwardCompatibility`), extracción de JSON (`TestJsonExtractionRegression`), consistencia de idioma (`TestPromptLanguageConsistency`) y formato de síntomas (`TestSymptomFormattingRegression`), para detectar cambios no intencionales en el comportamiento del LLM tras ajustes de prompt o de modelo.
- **Herramientas**: snapshots de Jest (web/backend) y pytest (AI Services), matrices de GitHub Actions por servicio.

### 10. Pruebas de Aceptación de Usuario (UAT)
- **Participantes**: Personal médico (neumólogos, epidemiólogos) y administradores.
- **Enfoque**: Validar requisitos clínicos, protocolos de emergencia y usabilidad del dashboard ejecutivo.
- **Evidencia**: Actas UAT y checklist médico anexados al backlog.

### 11. Pruebas Específicas de ML/IA
- **Drift Detection**: Monitoreo estadístico (KS-test, PSI) de entradas y salidas.
- **Fairness Testing**: Métricas segmentadas por edad, género y distrito.
- **Model Validation**: Comparación de modelos nuevos vs producción (t-test de accuracy, curvas ROC).
- **Adversarial Testing**: Inputs maliciosos al chatbot y servicios ML (ruido, mezcla idiomas, emoji).
- **Data Quality Tests**: Validación de datasets con Great Expectations (disponible en backlog).
- **Suite dedicada**: `ml_tests/test_fairness_and_drift.py` cubre PSI, fairness por cohortes, anomalías y exportaciones.
- **Explicabilidad visual**: Verificación de API `ml-explanation` y dashboard `ShapDashboard` (React) para consistencia de factores positivos/negativos y confianza reportada.

### 12. Pruebas de Accesibilidad (A11y)
- **Estándar**: WCAG 2.1 nivel AA.
- **Cobertura**: Navegación por teclado, lectores de pantalla, contraste, labels en visualizaciones.
- **Herramientas**: axe-core, Lighthouse, NVDA/VoiceOver.

### 13. Pruebas de Compatibilidad
- **Navegadores**: Chrome, Firefox, Edge, Safari.
- **Dispositivos**: iOS 15+, Android 11+, tablets.
- **Resoluciones**: 1280×720 hasta 2560×1440, modo oscuro/claro.

### 14. Pruebas de Carga y Estrés Extendidas
- **Escenarios**:
  - 100 usuarios concurrentes (objetivo mínimo) y 250 en estrés.
  - 1000 predicciones ML por minuto.
  - 500 sincronizaciones móviles simultáneas.
- **KPIs**: Redis hit rate > 90%, respuesta API < 500 ms p95, AI Services < 800 ms p95.

### 15. Pruebas de Recuperación ante Desastres
- **Casos**:
  - Caída de MongoDB → Redis y colas offline sostienen operaciones.
  - Falla de AI Services → Backend entrega fallback y alerta interna.
  - Pérdida de conectividad móvil → Persistencia local y reintentos programados.
- **Objetivos**: RTO < 10 min, RPO < 5 min.

### 16. Pruebas de Interoperabilidad
- **HL7 v2/v3**: Parser `hl7Parser.ts` evaluado con mensajes reales/malformados.
- **FHIR**: Cliente `fhirService.ts` probado contra servidores HAPI y bundles transaccionales.
- **Integraciones externas**: Pruebas contractuales con hospitales asociados.

### 17. Pruebas de Cumplimiento Normativo
- **Regulaciones**: HIPAA (si aplica), Ley de Protección de Datos Personales (Perú), estándares médicos locales.
- **Chequeos**: Encriptación, auditoría de accesos, consentimiento informado, retención y purga de datos.

### 18. Pruebas de Usabilidad
- **Métricas**: Tiempo de tarea (<2 min promedio), tasa de error, System Usability Scale ≥ 80.
- **Metodologías**: Sesiones “think aloud”, encuestas, pruebas remotas con personal médico.

## 🛠️ Herramientas y Frameworks

### Testing Frameworks
| Componente | Framework | Versión | Propósito |
|------------|-----------|---------|-----------|
| AI Services | pytest + pytest-asyncio + pytest-benchmark | 7.4.3 / 0.21.1 | Unit, Integration, Performance & ML fairness |
| Backend API | Jest + Supertest | 29.7.0 | Unit & Integration Tests |
| Web Frontend | Jest + RTL + axe-core | 29.7.0 | Component, Unit & Accesibilidad |
| Mobile App | Jest + RTL | 29.7.0 | Component & Unit Tests |
| E2E Tests | Playwright / Detox | 1.40.0 / 20.5.0 | End-to-End Web & Mobile |
| Load/Stress | k6 / Artillery | 0.46.0 / 2.x | Performance y resiliencia |
| Data Quality (planificado) | Great Expectations | 0.18.x | Validación de datasets ML |

### Coverage Tools
| Herramienta | Cobertura Objetivo | Reportes |
|-------------|-------------------|----------|
| pytest-cov | 85%+ | HTML, XML, Terminal |
| Jest Coverage | 80%+ | HTML, LCOV, JSON |
| Codecov | 75%+ | Dashboard, PR Comments |
| sonar-scanner (planificado) | 85%+ | SonarQube dashboard |

### Mocking & Stubbing
| Herramienta | Propósito |
|-------------|-----------|
| unittest.mock | Python mocking |
| jest.fn() | JavaScript mocking |
| fakeredis | Redis mocking |
| mongomock | MongoDB mocking |
| MSW | API mocking |

### Performance Testing
| Herramienta | Propósito |
|-------------|-----------|
| pytest-benchmark | Python performance |
| Artillery | Load testing |
| k6 | Performance testing |
| Lighthouse | Web performance |

## 📊 Métricas de Calidad

### Cobertura de Código
| Componente | Cobertura mínima | Cobertura ideal | Estado actual (líneas) |
|------------|------------------|-----------------|---------------|
| Backend API | 80% | 90%+ | ✅ 80.44% (cumplido al límite) |
| Web Frontend | 70% | 80%+ | ⚙️ 75.67% (plan: 82% tras Sprints 12-13) |
| Mobile App | 70% | 80%+ | ⚠️ Sin métrica global (Jest instrumenta solo 2 archivos) |
| AI Services | 60% | 95%+ | ⚠️ 49.37% (suite `ml_tests` con fairness/drift + endpoints `ml_monitoring`) |
| APIs críticas | 90% | 95%+ | ✅ 94% |
| Lógica crítica (auth, alertas, ML core) | 100% | 100% | ⚙️ 95% (gap en adversarial testing) |

### Métricas de Testing
- **Test Execution Time**: < 5 min (suites unitarias), < 15 min pipeline completo.
- **Test Reliability**: 99%+ de tests pasan consistentemente.
- **Test Maintenance**: < 10% del tiempo de desarrollo.
- **Bug Detection**: 90%+ de bugs detectados en testing.
- **Regresión Automatizada**: 100% de PRs ejecutan suites web/mobile/backend/ML.
- **Cobertura Global**: 78% actual → meta 85% antes del go-live.

### Métricas de Performance
- **API Response Time**: < 500ms para 95% de requests
- **Database Query Time**: < 100ms para queries simples
- **Memory Usage**: < 512MB por servicio
- **CPU Usage**: < 70% bajo carga normal

## 🔄 Proceso de Testing

### 1. Desarrollo (Development)
```bash
# AI Services
pytest tests/ --cov=. --cov-report=term-missing
pytest tests/ml_models/test_analytics_models.py --benchmark-disable
# Fairness & drift (pipeline planificado)
# python scripts/validate_fairness.py --output artifacts/fairness-report.json

# Backend API
npm test -- --coverage

# Web Frontend
npm test -- --coverage

# Mobile App
npm test -- --coverage

# Accesibilidad Web
npx jest --runTestsByPath src/components/__tests__/a11y.test.js
```

### 2. Integración Continua (CI/CD)
```yaml
# GitHub Actions Workflow
name: Testing Pipeline
on: [push, pull_request]
jobs:
  test-ai-services:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
      - name: Install dependencies
        run: pip install -r ai-services/requirements-test.txt
      - name: Run tests
        run: pytest ai-services/tests/ --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 3. Pre-deployment
- **Smoke Tests**: Validación básica de funcionalidad.
- **Regression Tests**: Suites completas antes de liberar.
- **Performance Tests**: Validación de cargas objetivo.
- **Security Tests**: Escaneo de vulnerabilidades.
- **Accesibilidad**: Reporte Lighthouse ≥ 90.
- **Interoperabilidad**: Suite HL7/FHIR contra sandbox hospitalario.
- **Backups**: Verificación de restauración de snapshot previo a deploy.

### 4. Post-deployment
- **Health Checks**: Monitoreo de salud del sistema
- **Performance Monitoring**: Monitoreo de rendimiento
- **Error Tracking**: Seguimiento de errores
- **User Feedback**: Retroalimentación de usuarios
- **ML Monitoring**: Validación diaria de drift/fairness y retraining controlado
- **Synthetic Monitoring**: Flujos automáticos cada hora (login, análisis de síntomas, sync móvil)

## 📋 Casos de Prueba Críticos

### Casos de Prueba Médicos
1. **Análisis de Síntomas Críticos**
   - Síntomas de alta urgencia
   - Detección de signos de alarma
   - Recomendaciones de emergencia

2. **Procesamiento de Historias Médicas**
   - Extracción de entidades médicas
   - Identificación de factores de riesgo
   - Sugerencias de diagnóstico

3. **Cumplimiento Normativo**
   - HIPAA compliance
   - GDPR compliance
   - Auditoría de datos médicos

### Casos de Prueba Técnicos
1. **Escalabilidad**
   - Carga de 100+ usuarios simultáneos
   - Procesamiento de 1000+ historias médicas
   - Análisis de 500+ síntomas por minuto

2. **Disponibilidad**
   - 99.9% uptime
   - Recuperación automática de fallos
   - Circuit breakers funcionales

3. **Seguridad**
   - Encriptación de datos sensibles
   - Autenticación robusta
   - Prevención de ataques comunes
   - Cumplimiento HIPAA/LPD: mascarado, logs auditables, retención

4. **Recuperación**
   - Failover Redis/Mongo
   - Caída de AI Services
   - Interrupción red móvil

5. **Interoperabilidad**
   - Mensajes HL7 malformados vs parser
   - Bundles FHIR inconsistentes
   - Versionado y conciliación de pacientes multi-sistema

## 🚀 Automatización de Testing

### Test Automation Pipeline
1. **Commit Hook**: Tests unitarios automáticos (lint + coverage mínima).
2. **Pull Request**: Tests de integración, regresión ML y análisis de cobertura.
3. **Merge**: Suites completas (web, mobile, backend, ML) + generación de reportes HTML.
4. **Pre-Deploy**: Smoke, performance, accesibilidad, interoperabilidad, compliance.
5. **Deploy**: Validación de ambiente, backups verificados, ejecución Playwright/Detox.
6. **Monitoring**: Tests continuos en producción (synthetic, drift/fairness, alertas).

### Continuous Testing
- **24/7 Monitoring**: Monitoreo continuo (APM + synthetic tests).
- **Automated Alerts**: Alertas automáticas por métricas de cobertura, drift y errores críticos.
- **Self-healing**: Auto-reinicio de servicios y reintentos configurados.
- **Feedback Loop**: Retroalimentación automática de usuarios y médicos en dashboards.
- **ML Monitoring**: Tablero de métricas de precisión/recall por cohorte.
- **Drift/Fairness Alerts**: Notificaciones cuando KS/PSI o métricas de equidad superan umbrales.

## 📈 Mejora Continua

### Métricas de Mejora
- **Test Coverage**: Incremento del 5% trimestral (meta ≥90% global).
- **Test Execution Time**: Reducción del 10% trimestral.
- **Bug Detection Rate**: Incremento del 5% trimestral.
- **Test Maintenance Cost**: Reducción del 15% trimestral.
- **Métricas ML**: Mantener drift/fairness en umbrales verdes el 95% del tiempo.
- **Accesibilidad**: Mantener Lighthouse ≥ 90 en accesibilidad.

### Procesos de Mejora
1. **Retrospectivas**: Análisis mensual de testing
2. **Training**: Capacitación continua del equipo
3. **Tooling**: Actualización de herramientas
4. **Best Practices**: Adopción de mejores prácticas
5. **ML Ops Reviews**: Revisión trimestral de modelos y datasets
6. **Game Days**: Simulacros bimestrales de recuperación ante desastres

## 📚 Documentación y Capacitación

### Documentación Técnica
- **Test Strategy**: Estrategia de testing
- **Test Plans**: Planes de prueba detallados
- **Test Cases**: Casos de prueba específicos
- **Test Reports**: Reportes de ejecución

### Capacitación del Equipo
- **Testing Fundamentals**: Fundamentos de testing
- **Tool Usage**: Uso de herramientas
- **Best Practices**: Mejores prácticas
- **Continuous Learning**: Aprendizaje continuo

## 🎯 Conclusión

La estrategia de testing implementada para RespiCare proporciona:

1. **Cobertura Integral**: Tests para todos los componentes críticos
2. **Calidad Asegurada**: Estándares altos de calidad
3. **Confiabilidad**: Sistema robusto y confiable
4. **Mantenibilidad**: Código fácil de mantener
5. **Escalabilidad**: Preparado para crecimiento futuro
6. **Gobernanza ML**: Controles de drift, fairness y validación continua de modelos
7. **Cumplimiento**: Evidencia frente a auditorías clínicas, regulatorias e interoperabilidad
8. **Experiencia de Usuario**: Pruebas UAT y usabilidad alineadas con el personal médico

Siguientes pasos prioritarios:
- Elevar cobertura web/mobile por encima del 80% con suites adicionales (dashboard, offline, sync).
- Completar escenarios adversariales en ai-services y documentar cobertura ML (fairness/drift ya cubiertos en `ml_tests`).
- Ejecutar campañas de accesibilidad (WCAG 2.1 AA), recuperaciones simuladas y pruebas de compliance HL7/FHIR antes del lanzamiento productivo.

Con estos compromisos, RespiCare estará alineado con los estándares de software médico en producción, garantizando calidad, resiliencia y confianza para usuarios y entidades reguladoras.

---

**Última actualización:** Noviembre 2025