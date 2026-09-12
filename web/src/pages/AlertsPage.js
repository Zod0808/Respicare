/**
 * Nombre de Objeto: AlertsPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-009 - Sistema de alertas y notificaciones
 * Descripción: Página contenedora que renderiza la consola de alertas
 * (AlertConsole) dentro del layout clínico estándar.
 */
import React from 'react';
import AlertConsole from '../components/AlertConsole';
import './clinical.css';

const AlertsPage = () => (
  <div className="clinical-page">
    <div className="clinical-page-header">
      <h1>🔔 Consola de Alertas</h1>
    </div>
    <AlertConsole />
  </div>
);

export default AlertsPage;