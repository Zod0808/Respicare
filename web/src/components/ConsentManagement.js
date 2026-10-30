/**
 * Consent Management Component
 * UI para gestión de consentimientos informados médicos. El personal clínico
 * (doctor/admin) ve el panel de autoría con filtros, estadísticas y el
 * formulario de creación; el paciente ve únicamente sus propios
 * consentimientos con la acción que realmente puede ejecutar — firmar los
 * pendientes o descargar los ya firmados.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_BASE_URL as API_URL } from '../utils/apiBase';
import { useAuth } from '../contexts/AuthContext';
import '../pages/clinical.css';
import './ConsentManagement.css';

const TYPE_LABELS = {
  procedure: 'Procedimiento',
  treatment: 'Tratamiento',
  surgery: 'Cirugía',
  research: 'Investigación',
  data_sharing: 'Compartir Datos',
  photography: 'Fotografía',
  video_recording: 'Grabación de Video',
  other: 'Otro',
};

const STATUS_LABELS = {
  draft: 'Borrador',
  pending_signature: 'Pendiente de firma',
  signed: 'Firmado',
  revoked: 'Revocado',
  expired: 'Expirado',
};

const STATUS_CLASS = {
  draft: 'status-inactive',
  pending_signature: 'status-pending',
  signed: 'status-active',
  revoked: 'status-critical',
  expired: 'status-critical',
};

const EMPTY_FORM = {
  patientId: '',
  patientName: '',
  consentType: 'procedure',
  title: '',
  description: '',
  procedureDetails: '',
  risks: [],
  benefits: [],
  alternatives: [],
  expiresAt: '',
};

const getTypeLabel = (type) => TYPE_LABELS[type] || type;
const getStatusLabel = (status) => STATUS_LABELS[status] || status;
const getStatusClass = (status) => STATUS_CLASS[status] || 'status-pending';

const ConsentManagement = () => {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    consentType: '',
  });

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [newRisk, setNewRisk] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newAlternative, setNewAlternative] = useState('');

  useEffect(() => {
    loadConsents();
    if (!isPatient) loadStats();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const apiClient = axios.create?.({
    baseURL: `${API_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  }) || axios;

  apiClient.interceptors?.request?.use?.((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const loadConsents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.consentType) params.append('consentType', filters.consentType);

      const response = await apiClient.get(`/informed-consents?${params.toString()}`);
      setConsents(response.data.data || []);
    } catch (error) {
      console.error('Error loading consents:', error);
      alert('Error al cargar consentimientos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/informed-consents/stats/summary');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/informed-consents', {
        ...formData,
        doctorId: user?._id || user?.id,
        doctorName: user?.name,
        risks: formData.risks.filter(r => r.trim()),
        benefits: formData.benefits.filter(b => b.trim()),
        alternatives: formData.alternatives.filter(a => a.trim()),
      });
      alert('Consentimiento creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadConsents();
      loadStats();
    } catch (error) {
      console.error('Error creating consent:', error);
      alert(error.response?.data?.message || 'Error al crear consentimiento');
    }
  };

  const handlePresentConsent = async (consentId) => {
    try {
      await apiClient.post(`/informed-consents/${consentId}/present`);
      alert('Consentimiento presentado al paciente');
      loadConsents();
      loadStats();
    } catch (error) {
      console.error('Error presenting consent:', error);
      alert(error.response?.data?.message || 'Error al presentar consentimiento');
    }
  };

  const handleSignConsent = async (consentId, signerRole = 'patient') => {
    try {
      const canvas = document.getElementById('signatureCanvas');
      if (!canvas) {
        alert('Por favor, dibuje su firma');
        return;
      }

      // Verificar que el canvas tiene contenido real (no está en blanco)
      const ctx = canvas.getContext('2d');
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasContent = pixels.some((v, i) => i % 4 === 3 && v > 0); // canal alpha > 0
      if (!hasContent) {
        alert('Por favor, dibuje su firma antes de continuar');
        return;
      }

      const signatureData = canvas.toDataURL('image/png');

      await apiClient.post(`/informed-consents/${consentId}/sign`, {
        signerId: user?._id || user?.id,
        signerName: user?.name,
        signerRole: signerRole,
        signatureData: signatureData,
        signatureMethod: 'click_to_sign',
      });

      alert('Firma agregada exitosamente');
      setShowSignatureModal(false);
      clearSignature();
      loadConsents();
      loadStats();
    } catch (error) {
      console.error('Error signing consent:', error);
      alert(error.response?.data?.message || 'Error al firmar consentimiento');
    }
  };

  const handleRevokeConsent = async (consentId) => {
    const reason = prompt('Razón de revocación:');
    if (!reason) return;

    try {
      await apiClient.post(`/informed-consents/${consentId}/revoke`, { reason });
      alert('Consentimiento revocado');
      loadConsents();
      loadStats();
    } catch (error) {
      console.error('Error revoking consent:', error);
      alert(error.response?.data?.message || 'Error al revocar consentimiento');
    }
  };

  const handleDownloadPDF = async (consentId) => {
    try {
      const response = await apiClient.get(`/informed-consents/${consentId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consentimiento-${consentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar PDF');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setNewRisk('');
    setNewBenefit('');
    setNewAlternative('');
  };

  const addRisk = () => {
    if (newRisk.trim()) {
      setFormData({ ...formData, risks: [...formData.risks, newRisk.trim()] });
      setNewRisk('');
    }
  };

  const removeRisk = (index) => {
    setFormData({
      ...formData,
      risks: formData.risks.filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({ ...formData, benefits: [...formData.benefits, newBenefit.trim()] });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const addAlternative = () => {
    if (newAlternative.trim()) {
      setFormData({
        ...formData,
        alternatives: [...formData.alternatives, newAlternative.trim()],
      });
      setNewAlternative('');
    }
  };

  const removeAlternative = (index) => {
    setFormData({
      ...formData,
      alternatives: formData.alternatives.filter((_, i) => i !== index),
    });
  };

  const initSignatureCanvas = () => {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      lastX = x;
      lastY = y;
    });

    canvas.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    canvas.addEventListener('mouseout', () => {
      isDrawing = false;
    });
  };

  const clearSignature = () => {
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    if (showSignatureModal) {
      setTimeout(initSignatureCanvas, 100);
    }
  }, [showSignatureModal]);

  if (loading && consents.length === 0) {
    return (
      <div className="clinical-loading">
        <div className="loading-spinner" />
        <p>Cargando consentimientos…</p>
      </div>
    );
  }

  const signatureModal = showSignatureModal && selectedConsent && (
    <div className="consent-modal">
      <div className="consent-modal__content consent-modal__content--sign">
        <h2>Firmar Consentimiento</h2>
        <p className="consent-modal__hint">Dibuje su firma en el área de abajo:</p>
        <canvas
          id="signatureCanvas"
          width="600"
          height="200"
          className="consent-signature-canvas"
          style={{ touchAction: 'none' }}
        />
        <div className="consent-modal__actions">
          <button type="button" className="consent-btn" onClick={clearSignature}>
            Limpiar
          </button>
          <button
            type="button"
            className="consent-btn"
            onClick={() => {
              setShowSignatureModal(false);
              clearSignature();
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="consent-btn consent-btn--primary"
            onClick={() => handleSignConsent(selectedConsent._id)}
          >
            Firmar
          </button>
        </div>
      </div>
    </div>
  );

  const detailModal = selectedConsent && !showSignatureModal && (
    <div className="consent-modal">
      <div className="consent-modal__content consent-modal__content--wide">
        <h2>Detalle del Consentimiento</h2>
        <div className="consent-detail">
          <div><strong>Paciente:</strong> {selectedConsent.patientName}</div>
          <div><strong>Doctor:</strong> {selectedConsent.doctorName}</div>
          <div><strong>Tipo:</strong> {getTypeLabel(selectedConsent.consentType)}</div>
          <div><strong>Estado:</strong> {selectedConsent.status}</div>
          <div><strong>Título:</strong> {selectedConsent.title}</div>
          <div>
            <strong>Descripción:</strong>
            <p>{selectedConsent.description}</p>
          </div>
          {selectedConsent.procedureDetails && (
            <div>
              <strong>Detalles del Procedimiento:</strong>
              <p>{selectedConsent.procedureDetails}</p>
            </div>
          )}
          {selectedConsent.risks && selectedConsent.risks.length > 0 && (
            <div>
              <strong>Riesgos:</strong>
              <ul>
                {selectedConsent.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedConsent.benefits && selectedConsent.benefits.length > 0 && (
            <div>
              <strong>Beneficios:</strong>
              <ul>
                {selectedConsent.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedConsent.alternatives && selectedConsent.alternatives.length > 0 && (
            <div>
              <strong>Alternativas:</strong>
              <ul>
                {selectedConsent.alternatives.map((alternative, index) => (
                  <li key={index}>{alternative}</li>
                ))}
              </ul>
            </div>
          )}
          {selectedConsent.patientSignature && (
            <div>
              <strong>Firma del Paciente:</strong>
              <p>
                {selectedConsent.patientSignature.signerName} -{' '}
                {new Date(selectedConsent.patientSignature.signedAt).toLocaleString()}
              </p>
            </div>
          )}
          {selectedConsent.doctorSignature && (
            <div>
              <strong>Firma del Doctor:</strong>
              <p>
                {selectedConsent.doctorSignature.signerName} -{' '}
                {new Date(selectedConsent.doctorSignature.signedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        <div className="consent-modal__actions">
          <button type="button" className="consent-btn" onClick={() => setSelectedConsent(null)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // ── Vista del paciente: solo sus consentimientos, con la acción que
  // realmente puede ejecutar — nada de autoría, filtros ni estadísticas. ──
  if (isPatient) {
    return (
      <div className="consent-page consent-page--patient">
        <p className="consent-intro">
          Aquí puedes revisar los consentimientos que tu médico te ha presentado y firmarlos cuando estés listo.
        </p>

        {consents.length === 0 ? (
          <p className="clinical-empty-cards">
            No tienes consentimientos informados por ahora. Aparecerán aquí cuando tu médico te presente uno para firmar.
          </p>
        ) : (
          <div className="clinical-cards">
            {consents.map((consent) => (
              <article className="clinical-card" key={consent._id}>
                <div className="clinical-card__header">
                  <h3>{consent.title}</h3>
                  <span className={`status-badge ${getStatusClass(consent.status)}`}>
                    {getStatusLabel(consent.status)}
                  </span>
                </div>
                <div className="clinical-card__meta">
                  <span>{getTypeLabel(consent.consentType)}</span>
                  {consent.doctorName && (
                    <span className="clinical-card__label">Presentado por {consent.doctorName}</span>
                  )}
                  <span className="clinical-card__date">
                    {consent.createdAt ? new Date(consent.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="consent-card__actions">
                  {consent.status === 'pending_signature' && (
                    <button
                      type="button"
                      className="consent-btn consent-btn--primary"
                      onClick={() => {
                        setSelectedConsent(consent);
                        setShowSignatureModal(true);
                      }}
                    >
                      Firmar
                    </button>
                  )}
                  {consent.status === 'signed' && (
                    <button
                      type="button"
                      className="consent-btn"
                      onClick={() => handleDownloadPDF(consent._id)}
                    >
                      Descargar PDF
                    </button>
                  )}
                  <button
                    type="button"
                    className="consent-btn consent-btn--ghost"
                    onClick={() => setSelectedConsent(consent)}
                  >
                    Ver detalle
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {signatureModal}
        {detailModal}
      </div>
    );
  }

  // ── Vista del personal clínico: autoría, filtros, estadísticas y tabla. ──
  return (
    <div className="consent-page">
      <div className="consent-toolbar">
        <h1>Gestión de Consentimientos Informados</h1>
        <button
          type="button"
          className="consent-btn consent-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Nuevo Consentimiento
        </button>
      </div>

      {stats && (
        <div className="consent-stats">
          <div className="consent-stat"><span>Total</span><strong>{stats.total}</strong></div>
          <div className="consent-stat"><span>Borrador</span><strong>{stats.draft}</strong></div>
          <div className="consent-stat"><span>Pendiente Firma</span><strong>{stats.pendingSignature}</strong></div>
          <div className="consent-stat"><span>Firmados</span><strong>{stats.signed}</strong></div>
          <div className="consent-stat"><span>Revocados</span><strong>{stats.revoked}</strong></div>
        </div>
      )}

      <div className="consent-filters">
        <label>
          Estado
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="pending_signature">Pendiente Firma</option>
            <option value="signed">Firmado</option>
            <option value="revoked">Revocado</option>
            <option value="expired">Expirado</option>
          </select>
        </label>
        <label>
          Tipo
          <select
            value={filters.consentType}
            onChange={(e) => setFilters({ ...filters, consentType: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="procedure">Procedimiento</option>
            <option value="treatment">Tratamiento</option>
            <option value="surgery">Cirugía</option>
            <option value="research">Investigación</option>
            <option value="data_sharing">Compartir Datos</option>
            <option value="photography">Fotografía</option>
            <option value="video_recording">Grabación de Video</option>
            <option value="other">Otro</option>
          </select>
        </label>
      </div>

      <div className="clinical-table-wrapper">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {consents.map((consent) => (
              <tr key={consent._id}>
                <td>
                  <div>{consent.patientName}</div>
                  <div className="clinical-card__label">{consent.doctorName}</div>
                </td>
                <td>{consent.title}</td>
                <td>{getTypeLabel(consent.consentType)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(consent.status)}`}>
                    {getStatusLabel(consent.status)}
                  </span>
                </td>
                <td>{new Date(consent.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="consent-actions-cell">
                    {consent.status === 'draft' && (
                      <button
                        type="button"
                        className="consent-link consent-link--petrol"
                        onClick={() => handlePresentConsent(consent._id)}
                      >
                        Presentar
                      </button>
                    )}
                    {consent.status === 'pending_signature' && (
                      <button
                        type="button"
                        className="consent-link consent-link--green"
                        onClick={() => {
                          setSelectedConsent(consent);
                          setShowSignatureModal(true);
                        }}
                      >
                        Firmar
                      </button>
                    )}
                    {consent.status === 'signed' && (
                      <button
                        type="button"
                        className="consent-link consent-link--clay"
                        onClick={() => handleDownloadPDF(consent._id)}
                      >
                        PDF
                      </button>
                    )}
                    {(consent.status === 'signed' || consent.status === 'pending_signature') && (
                      <button
                        type="button"
                        className="consent-link consent-link--danger"
                        onClick={() => handleRevokeConsent(consent._id)}
                      >
                        Revocar
                      </button>
                    )}
                    <button
                      type="button"
                      className="consent-link"
                      onClick={() => setSelectedConsent(consent)}
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="consent-modal">
          <div className="consent-modal__content consent-modal__content--wide">
            <h2>Nuevo Consentimiento Informado</h2>
            <form onSubmit={handleCreateConsent}>
              <div className="consent-form-grid">
                <div className="consent-form-field">
                  <label>ID del Paciente *</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  />
                </div>
                <div className="consent-form-field">
                  <label>Nombre del Paciente *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                  />
                </div>
                <div className="consent-form-field">
                  <label>Tipo de Consentimiento *</label>
                  <select
                    value={formData.consentType}
                    onChange={(e) => setFormData({ ...formData, consentType: e.target.value })}
                    required
                  >
                    <option value="procedure">Procedimiento</option>
                    <option value="treatment">Tratamiento</option>
                    <option value="surgery">Cirugía</option>
                    <option value="research">Investigación</option>
                    <option value="data_sharing">Compartir Datos</option>
                    <option value="photography">Fotografía</option>
                    <option value="video_recording">Grabación de Video</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="consent-form-field">
                  <label>Fecha de Expiración</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="consent-form-field">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="consent-form-field">
                <label>Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>

              <div className="consent-form-field">
                <label>Detalles del Procedimiento</label>
                <textarea
                  value={formData.procedureDetails}
                  onChange={(e) => setFormData({ ...formData, procedureDetails: e.target.value })}
                  rows="4"
                />
              </div>

              {/* Riesgos */}
              <div className="consent-form-field">
                <label>Riesgos</label>
                <div className="consent-list-adder">
                  <input
                    type="text"
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRisk())}
                    placeholder="Agregar riesgo"
                  />
                  <button type="button" onClick={addRisk}>Agregar</button>
                </div>
                <div className="consent-list-items">
                  {formData.risks.map((risk, index) => (
                    <div key={index} className="consent-list-item">
                      <span>- {risk}</span>
                      <button type="button" onClick={() => removeRisk(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <div className="consent-form-field">
                <label>Beneficios</label>
                <div className="consent-list-adder">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="Agregar beneficio"
                  />
                  <button type="button" onClick={addBenefit}>Agregar</button>
                </div>
                <div className="consent-list-items">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="consent-list-item">
                      <span>- {benefit}</span>
                      <button type="button" onClick={() => removeBenefit(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternativas */}
              <div className="consent-form-field">
                <label>Alternativas</label>
                <div className="consent-list-adder">
                  <input
                    type="text"
                    value={newAlternative}
                    onChange={(e) => setNewAlternative(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternative())}
                    placeholder="Agregar alternativa"
                  />
                  <button type="button" onClick={addAlternative}>Agregar</button>
                </div>
                <div className="consent-list-items">
                  {formData.alternatives.map((alternative, index) => (
                    <div key={index} className="consent-list-item">
                      <span>- {alternative}</span>
                      <button type="button" onClick={() => removeAlternative(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="consent-modal__actions">
                <button
                  type="button"
                  className="consent-btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="consent-btn consent-btn--primary">
                  Crear Consentimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {signatureModal}
      {detailModal}
    </div>
  );
};

export default ConsentManagement;
