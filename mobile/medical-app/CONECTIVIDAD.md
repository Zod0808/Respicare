# Conectividad de la App Móvil (Red local, ngrok, Cloudflare Tunnel)

Guía única para conectar `mobile/medical-app` con el backend/AI services, ya sea en la misma red WiFi o desde internet.

## 1. Misma red WiFi (IP local)

La app no puede usar `localhost` en un dispositivo físico: debe apuntar a la IP de la máquina donde corre Docker.

```bash
cd mobile/medical-app
npm run config:ip          # detecta tu IP local y genera .env.local
```

O manualmente, edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://TU_IP_LOCAL:3001/api/v1
NEXT_PUBLIC_AI_SERVICE_URL=http://TU_IP_LOCAL:8000
```

Configura el firewall de Windows (como Administrador):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/configure-firewall.ps1
# o manualmente:
New-NetFirewallRule -DisplayName "RespiCare Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "RespiCare AI Services" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

Verifica:

```bash
npm run test:connection
# o desde el navegador del teléfono: http://TU_IP_LOCAL:3001/api/v1/health
```

La IP cambia si cambias de red Wi-Fi — vuelve a correr `npm run config:ip`.

## 2. Acceso externo (sin cables, sin misma WiFi)

Para usar la app en un teléfono real desde cualquier lugar, expón el backend a internet. Dos opciones soportadas por el proyecto:

| Opción | Comando | Estabilidad de URL | Recomendado para |
|---|---|---|---|
| ngrok | `npm run tunnel:ngrok` | Cambia al reiniciar (plan free) | Pruebas rápidas |
| Cloudflare Tunnel | `npm run tunnel:cloudflare` | Estable | Uso continuo / demo |

### ngrok

```bash
cd mobile/medical-app
npm run tunnel:ngrok          # túneles Backend (3001) + AI Services (8000) en un panel
npm run tunnel:ngrok:simple   # alternativa: ventanas separadas
npm run tunnel:ngrok:legacy   # solo backend
npm run tunnel:ngrok:stop     # detener todos los procesos de ngrok
```

El comando recomendado (`tunnel:ngrok`) verifica que ngrok esté instalado, copia `ngrok-config.yml` a `~/.ngrok2/ngrok.yml`, inicia ambos túneles con `ngrok start --all`, lee las URLs desde `http://localhost:4040/api/tunnels` y actualiza `.env.local` automáticamente.

**Requisitos**: ngrok instalado (`choco install ngrok` o descarga manual desde ngrok.com/download) y, de preferencia, un authtoken configurado (`ngrok config add-authtoken TU_TOKEN`).

**Manual, sin el script** (si el automático falla):

```powershell
ngrok start --all          # usa ngrok-config.yml → ambos túneles en el panel 4040
# o en ventanas separadas (cada una con su propio panel: 4040 y 4041)
ngrok http 3001
ngrok http 8000
```

Luego actualiza `.env.local` con las URLs HTTPS mostradas en `http://localhost:4040`, o ejecuta `npm run tunnel:ngrok:get-urls` para que lo haga automáticamente si ngrok ya está corriendo.

**Limitaciones del plan gratuito**: la URL cambia cada reinicio, 40 conexiones/minuto, sin dominio propio. Tras cada reinicio de ngrok hay que repetir: iniciar túnel → actualizar `.env.local` → recompilar (`npm run build && npm run capacitor:sync`) → regenerar APK si aplica.

### Cloudflare Tunnel (recomendado para uso continuo)

```powershell
choco install cloudflared
cloudflared tunnel login
cloudflared tunnel create respicare-backend
```

Configura `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: TU_TUNNEL_ID
credentials-file: %USERPROFILE%\.cloudflared\TU_TUNNEL_ID.json
ingress:
  - hostname: respicare-api.tu-dominio.com
    service: http://localhost:3001
  - hostname: respicare-ai.tu-dominio.com
    service: http://localhost:8000
  - service: http_status:404
```

Sin dominio propio, Cloudflare asigna uno gratis en `*.trycloudflare.com`. Inicia con `npm run tunnel:cloudflare` o `cloudflared tunnel run respicare-backend`, y usa esas URLs en `.env.local`.

## 3. Después de cambiar `.env.local` (cualquier método)

```bash
npm run build
npm run capacitor:sync
npm run apk          # si necesitas regenerar la APK
```

## Troubleshooting

### "Failed to fetch" / "Network request failed"

1. Verifica que backend y AI services respondan:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:8000/api/v1/health
   ```
2. Verifica que el túnel/IP esté activo y que `.env.local` tenga la URL correcta: `cat .env.local`.
3. Recompila **siempre** después de tocar `.env.local` (`npm run build && npm run capacitor:sync`) y, si ya instalaste la app, regenera la APK.
4. Si usas ngrok: confirma en `http://localhost:4040` que los túneles sigan activos — la URL cambia en cada reinicio del plan free.

### "Unable to acquire lock" (`.next/dev/lock`)

```powershell
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
npm run dev
```

### Solo aparece un túnel de ngrok en el panel

Causa: cada instancia de ngrok en ventana separada usa su propio puerto de API (4040, 4041, ...). Usa `ngrok start --all` con `ngrok-config.yml` para que ambos túneles vivan en un solo panel (4040).

### CORS

Asegúrate de que el backend permita el origen de la app móvil (`backend/src/index-dev.js` en desarrollo permite todos los orígenes).

## Seguridad (desarrollo)

- No uses datos reales sensibles mientras el backend esté expuesto por un túnel público.
- Las URLs de ngrok/Cloudflare son públicas: cualquiera con el enlace puede acceder mientras el túnel esté activo.
- Para producción, usa un servidor real con SSL/TLS, no un túnel temporal (ver sección "Despliegue en Producción" del README raíz del proyecto).
