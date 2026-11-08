/**
 * Nombre de Objeto: AppointmentsPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Funcionalidad adicional (no documentada en RF-001 a RF-014) - gestión
 * de citas médicas (appointments)
 * Descripción: Página web de citas médicas.
 */

import React from 'react';
import AppointmentCalendar from '../components/AppointmentCalendar';
import { useAuth } from '../contexts/AuthContext';
import './clinical.css';

const AppointmentsPage = () => {
  const { token } = useAuth();
  return (
    <div className="clinical-page">
      <div className="clinical-page-header">
        <h1>📅 Citas Médicas</h1>
      </div>
      <AppointmentCalendar token={token} />
    </div>
  );
};

export default AppointmentsPage;