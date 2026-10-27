/**
 * Nombre de Objeto: MedicalHistoryPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-008 - Historial clínico electrónico
 * Descripción: Página de listado paginado del historial médico electrónico
 * de pacientes, consumiendo GET /medical-histories del backend.
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { API_BASE } from '../utils/apiBase';
import { useAuth } from '../contexts/AuthContext';
import './clinical.css';

const LIMIT = 10;

const MedicalHistoryPage = () => {
  const { token, user } = useAuth();
  const isPatient = user?.role === 'patient';
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') || undefined;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Obtiene la página actual del historial médico desde GET /medical-histories.
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/medical-histories`, {
        params: { page, limit: LIMIT, ...(patientId ? { patientId } : {}) },
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = res.data?.data;
      const list = Array.isArray(payload) ? payload : payload?.records || payload?.histories || [];
      setRecords(list);
      setTotal(res.data?.total || res.data?.pagination?.total || list.length);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar historias médicas.');
    } finally {
      setLoading(false);
    }
  }, [page, token, patientId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="clinical-page">
      <div className="clinical-page-header">
        <h1>📋 {isPatient ? 'Mi Historial Médico' : 'Historias Médicas'}</h1>
        {total > 0 && <span className="clinical-count">{total} registros</span>}
      </div>
      {error && <div className="clinical-error">{error}</div>}
      {loading ? (
        <div className="clinical-loading">
          <div className="loading-spinner" />
          <p>Cargando historias médicas…</p>
        </div>
      ) : isPatient ? (
        <div className="clinical-cards">
          {records.length === 0 ? (
            <p className="clinical-empty-cards">
              Aún no tienes historias médicas registradas. Aparecerán aquí después de tu primera consulta.
            </p>
          ) : records.map((r) => (
            <article className="clinical-card" key={r._id}>
              <div className="clinical-card__header">
                <h3>{r.primaryDiagnosis || r.diagnosis || 'Consulta médica'}</h3>
                <span className={`status-badge status-${r.status || 'active'}`}>
                  {r.status || 'Activo'}
                </span>
              </div>
              <div className="clinical-card__meta">
                <span className="badge">{r.visitType || r.type || 'Consulta'}</span>
                <span className="clinical-card__date">
                  {r.visitDate ? new Date(r.visitDate).toLocaleDateString('es-PE') : '—'}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="clinical-table-wrapper">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Diagnóstico Principal</th>
                <th>Tipo de Visita</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="clinical-empty">
                    No se encontraron historias médicas
                  </td>
                </tr>
              ) : records.map((r) => (
                <tr key={r._id}>
                  <td>{r.patientName || r.patientId || '—'}</td>
                  <td>{r.primaryDiagnosis || r.diagnosis || '—'}</td>
                  <td>
                    <span className="badge">{r.visitType || r.type || 'Consulta'}</span>
                  </td>
                  <td>
                    {r.visitDate ? new Date(r.visitDate).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td>
                    <span className={`status-badge status-${r.status || 'active'}`}>
                      {r.status || 'Activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > LIMIT && (
        <div className="clinical-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Anterior
          </button>
          <span>Página {page} de {Math.ceil(total / LIMIT)}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * LIMIT >= total}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryPage;