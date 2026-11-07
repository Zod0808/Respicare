/**
 * Nombre de Objeto: index (entry point web)
 * Fecha de Creación: 2026-11-06
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: N/A - Bootstrap de la aplicación React; no implementa un
 * RF propio, no aparece como objeto en la Matriz de Trazabilidad.
 * Descripción: Punto de entrada de la SPA. Activa el enforcement de CSP,
 * monta <App /> en el DOM dentro de React.StrictMode y registra el service
 * worker (PWA) con su flujo de actualización.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { initCSPEnforcement } from './utils/cspEnforcer';

// Inicializar enforcement de CSP
initCSPEnforcement();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onUpdate: registration => {
    if (window.confirm('Hay una nueva versión disponible. ¿Deseas actualizar ahora?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
});
