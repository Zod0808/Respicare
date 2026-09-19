# Informe Ejecutivo del Proyecto de Software

## 1. Información General

| Campo | Detalle |
|:---|:---|
| **Nombre del proyecto** | RespiCare — Sistema Web y Móvil para la Detección de Enfermedades Respiratorias en Tacna |
| **Institución / Asignatura** | Universidad Privada de Tacna (EPIS) — Construcción de Software II |
| **Docente** | Ing. Ricardo Valcárcel Alvarado |
| **Cliente / Organización de referencia** | Proyecto académico orientado al ámbito de salud pública de Tacna (DIRESA Tacna / MINSA como stakeholders institucionales de referencia para la interoperabilidad); sin despliegue productivo formal ante dichas entidades a la fecha |
| **Responsables del proyecto** | Chávez Linares, Cesar Fabian y Paja de la Cruz, Piero — equipo de desarrollo |
| **Fecha del informe** | 18 de septiembre de 2026 |
| **Periodo evaluado** | Semana 1 – Semana 28 (Sprint 0 a Sprint 13, 14 iteraciones) |
| **Estado del proyecto** | En pruebas y cierre de documentación (implementación funcional completa; Sprint 13 en ejecución) |

## 2. Resumen Ejecutivo

El proyecto **RespiCare** tiene como objetivo desarrollar e implementar una plataforma web y móvil de apoyo al diagnóstico que permita la **detección temprana de enfermedades respiratorias** en la población de Tacna, mediante un motor de inteligencia artificial multimodal (síntomas, audio de tos y voz, e imágenes médicas) accesible tanto para pacientes como para personal médico.

Durante el periodo evaluado, el proyecto ha alcanzado aproximadamente **93% de avance global**, cumpliendo con las 14 iteraciones planificadas (Sprint 0 a Sprint 13) bajo metodología SCRUM, entre ellas: el establecimiento de la arquitectura base y autenticación (Sprint 0-1), el historial clínico y motor de diagnóstico de síntomas (Sprint 2), el sistema de Machine Learning con Random Forest/XGBoost y explicabilidad SHAP (Sprint 5-8), el análisis multimodal por audio (Whisper) e imágenes médicas (ResNet50), el chatbot clínico, la interoperabilidad HL7/FHIR y los dashboards ejecutivos (Sprint 10-12), y la extensión de alcance del Sprint 13: API de interoperabilidad institucional MINSA/SINADEF e integración de datos de wearables con la capa de validación clínica de la IA.

La solución contempla funcionalidades orientadas a la **gestión de información clínica** (historial médico, citas, prescripciones, resultados de laboratorio), la **automatización del diagnóstico** mediante modelos de IA entrenados y explicables, la **generación de reportes y dashboards** ejecutivos con indicadores clínicos, y la **integración con sistemas externos** (estándar HL7/FHIR, API institucional MINSA/SINADEF y dispositivos wearables vía Bluetooth Low Energy, Health Connect y HealthKit), con el propósito de mejorar la oportunidad de detección, reducir el subregistro de casos respiratorios y facilitar la toma de decisiones clínicas.

A la fecha, el proyecto presenta un estado **normal**, sin riesgos bloqueantes. Se han identificado y gestionado riesgos técnicos puntuales —como un sesgo demográfico detectado en el modelo XGBoost (brecha de 7.3 puntos porcentuales de *accuracy* entre segmentos etarios) y brechas menores de accesibilidad (contraste WCAG en tema oscuro)— que se encuentran documentados en el backlog técnico y no comprometen la operatividad general del sistema.

## 3. Objetivos del Proyecto

**Objetivo general:** Desarrollar e implementar una plataforma web y móvil de apoyo al diagnóstico de enfermedades respiratorias mediante inteligencia artificial, optimizando la detección temprana y el seguimiento clínico de pacientes en la región de Tacna.

**Objetivos específicos:**

