/**
 * Nombre de Objeto: ReferralsPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Funcionalidad adicional (no documentada en RF-001 a RF-014) - gestión
 * de referencias/derivaciones médicas (referrals)
 * Descripción: Página web de referencias/derivaciones médicas.
 */

import React from 'react';
import ReferralManagement from '../components/ReferralManagement';
import './clinical.css';

const ReferralsPage = () => (
  <div className="clinical-page">
    <div className="clinical-page-header">
      <h1>🔗 Gestión de Referidos</h1>
    </div>
    <ReferralManagement />
  </div>
);

export default ReferralsPage;