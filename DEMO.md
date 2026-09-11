# RespiCare — Guía de Demo

Guía para levantar el sistema completo con **un solo comando** en una laptop de demo.

## Requisitos

- **Docker Desktop** corriendo (Windows / macOS / Linux)
- 8 GB RAM libres, 10 GB disco
- Puertos libres: `3000` (web), `3001` (backend), `8000` (AI), `27018` (MongoDB), `6379` (Redis), `8081` (Mongo Express), `8082` (Redis Commander), `8025` (MailHog)

## Inicio rápido

### Windows (PowerShell)

```powershell
.\scripts\setup-demo.ps1
```

### Linux / macOS / WSL

```bash
bash scripts/setup-demo.sh
```

El script:

1. Verifica que Docker Desktop responda.
2. Genera un `.env` con secretos criptográficamente fuertes (o lo repara si ya existe).
3. Corre `docker compose -f docker-compose.dev.yml up -d --build` (3–5 min la primera vez).
4. Espera hasta 3 min a que backend + AI + web respondan.
5. Ejecuta `npm run seed:demo` dentro del contenedor del backend — crea admin, 4 doctores, 20 pacientes y ~100 casos clínicos.
6. Imprime URLs y credenciales.

## URLs

| Servicio | URL | Notas |
|---|---|---|
| Frontend Web | http://localhost:3000 | Login con credenciales de abajo |
| Backend API | http://localhost:3001/api/v1 | REST |
| Backend health | http://localhost:3001/health | Diagnóstico |
| AI Services | http://localhost:8000/api/v1/health | Predicciones ML |
| Mongo Express | http://localhost:8081 | admin / demo1234 |
| Redis Commander | http://localhost:8082 | Sin auth |
| MailHog | http://localhost:8025 | Bandeja de correos capturados |

## Credenciales de demo

**Todas usan la contraseña**: `demo1234`

| Rol | Email |
|---|---|
| Administrador | `admin.demo@respicare.com` |
| Doctor | `doctor.demo1@respicare.com` (hay `demo1..demo4`) |
| Paciente | `paciente.demo1@respicare.com` (hay `demo1..demo20`) |

## Datos que carga el seed

- 4 doctores + 20 pacientes + 1 admin
- ~100 reportes de síntomas distribuidos en 9 distritos de Tacna
- Historiales médicos, análisis IA con SHAP, citas y alertas asociadas
- Conversaciones de chatbot demo

## Flujos recomendados para la demo

1. **Login como paciente** → reportar síntomas → ver predicción con SHAP → agendar cita
2. **Login como doctor** → dashboard de casos → revisar alertas críticas → validar análisis IA
3. **Login como admin** → panel analítico → tendencias por distrito → contenido educativo

## Mobile (opcional, uso limitado)

La demo web ya cubre los flujos clínicos. Para mostrar la app mobile hay dos modalidades. Elegí **una**:

### Opción A — PWA en navegador (más rápido, sin emulador)

Levanta el frontend mobile como Next.js dev server. No incluye wearables reales (BLE / Health Connect no funcionan en navegador), pero muestra UI, login, síntomas, IA y citas.

Requiere que `setup-demo` ya esté corriendo (backend en `localhost:3001`, AI en `localhost:8000`).

```powershell
# Windows — en una segunda terminal
.\scripts\start-mobile-pwa.ps1
```

```bash
# Linux / macOS / WSL — en una segunda terminal
bash scripts/start-mobile-pwa.sh
```

Abre <http://localhost:8083>. Login con las mismas credenciales que la web.

### Opción B — APK en emulador o dispositivo físico (LAN)

APK ya compilados en `mobile/apk/`:

| Archivo | Backend esperado |
|---|---|
| `RespiCare-LAN-universal.apk` | `http://192.168.18.29` (nginx en la máquina host) |
| `RespiCare-datosmoviles-universal.apk` | Backend público vía túnel (Cloudflare / ngrok) |

Pasos:

1. Copiar el APK al emulador/dispositivo e instalarlo (permitir "orígenes desconocidos").
2. Si tu máquina de demo **no** tiene IP `192.168.18.29`, hay que rebuildear el APK con la IP correcta:

    ```bash
    cd mobile/medical-app
    # Editar .env.lan con la IP LAN de la máquina host (misma red que el dispositivo)
    npm run android:lan
    cd android && ./gradlew assembleRelease   # Windows: gradlew.bat assembleRelease
    # APK generado en android/app/build/outputs/apk/release/
    ```

3. En la máquina host, exponer backend y AI vía nginx del stack dev:

    ```bash
    docker compose -f docker-compose.dev.yml up -d nginx  # si aplica
    ```

4. Login con las credenciales de demo. Sin wearable físico, los datos de signos vitales se muestran mockeados.

> **Limitaciones conocidas del mobile en demo**: BLE con wearable real requiere dispositivo físico (no emulador); notificaciones push requieren FCM configurado; SQLite offline funciona pero no sincroniza si no hay red al backend.

## Opciones útiles

```powershell
# Windows: reconstruir todo desde cero (borra volúmenes y BD)
.\scripts\setup-demo.ps1 -Reset

# Windows: solo levantar servicios, sin poblar BD
.\scripts\setup-demo.ps1 -SkipSeed
```

```bash
# Bash equivalentes
bash scripts/setup-demo.sh --reset
bash scripts/setup-demo.sh --skip-seed
```

## Comandos de operación

```bash
# Ver logs en vivo
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f ai-services

# Reiniciar un servicio puntual
docker compose -f docker-compose.dev.yml restart backend

# Detener todo (mantiene BD)
docker compose -f docker-compose.dev.yml down

# Detener todo y borrar BD
docker compose -f docker-compose.dev.yml down -v

# Reejecutar seed manualmente
docker compose -f docker-compose.dev.yml exec backend npm run seed:demo
```

## Troubleshooting

**"Docker Desktop no responde"** — abre Docker Desktop y espera al icono verde, luego reintenta.

**"Puerto ya en uso"** — algún proceso ocupa 3000/3001/8000. Detenlo o cambia el puerto en `docker-compose.dev.yml`.

**"seed falla con MongoServerError"** — el backend probablemente aún compila. Espera ~30 s y corre:
```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed:demo
```

**"Web no carga http://localhost:3000"** — el primer `npm install` dentro del contenedor `respicare-web-dev` tarda 2–3 min. Revisa con:
```bash
docker compose -f docker-compose.dev.yml logs -f web
```

**"Necesito resetear la BD entre demos"** — usa `-Reset` (PowerShell) o `--reset` (bash).

## Limitaciones conocidas para producción

Esta configuración de demo **no incluye**:

- SSL/TLS real (usar `docker-compose.prod.yml` + Certbot para producción)
- Integración HL7/FHIR con hospitales externos
- Wearables reales (Android BLE / Health Connect requieren APK en dispositivo físico)
- Integración con servicios de emergencia (911)
- Datos rebalanceados por edad para XGBoost (>70 años tiene 7.3 pp menos precisión)

Ver `Documentation/informes/Informe_Plan_Despliegue_Semana9.md` para el plan de producción.