- Automatizar el análisis de síntomas, audio de tos/voz e imágenes médicas mediante modelos de Machine Learning explicables (SHAP).
- Centralizar y organizar la información clínica de pacientes: historial médico, citas, prescripciones, resultados de laboratorio, consentimientos y derivaciones.
- Reducir los tiempos de orientación diagnóstica inicial mediante un chatbot clínico asistido por IA disponible en web y móvil.
- Mejorar la disponibilidad y seguridad de la información mediante autenticación JWT, control de acceso por roles (RBAC) y persistencia en MongoDB/Redis.
- Generar reportes y dashboards ejecutivos con indicadores clínicos y epidemiológicos para apoyar la toma de decisiones.
- Facilitar la integración con sistemas externos: estándar HL7/FHIR, API de interoperabilidad institucional MINSA/SINADEF y dispositivos wearables (BLE, Health Connect, HealthKit) como capa adicional de validación clínica.

## 4. Alcance

El proyecto comprende el análisis, diseño, desarrollo, pruebas y despliegue en ambiente de demostración/producción del sistema RespiCare (web, backend, servicios de IA y aplicación móvil).

Las principales funcionalidades consideradas son:

- Gestión de usuarios y perfiles con control de acceso por roles (paciente, médico, administrador).
- Registro y administración del historial clínico, citas médicas, prescripciones, resultados de laboratorio, consentimientos y derivaciones.
- Motor de diagnóstico inteligente: análisis de síntomas, análisis de audio de tos/voz (Whisper) y análisis de imágenes médicas (ResNet50), con explicabilidad SHAP.
- Chatbot clínico multimodal integrado en web y móvil.
- Monitoreo de signos vitales mediante wearables (BLE, Health Connect en Android, HealthKit en iOS) como señal de validación clínica adicional del motor de IA.
- Dashboards ejecutivos con indicadores clínicos y epidemiológicos.
- Panel de control de accesos y seguridad (JWT, RBAC, rotación de tokens).
- Integración con sistemas externos: estándar HL7/FHIR y API institucional MINSA/SINADEF.

Quedan fuera del alcance, salvo aprobación de cambios: la certificación regulatoria del sistema como dispositivo médico o software clínico certificado, el despliegue productivo formal ante DIRESA Tacna/MINSA con datos de pacientes reales, y la publicación de la aplicación móvil en tiendas públicas (Google Play/App Store) — actualmente se distribuye como APK debug/release generado mediante Capacitor.

## 5. Avance del Proyecto

| Área | Avance | Estado |
|:---|:---:|:---|
| Levantamiento de requerimientos | 100% | Completado |
| Análisis y diseño (arquitectura, modelo de datos, UML) | 100% | Completado |
| Desarrollo (14 iteraciones: Sprint 0 a Sprint 13) | 100% | Completado |
| Pruebas (cobertura global ponderada 82.78%, meta 80% superada) | 83% | En progreso |
| Implementación / despliegue (web y backend activos; app móvil en APK) | 85% | En progreso |
| Documentación de cierre (OpenAPI, README/ROADMAP, matriz de trazabilidad Sprint 13) | 90% | En progreso |
| **Avance general** | **93%** | **En progreso** |

## 6. Principales Entregables

- Documento de requerimientos y planes de iteración por sprint (Sprint 0 a Sprint 13).
- Diseño funcional y técnico, diagramas de arquitectura y modelo de datos.
- Arquitectura de la solución: backend Node.js/Express/TypeScript, servicios de IA en Python/FastAPI, frontend React 18, app móvil Next.js + Capacitor, orquestación con Docker Compose.
- Base de datos MongoDB 6.0 con caché Redis 7.
- Aplicación web (dashboard clínico) y aplicación móvil (Android APK).
- Especificaciones y evidencias de casos de prueba (unitarios, integración, alfa) por requerimiento funcional.
- Documentación técnica: informes de solución tecnológica, resultados de plan de iteraciones, resultados de pruebas, roadmaps de módulos (ML, móvil, auditoría).
- Sistema desplegado en ambiente de demostración/producción (Docker + Nginx + Cloudflare Tunnel; frontend en Vercel).

## 7. Riesgos y Problemas Identificados

