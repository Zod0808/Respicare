/**
 * Nombre de Objeto: PatientQuickAccess
 * Fecha de Creación: 2026-10-27
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-002/RF-008 - Diagnóstico inteligente de síntomas + historial
 * clínico electrónico
 * Descripción: Panel de accesos rápidos para el paciente en Home: muestra su
 * próxima cita, receta activa y último resultado de laboratorio en tarjetas
 * legibles (en vez de forzarlo a descubrir el dropdown "Mi Salud" del navbar),
 * y expone el punto de entrada al formulario guiado de reporte de síntomas,
 * que hasta ahora no estaba enlazado desde ninguna pantalla real.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../utils/apiBase';
import { useAuth } from '../contexts/AuthContext';
import SymptomReportForm from './SymptomReportForm';
import './PatientQuickAccess.css';

const STATUS_LABELS = {
  normal: 'Normal',
  completed: 'Completado',
  abnormal: 'Anormal',
  critical: 'Crítico',
  ordered: 'Solicitado',
  collected: 'Recolectado',
  processing: 'En proceso',
  cancelled: 'Cancelado',
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '';

const medicationNames = (meds) => {
  if (!Array.isArray(meds) || meds.length === 0) return 'Medicamento';
  const names = meds.map((m) => (typeof m === 'string' ? m : m.name || m.medicationName)).filter(Boolean);
  return names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
};

function QuickCard({ icon, label, loading, empty, emptyText, to, ctaText, children }) {
  return (
    <article className="quick-card">
      <div className="quick-card__icon" aria-hidden="true">{icon}</div>
      <span className="quick-card__label">{label}</span>
      {loading ? (
        <div className="quick-card__skeleton" aria-hidden="true" />
      ) : empty ? (
        <>
          <p className="quick-card__empty">{emptyText}</p>
          <Link to={to} className="quick-card__cta">{ctaText} →</Link>
        </>
      ) : (
        <div className="quick-card__body">{children}</div>
      )}
    </article>
  );
}

function PatientQuickAccess() {
  const { token } = useAuth();
  const [appointment, setAppointment] = useState(undefined);
  const [prescription, setPrescription] = useState(undefined);
  const [labResult, setLabResult] = useState(undefined);
  const [showSymptomForm, setShowSymptomForm] = useState(false);

  const closeSymptomForm = useCallback(() => setShowSymptomForm(false), []);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API_BASE}/appointments/me/upcoming`, { headers })
      .then((res) => {
        const list = res.data?.data || [];
        const next = [...list].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];
        setAppointment(next || null);
      })
      .catch(() => setAppointment(null));

    axios
      .get(`${API_BASE}/prescriptions`, { headers })
      .then((res) => {
        const list = res.data?.data || [];
        const active = list.find((p) => p.status === 'active');
        setPrescription(active || null);
      })
      .catch(() => setPrescription(null));

    axios
      .get(`${API_BASE}/lab/results`, { headers })
      .then((res) => {
        const list = res.data?.data || [];
        const latest = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        setLabResult(latest || null);
      })
      .catch(() => setLabResult(null));
  }, [token]);

  return (
    <section className="quick-access" aria-label="Resumen de tu salud">
      <div className="quick-access__head">
        <span className="quick-access__eyebrow">Tu salud, de un vistazo</span>
        <button
          type="button"
          className="quick-access__report-btn"
          onClick={() => setShowSymptomForm(true)}
        >
          <span aria-hidden="true">🩺</span> Reportar síntomas
        </button>
      </div>

      <div className="quick-access__grid">
        <QuickCard
          icon="📅"
          label="Próxima cita"
          loading={appointment === undefined}
          empty={!appointment}
          emptyText="No tienes citas programadas"
          to="/appointments"
          ctaText="Agendar cita"
        >
          {appointment && (
            <>
              <strong>{formatDate(appointment.scheduledAt)}</strong>
              <span>{formatTime(appointment.scheduledAt)} · {appointment.reason || 'Consulta general'}</span>
            </>
          )}
        </QuickCard>

        <QuickCard
          icon="💊"
          label="Receta activa"
          loading={prescription === undefined}
          empty={!prescription}
          emptyText="No tienes recetas activas"
          to="/prescriptions"
          ctaText="Ver recetas"
        >
          {prescription && (
            <>
              <strong>{medicationNames(prescription.medications)}</strong>
              <span>Prescrita el {formatDate(prescription.createdAt)}</span>
            </>
          )}
        </QuickCard>

        <QuickCard
          icon="🔬"
          label="Último resultado"
          loading={labResult === undefined}
          empty={!labResult}
          emptyText="Aún no tienes resultados de laboratorio"
          to="/lab-results"
          ctaText="Ver resultados"
        >
          {labResult && (
            <>
              <strong>{labResult.testName || 'Examen de laboratorio'}</strong>
              <span className={`quick-access__status quick-access__status--${labResult.status}`}>
                {STATUS_LABELS[labResult.status] || labResult.status}
              </span>
            </>
          )}
        </QuickCard>
      </div>

      {showSymptomForm && (
        <SymptomReportForm onClose={closeSymptomForm} onSuccess={closeSymptomForm} />
      )}
    </section>
  );
}

export default PatientQuickAccess;
