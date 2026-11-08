/**
 * Nombre de Objeto: ConsentsPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Funcionalidad adicional (no documentada en RF-001 a RF-014) -
 * consentimiento informado y derechos sobre datos (DSR)
 * Descripción: Página web de consents.
 */

import React from 'react';
import ConsentManagement from '../components/ConsentManagement';
import './clinical.css';

const ConsentsPage = () => (
  <div className="clinical-page">
    <div className="clinical-page-header">
      <h1>📝 Consentimientos Informados</h1>
    </div>
    <ConsentManagement />
  </div>
);

export default ConsentsPage;