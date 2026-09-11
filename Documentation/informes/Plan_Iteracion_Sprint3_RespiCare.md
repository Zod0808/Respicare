# Plan de Iteración — Sprint 3

**Proyecto**: RespiCare — Sistema Web y Móvil para la Detección de Enfermedades Respiratorias en Tacna
**Asignatura**: Construcción de Software I
**Plantilla**: Plan de Iteración — Plantilla Corporativa Avanzada

Versión Word con el formato oficial: [`Plan_Iteracion_Sprint3_RespiCare.docx`](Plan_Iteracion_Sprint3_RespiCare.docx)

---

## Control de Versiones

| Versión | Fecha | Autor | Descripción |
|:---|:---|:---|:---|
| 1.0 | 28/07/2026 | Chávez Linares, Cesar Fabian | Elaboración inicial del Plan de Iteración para Sprint 3 (EPIC-04: Módulo de Citas Médicas y Agenda avanzado; EPIC-05: Sistema de Alertas y Notificaciones Críticas). |

## 1. Información General

Este plan da continuidad al proceso iterativo ya documentado y verificado en el proyecto: el Sprint 1 (EPIC-01 Autenticación/Roles, EPIC-02 Historial Clínico) y el Sprint 2 (EPIC-03 Diagnóstico Inteligente de Síntomas) fueron ejecutados y aprobados por SQA, según consta en el [Informe de Resultados del Plan de Iteraciones](Informe_Resultados_Plan_Iteraciones.md) y en la [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md) (12 sprints documentados con ceremonias Scrum, velocidad de equipo y métricas de calidad).

| Campo | Detalle |
|:---|:---|
| Laboratorio | Construcción de Software I — RespiCare |
| Iteración | Sprint 3 |
| Fecha Inicio | 29/07/2026 |
| Fecha Fin | 11/08/2026 |
| Líder | Chávez Linares, Cesar Fabian (Scrum Master / Backend Developer) |
| Equipo | Backend Developer, Frontend Developer, Mobile Developer, QA/Tester |

## 2. Objetivo de la Iteración

Implementar y validar el módulo avanzado de gestión de citas médicas (disponibilidad de doctores, reprogramación y recordatorios automáticos) y el sistema de alertas y notificaciones críticas, garantizando la integración entre ambos módulos y aplicando los ajustes de proceso definidos en la retrospectiva del Sprint 2.

## 3. Alcance

**Incluye**: EPIC-04 (disponibilidad de doctores, reprogramación de citas y recordatorios automáticos en `AppointmentService`/`appointmentJobs`) y EPIC-05 (alertas críticas, notificación al doctor y procesamiento en segundo plano en `AlertService`/`alertJobs`), backend, frontend (panel de notificaciones y agenda) e integración entre ambos módulos.

**Excluye**: EPIC-06 (Integración HL7), EPIC-07 (Emergencias y Ambulancias) y EPIC-08 (Wearables), pospuestos a sprints posteriores según el roadmap del proyecto. Tampoco incluye el rediseño de la interfaz base de citas, ya entregada en EPIC-02 (Sprint 1).

## 4. Entregables Esperados

| Entregable | Descripción | Aceptado |
|:---|:---|:---:|
| AppointmentService con disponibilidad y reprogramación | `ensureAvailability()`, `getDoctorAvailability()` y `rescheduleAppointment()` operativos y probados | |
| Job de recordatorios de citas (`appointmentJobs.ts`) | Envío automático de recordatorios vía `scheduleReminder()` / `processUpcomingReminders()` | |
| AlertService con alertas críticas | `createCriticalSymptomAlert()`, `notifyDoctorForCriticalCase()` y `scheduleMedicationReminder()` end-to-end | |
| Job de procesamiento de alertas (`alertJobs.ts`) | `processPendingAlerts()` ejecutándose en segundo plano sin duplicados | |
| Panel de notificaciones y agenda (frontend) | Vista con alertas pendientes y disponibilidad de doctores en tiempo real | |
| Suite de pruebas de integración citas + alertas | Cobertura ≥80% en los nuevos flujos de disponibilidad, recordatorios y alertas críticas | |

## 5. Cronograma y Actividades

Actividades planificadas para las dos semanas del Sprint 3 (29/07/2026 – 11/08/2026):

| ID | Actividad | Responsable | Inicio | Fin | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-15 | Diseñar modelo de disponibilidad de doctores (slots y horarios) | Backend | 29/07/2026 | 30/07/2026 | Pendiente |
| T-16 | Implementar `ensureAvailability()` y `getDoctorAvailability()` | Backend | 30/07/2026 | 31/07/2026 | Pendiente |
| T-17 | Implementar `rescheduleAppointment()` con validación de conflictos | Backend | 31/07/2026 | 03/08/2026 | Pendiente |
| T-18 | Job `appointmentJobs.ts`: recordatorios automáticos de citas | Backend | 03/08/2026 | 04/08/2026 | Pendiente |
| T-19 | Extender AlertService: `notifyDoctorForCriticalCase()` y `acknowledgeAlert()` | Backend | 03/08/2026 | 05/08/2026 | Pendiente |
| T-20 | Job `alertJobs.ts`: procesamiento periódico de alertas pendientes | Backend | 05/08/2026 | 06/08/2026 | Pendiente |
| T-21 | Panel de notificaciones y vista de disponibilidad de agenda | Frontend | 04/08/2026 | 07/08/2026 | Pendiente |
| T-22 | Mantenimiento de dependencias (ajuste retrospectiva Sprint 2) | DevOps | 29/07/2026 | 29/07/2026 | Pendiente |
| T-23 | Pruebas de integración citas + alertas (ajuste retrospectiva: +3h testing) | Testing | 07/08/2026 | 11/08/2026 | Pendiente |

