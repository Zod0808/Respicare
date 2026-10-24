# ✅ Checklist: Despliegue, Testabilidad y QA (fin de ciclo)

**Fuente**: `Semana 03_U2_Plan de Despliegue.pdf` (Ingeniería de Software)
**Propósito**: inventario de lo que el documento exige, cruzado con lo que ya existe en el repo, para saber qué falta cerrar antes de fin de ciclo.
**Cómo leer esta checklist**: `[x]` = ya existe evidencia en el repo (se cita el archivo). `[ ]` = falta crear/formalizar o verificar.

---

## 1. Plan de despliegue

- [x] **Objetivo y alcance documentados** — `Documentation/PLAN_DE_DESPLIEGUE.md` ya declara objetivo y alcance explícitos (componentes, BD, configuración, dependencias), basados en la arquitectura real verificada.
- [x] **Automatización CI/CD** — ya existe: `ci-cd-complete.yml`, `docker-build.yml`, `docker-build-tags.yml` (`deploy-production.yml` y `deploy-staging.yml` se archivaron en `docs/archive/workflows/`: ambos apuntaban a Kubernetes, nunca se ejecutaron ni tuvieron el secret correspondiente).
- [x] **Cronograma, ventanas de mantenimiento y responsables** del propio despliegue — sección 8 y 5 de `PLAN_DE_DESPLIEGUE.md`.
- [x] **Criterios de aceptación y de reversión acordados antes de liberar** — sección 9 (criterios de aceptación, incluyendo SLA de rendimiento) y sección 11 (rollback) de `PLAN_DE_DESPLIEGUE.md`.
- [x] **Áreas de sistemas involucradas identificadas**:
  - Desarrollo → repos `backend/`, `web/`, `mobile/`, `ai-services/`.
  - QA → `Documentation/CATALOGO_PRUEBAS.md` (5,326 casos, 4 módulos).
  - Infraestructura → `docker-compose.vm.yml` (producción real) + Vercel (web) + túnel Cloudflare de host.
  - Seguridad/soporte → `.github/workflows/dast-scan.yml`, `sast-scan.yml`, `security-scan.yml`, `security-zap.yml`.
- [x] **Confirmar cuál es el flujo de despliegue real a usar** — resuelto: la fuente de verdad es `docker-compose.vm.yml` + `scripts/deploy-vm.sh` + túnel Cloudflare a nivel de host + Vercel para el web (documentado en `PLAN_DE_DESPLIEGUE.md`). `deploy-production.yml` y `deploy-staging.yml` (ambos Kubernetes) nunca se ejecutaron y se archivaron en `docs/archive/workflows/` para eliminar la contradicción.

### Ambientes de sistemas

| Ambiente | Propósito | Datos | Estado real |
|---|---|---|---|
| Desarrollo | Codificación y pruebas unitarias | Ficticios | `docker-compose.dev.yml` ✅ |
| Pruebas / QA | Pruebas funcionales e integración | Datos de prueba (fixtures/mocks) | CI: `testing.yml`, `backend-tests.yml`, `web-tests.yml`, `ai-services-tests.yml` ✅ |
| Preproducción | Ensayo igual a producción | — | ❌ **No existe un ambiente de preproducción real**. `deploy-staging.yml` asumía un clúster Kubernetes de staging (namespace `respicare-staging`, secret `KUBECONFIG_STAGING`) que nunca se configuró ni se ejecutó — se archivó en `docs/archive/workflows/`. La pregunta de si usa datos anonimizados queda sin objeto porque el ambiente mismo no existe. |
| Producción | Operación para usuarios finales | Reales | VM (`docker-compose.vm.yml` + `scripts/deploy-vm.sh`) + Vercel (web) + túnel Cloudflare de host ✅ — ver `PLAN_DE_DESPLIEGUE.md` |

### Estrategia de despliegue

- [x] Nombrada explícitamente en `PLAN_DE_DESPLIEGUE.md` sección 4: despliegue directo (recreate) en la VM vía `docker compose up -d` tras build local, no blue-green/canary — no hay registro intermedio tipo `ghcr.io` en el flujo real.

### Plan de reversión y checklist de verificación

- [x] Respaldo previo de base de datos y configuración antes de desplegar — `scripts/backup-vm.sh` (mongodump + RDB de Redis + copia de `.env`/`.env.vm`).
- [x] Criterios claros para decidir la reversión — sección 11 de `PLAN_DE_DESPLIEGUE.md` (healthchecks fallando, smoke tests fallando, error rate anormal).
- [x] Pruebas de humo (smoke tests) posteriores al despliegue — `scripts/smoke-test-vm.sh`.
- [ ] Monitoreo reforzado post-despliegue y comunicación a involucrados (quién avisa, por qué canal) — sigue sin un canal formal declarado (el proyecto es de un solo responsable; definir al menos un registro mínimo de incidentes).

---

## 2. Testabilidad

Criterios del documento, aplicados al proyecto real:

