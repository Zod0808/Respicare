/**
 * Nombre de Objeto: serviceWorkerRegistration
 * Fecha de Creación: 2026-11-06
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: N/A - Infraestructura PWA (registro de service worker); no
 * implementa un RF propio, no aparece como objeto en la Matriz de Trazabilidad.
 * Descripción: Registra/desregistra el service worker generado por Create
 * React App, distinguiendo localhost (valida el worker antes de registrarlo)
 * de producción, y dispara los callbacks onSuccess/onUpdate consumidos por index.js.
 */
// Basado en la guía oficial de CRA: https://create-react-app.dev/docs/making-a-progressive-web-app/

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/
    )
);

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error durante el registro del service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' }
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.warn('No se pudo encontrar el service worker. Modo offline deshabilitado.');
    });
}

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.info('Esta aplicación está cacheada para uso offline.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

