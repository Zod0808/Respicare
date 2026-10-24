# ✅ Checklist: Despliegue, Testabilidad y QA (fin de ciclo)

**Fuente**: `Semana 03_U2_Plan de Despliegue.pdf` (Ingeniería de Software)
**Propósito**: inventario de lo que el documento exige, cruzado con lo que ya existe en el repo, para saber qué falta cerrar antes de fin de ciclo.
**Cómo leer esta checklist**: `[x]` = ya existe evidencia en el repo (se cita el archivo). `[ ]` = falta crear/formalizar o verificar.

---

## 1. Plan de despliegue

- [x] **Objetivo y alcance documentados** — `Documentation/CRONOGRAMA_PROYECTO.md` cubre fases, pero no hay un documento específico "Plan de Despliegue" con objetivo/alcance en esos términos.
  - [ ] Redactar `Documentation/PLAN_DE_DESPLIEGUE.md` que declare explícitamente: objetivo (llevar cada versión a producción de forma controlada y repetible) y alcance (componentes, BD, configuración, dependencias).
- [x] **Automatización CI/CD** — ya existe: `.github/workflows/deploy-staging.yml`, `ci-cd-complete.yml`, `docker-build.yml`, `docker-build-tags.yml` (`deploy-production.yml` se archivó en `docs/archive/workflows/`, ver abajo).
- [ ] **Cronograma, ventanas de mantenimiento y responsables** del propio despliegue (no del proyecto completo) — falta un apartado corto tipo "quién aprueba y cuánd se despliega a producción".
- [ ] **Criterios de aceptación y de reversión acordados antes de liberar** — no están formalizados como checklist propio (ver punto de reversión más abajo).
- [x] **Áreas de sistemas involucradas identificadas**:
  - Desarrollo → repos `backend/`, `web/`, `mobile/`, `ai-services/`.
  - QA → `Documentation/CATALOGO_PRUEBAS.md` (5,326 casos, 4 módulos).
  - Infraestructura → `docker-compose.vm.yml`, `docker-compose.prod.yml`, `docker-compose.tunnel.yml`.
  - Seguridad/soporte → `.github/workflows/dast-scan.yml`, `sast-scan.yml`, `security-scan.yml`, `security-zap.yml`.
- [x] **Confirmar cuál es el flujo de despliegue real a usar** — resuelto: la fuente de verdad es `docker-compose.vm.yml` + `scripts/deploy-vm.sh` + túnel Cloudflare a nivel de host + Vercel para el web (documentado en `PLAN_DE_DESPLIEGUE.md`). `deploy-production.yml` (Kubernetes) nunca se ejecutó y se archivó en `docs/archive/workflows/` para eliminar la contradicción.

### Ambientes de sistemas

| Ambiente | Propósito | Datos | Estado en el repo |
|---|---|---|---|
| Desarrollo | Codificación y pruebas unitarias | Ficticios | `docker-compose.dev.yml` ✅ |
| Pruebas / QA | Pruebas funcionales e integración | Prueba controlados | `.github/workflows/testing.yml`, `backend-tests.yml`, `web-tests.yml`, `ai-services-tests.yml` ✅ |
| Preproducción | Ensayo igual a producción | Copia anonimizada | `deploy-staging.yml` (namespace `respicare-staging`) ✅ — **verificar si usa datos anonimizados o ficticios** ⚠️ |
| Producción | Operación para usuarios finales | Reales | `docker-compose.vm.yml` / `docker-compose.prod.yml` / `docker-compose.server.yml` ✅ — **demasiados compose de "producción"; consolidar o documentar cuál usa cada uno** ⚠️ |

### Estrategia de despliegue

- [x] CI/CD con builds reproducibles (imágenes versionadas en `ghcr.io`, tags `vX.Y.Z`).
- [ ] Documentar explícitamente qué estrategia se usa: Rolling / Blue-green / Canary. Actualmente no está declarado en ningún workflow ni doc — probablemente es un despliegue directo (recreate), lo cual hay que nombrar honestamente en el informe en vez de inventar que es blue-green/canary.

### Plan de reversión y checklist de verificación

- [ ] Respaldo previo de base de datos y configuración antes de desplegar — **no hay script de backup pre-deploy visible**. Crear uno o documentar el proceso manual.
- [ ] Criterios claros para decidir la reversión (ej. error rate > X%, smoke tests fallando).
- [ ] Pruebas de humo (smoke tests) posteriores al despliegue — **no se encontró script/job `smoke-test` dedicado**. Falta crearlo o referenciarlo.
- [ ] Monitoreo reforzado post-despliegue y comunicación a involucrados (quién avisa, por qué canal).

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
| Despliegue | Pruebas de humo y aprobación de liberación | ⚠️ Falta el paso de smoke tests + aprobación formal antes de producción (ver sección 1) |

### Métricas y criterios de salida

- [x] **Cobertura**: ya trackeada y cumplida en los 4 módulos (≥80% en backend/web/mobile/ai-services, ver `CATALOGO_PRUEBAS.md`).
- [x] **Defectos**: hay cantidad/severidad registrada (ej. backend 26 fail, web 271 fail, ai-services 344 fail/77 err) — **pendiente real**: reducir o justificar por qué quedan tantos fails en web y ai-services antes del cierre.
- [ ] **Criterio de salida formal**: "sin defectos críticos abiertos y pruebas aprobadas" — no está declarado como gate explícito en ningún workflow (ej. que `scripts/smoke-test-vm.sh` o el pipeline de CI fallen si hay fails críticos pendientes). Verificar/agregar ese gate.

---

## Resumen: lo que falta antes de fin de ciclo

1. ~~Decidir y documentar la estrategia real de despliegue a producción~~ — **resuelto**: Compose+Tunnel+Vercel es la fuente de verdad (`PLAN_DE_DESPLIEGUE.md`); `deploy-production.yml` (K8s) se archivó.
2. Crear `Documentation/PLAN_DE_DESPLIEGUE.md` formal con: objetivo/alcance, responsables, criterios de aceptación/reversión, estrategia de despliegue nombrada explícitamente.
3. Agregar smoke tests post-despliegue y proceso de backup pre-deploy (no existen hoy).
4. Formalizar un gate de salida de QA (sin críticos abiertos) antes de producción.
5. Reducir o justificar los fails pendientes en web (271) y ai-services (344) antes de presentar el catálogo como cerrado.
6. Verificar que el ambiente de preproducción use copia anonimizada (no datos reales ni ficticios) como exige la tabla de ambientes.

*(Documento informativo para planificación — no implica que ya se hayan hecho los cambios anteriores.)*