| Criterio | Evidencia en el repo | Falta |
|---|---|---|
| Operabilidad | Suites corriendo en CI (`testing.yml`, etc.) | — |
| Observabilidad | Logs y mensajes de error — verificar consistencia | [ ] Revisar que todos los servicios (backend, ai-services) tengan logging estructurado uniforme |
| Controlabilidad | Datos de prueba + pruebas automatizadas (`Documentation/CATALOGO_PRUEBAS.md`) | — |
| Descomponibilidad | Arquitectura modular (backend/web/mobile/ai-services separados) | [ ] Confirmar que no hay acoplamiento fuerte entre `ai-services` y `backend` que dificulte probar por separado |
| Simplicidad | — | [ ] No evaluado formalmente — no es bloqueante |
| Estabilidad | — | [ ] No evaluado formalmente — no es bloqueante |
| Comprensibilidad | Documentación extensa en `Documentation/` | — |

- [ ] Consolidar lo anterior en una tabla "Criterio → Práctica en el proyecto" dentro del propio `PLAN_DE_DESPLIEGUE.md` o un `TESTABILIDAD.md`, como pide el documento fuente.

---

## 3. QA (participación por fase)

| Fase | Actividad de QA esperada | Evidencia / estado |
|---|---|---|
| Requisitos | Revisar criterios de aceptación | Revisar si los Sprints (`Documentation/informes/Plan_Iteracion_Sprint*.md`) documentan criterios de aceptación por historia — [ ] verificar cobertura |
| Diseño | Evaluar testabilidad y riesgos | [ ] No hay documento de riesgos explícito ligado a testabilidad |
| Construcción | Plan de pruebas y automatización | ✅ `CATALOGO_PRUEBAS.md` cubre esto ampliamente |
| Pruebas | Ejecutar pruebas y reportar defectos | ✅ CI ejecuta tests; `PENDIENTES_CORRECCION_TESTS.md` ya actúa como reporte de defectos |
| Despliegue | Pruebas de humo y aprobación de liberación | ✅ `scripts/smoke-test-vm.sh` + aprobación de Cesar Fabian Chavez Linares (sección 14 de `PLAN_DE_DESPLIEGUE.md`) |

### Métricas y criterios de salida

- [x] **Cobertura**: ya trackeada y cumplida en los 4 módulos (≥80% en backend/web/mobile/ai-services, ver `CATALOGO_PRUEBAS.md`).
- [ ] **Defectos**: hay cantidad/severidad registrada (`CATALOGO_PRUEBAS.md`: backend 26 fail, web 271 fail, ai-services 344 fail/77 err) — **sigue pendiente**: no se redujeron en esta sesión. Es un esfuerzo de remediación propio (cientos de tests), separado del plan de despliegue; se sigue trackeando en `PENDIENTES_CORRECCION_TESTS.md`. No bloquea el plan de despliegue en sí, pero sí debería bloquear el gate de salida de QA del punto siguiente.
- [ ] **Criterio de salida formal**: "sin defectos críticos abiertos y pruebas aprobadas" — sigue sin declararse como gate explícito en CI (ningún workflow falla hoy por los fails de arriba). Pendiente: decidir un umbral (ej. 0 fails críticos / severidad alta) y hacer que `backend-tests.yml`/`web-tests.yml`/`ai-services-tests.yml` lo exijan.

---

## Resumen: lo que falta antes de fin de ciclo

1. ~~Decidir y documentar la estrategia real de despliegue a producción~~ — **resuelto**: Compose+Tunnel+Vercel es la fuente de verdad (`PLAN_DE_DESPLIEGUE.md`); `deploy-production.yml` y `deploy-staging.yml` (ambos K8s) se archivaron.
2. ~~Crear `Documentation/PLAN_DE_DESPLIEGUE.md` formal~~ — **resuelto**, incluye objetivo/alcance, responsables, criterios de aceptación/reversión (con SLA de rendimiento) y estrategia de despliegue nombrada explícitamente (recreate, no blue-green).
3. ~~Agregar smoke tests post-despliegue y proceso de backup pre-deploy~~ — **resuelto**: `scripts/smoke-test-vm.sh` y `scripts/backup-vm.sh`.
4. **Formalizar un gate de salida de QA** (sin críticos abiertos) antes de producción — sigue pendiente, ningún workflow de CI falla hoy por los fails existentes.
5. **Reducir o justificar los fails pendientes** en backend (26), web (271) y ai-services (344 fail/77 err) — sigue pendiente. Es un esfuerzo de remediación de código separado de este plan de despliegue; tiene su propio tracking en `PENDIENTES_CORRECCION_TESTS.md` (que ya está desactualizado respecto a `CATALOGO_PRUEBAS.md` y debería re-sincronizarse).
6. ~~Verificar que el ambiente de preproducción use copia anonimizada~~ — **resuelto, con hallazgo**: no hay ambiente de preproducción real desplegado (`deploy-staging.yml` nunca se ejecutó; se archivó). La pregunta queda sin objeto hasta que se decida construir ese ambiente de verdad.

*(Documento informativo para planificación — no implica que ya se hayan hecho los cambios anteriores salvo donde se indica "resuelto".)*