| Riesgo / Problema | Impacto | Acción propuesta |
|:---|:---:|:---|
| Sesgo demográfico en el modelo XGBoost (7.3 pp de diferencia de *accuracy* entre segmentos etarios ≥70 años vs. 18-40 años) | Alto | Rebalancear el dataset de entrenamiento con mayor representación de adultos mayores; umbral máximo de diferencia entre segmentos ≤ 3% |
| Brecha residual de accesibilidad WCAG (contraste en tema oscuro) | Medio | Ajustar la paleta de colores del tema oscuro y re-ejecutar pruebas de accesibilidad automatizadas |
| Verificación nativa de wearables (Health Connect/HealthKit) pendiente sobre dispositivo/emulador real | Medio | Generar proyectos nativos (`npx cap add android/ios`) y validar en Android Studio/Xcode antes de la puesta en producción |
| Cierre de documentación técnica del Sprint 13 (OpenAPI dedicado, README/ROADMAP, matriz de trazabilidad) | Bajo | Completar la documentación de cierre en el sprint de estabilización final |
| Dependencia de PyTorch en entorno Windows para 9 archivos de test de IA (bloqueo local, no afecta CI) | Bajo | Ejecutar dichas suites exclusivamente en el pipeline Linux de GitHub Actions (ya mitigado) |

## 8. Recursos

**Equipo humano:** Cesar Fabian Chávez Linares y Piero Paja de la Cruz, cubriendo de forma conjunta los roles de Líder de proyecto / Scrum Master, Backend Developer (Node.js/TypeScript), Frontend Developer (React), Mobile Developer (Next.js/Capacitor), Ingeniero(a) de IA/ML (Python/FastAPI) y QA/Tester.

**Recursos tecnológicos:** Docker Compose (orquestación de servicios), MongoDB 6.0 y Redis 7 (persistencia y caché), Nginx y Cloudflare Tunnel (proxy inverso y exposición segura), GitHub y GitHub Actions (control de versiones y CI/CD), Vercel (despliegue del frontend web), Jest, pytest, SonarQube, `tsc --noEmit` y `mypy` (herramientas de prueba y análisis estático), Docker/coverage.xml (medición de cobertura).

## 9. Cronograma

Las 14 iteraciones del proyecto se ejecutaron entre la Semana 1 y la Semana 28:

1. Sprint 0 — Arquitectura base y configuración del entorno.
2. Sprint 1 — Autenticación, control de acceso por roles e historial clínico (EPIC-01, EPIC-02).
3. Sprint 2 — Motor de diagnóstico inteligente de síntomas respiratorios (EPIC-03).
4. Sprint 3-4 — MVP de frontend/dashboard, servicios de IA, chatbot y analítica básica.
5. Sprint 5-8 — Sistema de Machine Learning (Random Forest/XGBoost), explicabilidad SHAP e integración con el chatbot.
6. Sprint 9 — Refinamiento, documentación y preparación para producción.
7. Sprint 10-12 — Interoperabilidad HL7/FHIR, dashboard ejecutivo y modelos ML predictivos.
8. Sprint 13 — Extensión de alcance: API de interoperabilidad institucional MINSA/SINADEF e integración de datos de wearables con la capa de validación clínica de la IA (en ejecución: implementación funcional completa, documentación de cierre pendiente).

**Fecha estimada de finalización:** Semana 28 (cierre de documentación y estabilización final).

## 10. Presupuesto

El proyecto se desarrolla en el marco de un trabajo académico de la asignatura Construcción de Software II, por lo que no cuenta con un presupuesto monetario asignado. Los recursos tecnológicos empleados corresponden principalmente a herramientas e infraestructura de bajo costo o de nivel gratuito: repositorio GitHub, pipelines de GitHub Actions, despliegue del frontend en Vercel (plan gratuito) y contenedores Docker autoalojados con exposición mediante Cloudflare Tunnel.

**Presupuesto ejecutado:** No aplica (infraestructura gratuita/autoalojada).
**Presupuesto restante:** No aplica.

## 11. Próximas Actividades

