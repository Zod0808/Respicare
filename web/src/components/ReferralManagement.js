/**
 * Referral Management Component
 * UI para crear y gestionar referidos entre especialistas
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_BASE_URL as API_URL } from '../utils/apiBase';
import { useAuth } from '../contexts/AuthContext';

const ReferralManagement = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    referralType: '',
    priority: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [rejectingReferral, setRejectingReferral] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [completingReferral, setCompletingReferral] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    referredToDoctorId: '',
    referredToDoctorName: '',
    referredToSpecialty: '',
    referralType: 'consultation',
    priority: 'medium',
    reason: '',
    clinicalNotes: '',
    requestedDate: new Date().toISOString().split('T')[0],
  });

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

  useEffect(() => {
    loadReferrals();
    loadStats();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    apiClient
      .get('/auth/doctors')
      .then((response) => setDoctors(response.data?.data ?? []))
      .catch(() => undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const trimmed = patientQuery.trim();
    if (trimmed.length < 2) {
      setPatientResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      apiClient
        .get('/auth/patients', { params: { q: trimmed } })
        .then((response) => setPatientResults(response.data?.data ?? []))
        .catch(() => setPatientResults([]));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [patientQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.referralType) params.append('referralType', filters.referralType);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await apiClient.get(`/referrals?${params.toString()}`);
      setReferrals(response.data.data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
      alert('Error al cargar referidos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/referrals/stats/summary');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    const { patientId, referredToDoctorId, referredToSpecialty, reason } = formData;
    if (!patientId?.trim()) { alert('Debes seleccionar un paciente de la lista de resultados'); return; }
    if (!referredToDoctorId?.trim()) { alert('Debes seleccionar un doctor destino'); return; }
    if (!referredToSpecialty?.trim()) { alert('Especialidad es requerida'); return; }
    if (!reason?.trim()) { alert('Razón del referido es requerida'); return; }
    try {
      // referredToDoctorName no es un campo aceptado por el backend al crear
      // (se calcula del lado del servidor a partir de referredToDoctorId).
      const { referredToDoctorName, ...createPayload } = formData;
      await apiClient.post('/referrals', {
        ...createPayload,
        referringDoctorId: user?._id || user?.id,
        referringDoctorName: user?.name,
      });
      alert('Referido creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadReferrals();
      loadStats();
    } catch (error) {
      console.error('Error creating referral:', error);
      alert(error.response?.data?.message || 'Error al crear referido');
    }
  };

  const handleAcceptReferral = async (referralId, doctorId) => {
    try {
      await apiClient.post(`/referrals/${referralId}/accept`, {
        referredToDoctorId: doctorId,
      });
      alert('Referido aceptado exitosamente');
      loadReferrals();
      loadStats();
    } catch (error) {
      console.error('Error accepting referral:', error);
      alert(error.response?.data?.message || 'Error al aceptar referido');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) { alert('Debes indicar una razón del rechazo'); return; }

    try {
      await apiClient.post(`/referrals/${rejectingReferral._id}/reject`, { reason: rejectReason.trim() });
      alert('Referido rechazado');
      setRejectingReferral(null);
      setRejectReason('');
      loadReferrals();
      loadStats();
    } catch (error) {
      console.error('Error rejecting referral:', error);
      alert(error.response?.data?.message || 'Error al rechazar referido');
    }
  };

  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/referrals/${completingReferral._id}/complete`, { notes: completeNotes.trim() || undefined });
      alert('Referido completado exitosamente');
      setCompletingReferral(null);
      setCompleteNotes('');
      loadReferrals();
      loadStats();
    } catch (error) {
      console.error('Error completing referral:', error);
      alert(error.response?.data?.message || 'Error al completar referido');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      referredToDoctorId: '',
      referredToDoctorName: '',
      referredToSpecialty: '',
      referralType: 'consultation',
      priority: 'medium',
      reason: '',
      clinicalNotes: '',
      requestedDate: new Date().toISOString().split('T')[0],
    });
    setPatientQuery('');
    setPatientResults([]);
  };

  const handleSelectPatient = (patient) => {
    setFormData((prev) => ({ ...prev, patientId: patient._id, patientName: patient.name }));
    setPatientQuery(patient.name);
    setPatientResults([]);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading && referrals.length === 0) {
    return <div className="p-4">Cargando referidos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Referidos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuevo Referido
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">En Progreso</div>
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Completados</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="accepted">Aceptado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="rejected">Rechazado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={filters.referralType}
              onChange={(e) => setFilters({ ...filters, referralType: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="consultation">Consulta</option>
              <option value="specialist">Especialista</option>
              <option value="diagnostic">Diagnóstico</option>
              <option value="treatment">Tratamiento</option>
              <option value="follow_up">Seguimiento</option>
              <option value="emergency">Emergencia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Prioridad</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todas</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Referidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Especialidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {referrals.map((referral) => {
              const myId = user?._id || user?.id;
              const isDoctor = user?.role === 'doctor';
              // Un referido abierto (sin referredToDoctorId) puede ser aceptado por
              // cualquier doctor; una vez asignado, solo ese doctor puede gestionarlo.
              const canAccept = !isDoctor || !referral.referredToDoctorId || referral.referredToDoctorId === myId;
              const canManage = !isDoctor || referral.referredToDoctorId === myId;

              return (
              <tr key={referral._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{referral.patientName}</div>
                  <div className="text-sm text-gray-500">{referral.referringDoctorName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{referral.referralType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{referral.referredToSpecialty || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(referral.status)}`}>
                    {referral.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(referral.priority)}`}>
                    {referral.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(referral.requestedDate || referral.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {referral.status === 'pending' && canAccept && (
                      <button
                        onClick={() => handleAcceptReferral(referral._id, myId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Aceptar
                      </button>
                    )}
                    {referral.status === 'pending' && canManage && (
                      <button
                        onClick={() => setRejectingReferral(referral)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Rechazar
                      </button>
                    )}
                    {(referral.status === 'accepted' || referral.status === 'in_progress') && canManage && (
                      <button
                        onClick={() => setCompletingReferral(referral)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Completar
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedReferral(referral)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nuevo Referido</h2>
            <form onSubmit={handleCreateReferral}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium mb-2">Paciente *</label>
                  <input
                    type="text"
                    value={patientQuery}
                    onChange={(e) => {
                      setPatientQuery(e.target.value);
                      setFormData({ ...formData, patientId: '', patientName: '' });
                    }}
                    placeholder="Escribe el nombre del paciente para buscarlo"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                  {patientResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
                      {patientResults.map((patient) => (
                        <li key={patient._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          >
                            {patient.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {formData.patientId ? (
                    <p className="text-sm text-green-700 mt-1">Paciente seleccionado: {formData.patientName}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Selecciona un paciente de la lista de resultados.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Doctor Destino *</label>
                  <select
                    value={formData.referredToDoctorId}
                    onChange={(e) => {
                      const selected = doctors.find((d) => d._id === e.target.value);
                      setFormData({
                        ...formData,
                        referredToDoctorId: e.target.value,
                        referredToDoctorName: selected?.name || '',
                      });
                    }}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Selecciona un doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Especialidad</label>
                  <input
                    type="text"
                    value={formData.referredToSpecialty}
                    onChange={(e) => setFormData({ ...formData, referredToSpecialty: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: Cardiología, Neumología"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Referido *</label>
                  <select
                    value={formData.referralType}
                    onChange={(e) => setFormData({ ...formData, referralType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="consultation">Consulta</option>
                    <option value="specialist">Especialista</option>
                    <option value="diagnostic">Diagnóstico</option>
                    <option value="treatment">Tratamiento</option>
                    <option value="follow_up">Seguimiento</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Razón del Referido *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notas Clínicas</label>
                <textarea
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="4"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Crear Referido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detalle del Referido</h2>
            <div className="space-y-4">
              <div>
                <strong>Paciente:</strong> {selectedReferral.patientName}
              </div>
              <div>
                <strong>Doctor que Refiere:</strong> {selectedReferral.referringDoctorName}
              </div>
              {selectedReferral.referredToDoctorName && (
                <div>
                  <strong>Doctor Destino:</strong> {selectedReferral.referredToDoctorName}
                </div>
              )}
              <div>
                <strong>Tipo:</strong> {selectedReferral.referralType}
              </div>
              <div>
                <strong>Prioridad:</strong> {selectedReferral.priority}
              </div>
              <div>
                <strong>Estado:</strong> {selectedReferral.status}
              </div>
              <div>
                <strong>Razón:</strong>
                <p className="mt-1">{selectedReferral.reason}</p>
              </div>
              {selectedReferral.clinicalNotes && (
                <div>
                  <strong>Notas Clínicas:</strong>
                  <p className="mt-1">{selectedReferral.clinicalNotes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {rejectingReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Rechazar Referido</h2>
            <form onSubmit={handleConfirmReject}>
              <label className="block text-sm font-medium mb-2">Razón del Rechazo *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Describe la razón del rechazo..."
                className="w-full border rounded px-3 py-2"
                rows="3"
                maxLength={1000}
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setRejectingReferral(null); setRejectReason(''); }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Completar */}
      {completingReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Completar Referido</h2>
            <form onSubmit={handleConfirmComplete}>
              <label className="block text-sm font-medium mb-2">Notas de Finalización (opcional)</label>
              <textarea
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="Describe el resultado de la atención..."
                className="w-full border rounded px-3 py-2"
                rows="3"
                maxLength={5000}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setCompletingReferral(null); setCompleteNotes(''); }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;