## 6. Recursos Requeridos

**Personal**: 1 Backend Developer, 1 Frontend Developer, 1 QA/Tester y Scrum Master — mismo equipo de los Sprints 1 y 2, con capacidad histórica de 70 h por sprint.

**Infraestructura y software**: MongoDB, entorno Docker de desarrollo, GitHub Actions (CI/CD), Node.js/TypeScript + Express (backend), React/Next.js (frontend), Jest + Supertest (pruebas) y node-schedule/cron para los jobs de recordatorios y alertas.

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|:---|:---|:---|
| Conflictos de concurrencia al reservar el mismo slot de disponibilidad | Alto — citas duplicadas o inconsistentes | Validación optimista/transaccional en `ensureAvailability()` antes de confirmar la cita |
| Falsos positivos/negativos en alertas críticas (`notifyDoctorForCriticalCase`) | Alto — riesgo clínico si no se notifica a tiempo | Pruebas de integración exhaustivas y revisión médica de los umbrales de criticidad |
| Recordatorios duplicados o no enviados por fallos del job (`appointmentJobs`/`alertJobs`) | Medio — mala experiencia y pérdida de confianza | Idempotencia en los jobs, registro de logs y mecanismo de reintento |
| Repetir el incidente de dependencias desactualizadas en CI/CD (ocurrido en Sprint 2) | Medio — bloqueo de build | Tarea dedicada de mantenimiento de dependencias (T-22), incorporada según la retrospectiva del Sprint 2 |

## 8. Criterios de Aceptación

- Los endpoints de disponibilidad y reprogramación de citas responden correctamente ante slots ocupados y disponibles.
- Las alertas críticas se generan y notifican al doctor correspondiente en menos de 3 segundos.
- Los jobs de recordatorio (citas y alertas) se ejecutan sin duplicados ni omisiones en las pruebas de integración.
- Cobertura de pruebas ≥80% en los módulos nuevos (ajuste de la retrospectiva del Sprint 2: +3 h dedicadas a testing).
- Build de CI/CD en verde, sin fallos por dependencias desactualizadas.

## 9. Evidencias

Evidencias verificables que respaldarán el cierre del Sprint 3:

| Evidencia | Ubicación | Responsable |
|:---|:---|:---|
| Código fuente actualizado (AppointmentService / AlertService) | `backend/src/services/appointmentService.ts`, `alertService.ts` | Backend Developer |
| Suite de pruebas de integración citas + alertas | `backend/tests/integration/` | QA/Tester |
| Reporte de cobertura de pruebas | Reporte HTML de Jest (`coverage/`) | QA/Tester |
| Informe de Resultados del Sprint 3 | `Documentation/informes/Informe_Resultados_Plan_Iteraciones.md` (actualización) | Scrum Master |

## 10. Indicadores de Éxito

| Indicador | Meta | Resultado | Estado |
|:---|:---:|:---:|:---:|
| Velocidad del equipo | ≥ 22 SP (promedio histórico Sprints 1-2) | — | Pendiente |
| Cobertura de pruebas | ≥ 80% | — | Pendiente |
| Desviación de esfuerzo | ≤ 10% (Sprint 2: +7%) | — | Pendiente |
| Tareas completadas | 9 / 9 (100%) | — | Pendiente |

## 11. Seguimiento y Control

Daily standups virtuales de 15 minutos (formato: qué hice, qué haré, impedimentos), Sprint Review el día 10 (11/08/2026) con demo de los entregables, y Retrospectiva final, siguiendo el mismo formato aplicado en los Sprints 1 y 2.

Los acuerdos, incidencias y decisiones se registrarán en el mismo formato usado en el [Informe de Resultados del Plan de Iteraciones](Informe_Resultados_Plan_Iteraciones.md), referenciando la [Metodología Ágil del Proyecto](../METODOLOGIA_AGIL_PROYECTO.md).

## 12. Lecciones Aprendidas y Cierre

Este plan incorpora directamente los ajustes definidos en la retrospectiva del Sprint 2 (sección 8 del Informe de Resultados del Plan de Iteraciones): tarea dedicada de mantenimiento de dependencias (T-22), mayor asignación de horas a testing (T-23) y arranque en paralelo de las integraciones de mayor riesgo desde el día 1 (T-15 y T-19 inician simultáneamente).

Al cierre del sprint se documentarán los resultados reales en una nueva sección del Informe de Resultados del Plan de Iteraciones, siguiendo el mismo formato de verificación y sustento por SQA aplicado en los Sprints 1 y 2.