- Completar la documentación de cierre del Sprint 13 (especificación OpenAPI dedicada, actualización de README/ROADMAP y matriz de trazabilidad de requerimientos).
- Generar y validar los proyectos nativos Android/iOS (`npx cap add android/ios`) para verificar en dispositivo/emulador real la integración con Health Connect y HealthKit.
- Rebalancear el dataset de entrenamiento del modelo XGBoost para reducir el sesgo demográfico detectado (CP-ML-001).
- Resolver la brecha residual de contraste WCAG en el tema oscuro del frontend web.
- Consolidar la suite de pruebas pendiente en el backlog técnico (6 casos de AI Services, 1 de accesibilidad web, 2 de gobernanza ML).
- Preparar la documentación final y el material de sustentación del proyecto.

## 12. Conclusión

El proyecto **RespiCare** presenta un avance de **93%** y ha completado la totalidad de las 14 iteraciones planificadas (Sprint 0 a Sprint 13), con una cobertura de pruebas global ponderada del **82.78%**, superando la meta del 80% definida en el Definition of Done. Las actividades principales se encuentran **dentro del cronograma**, y se han identificado y documentado las acciones necesarias para gestionar los riesgos técnicos existentes (sesgo del modelo, accesibilidad, verificación nativa de wearables).

El siguiente hito relevante corresponde al **cierre de la documentación técnica del Sprint 13 y la validación nativa de la integración de wearables**, cuya culminación permitirá avanzar hacia la estabilización final y la preparación de la sustentación del proyecto.

**Responsables:** Chávez Linares, Cesar Fabian y Paja de la Cruz, Piero
**Cargo:** Equipo de desarrollo — Full-Stack & IA
**Fecha:** 18 de septiembre de 2026

## 13. Anexos — Evidencias Gráficas

A continuación se presentan capturas y gráficos que evidencian el estado actual del sistema RespiCare, extraídos directamente del repositorio del proyecto y de sus reportes técnicos.

### 13.1 Arquitectura de la solución

![Figura 1 — Arquitectura general de RespiCare: capa frontend (web/móvil), API Gateway (Nginx), backend (Node.js/Express), servicios de IA (Python/FastAPI) con modelos XGBoost y Random Forest, y capa de datos (MongoDB/Redis).](Diagramas/Diagrama de Arquitectura General.png)

### 13.2 Diagrama de despliegue

![Figura 2 — Diagrama final de despliegue: contenedores Docker Compose, puertos y red interna (web-frontend, backend-api, ai-services, mongodb, redis, nginx y observabilidad con Prometheus/Grafana).](anexos_cuaderno/A-25_deployment.png)

### 13.3 Aplicación web — Inicio de sesión

![Figura 3 — Pantalla de inicio de sesión de la plataforma web RespiCare, con autenticación JWT y opciones de acceso institucional.](anexos_cuaderno/A-12_login_web.png)

### 13.4 Aplicación web — Panel del médico

![Figura 4 — Dashboard clínico del médico: pacientes activos, alertas en tiempo real, nivel de riesgo por paciente, cobertura del ensemble de IA (99.8%) y tendencia de SpO2 de los últimos 7 días.](anexos_cuaderno/A-13_dashboard_medico.png)

### 13.5 Aplicación móvil — Pantalla principal del paciente

![Figura 5 — Pantalla de inicio de la app móvil (Next.js + Capacitor) para el rol paciente, con accesos directos a Chatbot IA, registro de síntomas, citas y monitoreo de salud/wearables.](evidencias/screen_final.png)

### 13.6 Calidad del modelo de Machine Learning

![Figura 6 — Matriz de confusión del ensemble final de clasificación de severidad (2500 casos de prueba): precisión global 99.80%, recall macro 99.72%.](anexos_cuaderno/A-19_confusion_ensemble.png)

### 13.7 Evolución de la cobertura de pruebas

![Figura 7 — Evolución de la cobertura de sentencias del backend a lo largo de 7 rondas de pruebas repetitivas (abril-julio 2026), desde 42.11% hasta 80.44%, superando la meta del 80%.](anexos_cuaderno/Figura-1_evolucion_cobertura.png)
