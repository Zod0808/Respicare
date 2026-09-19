/**
 * Nombre de Objeto: PatientMonitoringPage
 * Fecha de Creación: 2026-05-07
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-007 - Panel del doctor
 * Descripción: Panel del doctor con monitoreo en tiempo real de signos
 * vitales de pacientes vía WebSocket, clasificando severidad según umbrales
 * clínicos de frecuencia cardíaca, SpO2 y frecuencia respiratoria.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../utils/apiBase';
import './PatientMonitoringPage.css';

function buildWsUrl() {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:3001`;
}
const WS_URL = buildWsUrl();
const RECONNECT_DELAY_MS = 3000;
const WEARABLE_POLL_MS = 60_000;
const ALERT_POLL_MS = 30_000;

// Clinical thresholds aligned with backend wearableAlertService
const THRESHOLDS = {
  hrCriticalHigh: 130,
  hrHigh: 100,
  hrMediumHighLow: 90, // hr in (90, 100] => medium
  hrCriticalLow: 40,
  hrHighLow: 50,
  hrMediumLowHigh: 60, // hr in [50, 60) => medium
  spo2Critical: 90,
  spo2High: 94,
  spo2MediumHigh: 96, // spo2 in [94, 96) => medium
  rrCriticalHigh: 30,
  rrHigh: 25,
  rrCriticalLow: 10,
  rrHighLow: 12,
};

const RISK_LABELS = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  ok: 'Bajo',
  waiting: 'Esperando',
};

function statusFor(reading) {
  if (!reading) return 'waiting';
  const { heartRate: hr, oxygenSaturation: spo2, respiratoryRate: rr } = reading;

  if (
    (hr !== undefined && (hr >= THRESHOLDS.hrCriticalHigh || hr <= THRESHOLDS.hrCriticalLow)) ||
    (spo2 !== undefined && spo2 < THRESHOLDS.spo2Critical) ||
    (rr !== undefined && (rr >= THRESHOLDS.rrCriticalHigh || rr <= THRESHOLDS.rrCriticalLow))
  ) return 'critical';

  if (
    (hr !== undefined && (hr > THRESHOLDS.hrHigh || hr < THRESHOLDS.hrHighLow)) ||
    (spo2 !== undefined && spo2 < THRESHOLDS.spo2High) ||
    (rr !== undefined && (rr >= THRESHOLDS.rrHigh || rr <= THRESHOLDS.rrHighLow))
  ) return 'high';

  if (
    (hr !== undefined && (
      (hr > THRESHOLDS.hrMediumHighLow && hr <= THRESHOLDS.hrHigh) ||
      (hr >= THRESHOLDS.hrHighLow && hr < THRESHOLDS.hrMediumLowHigh)
    )) ||
    (spo2 !== undefined && spo2 >= THRESHOLDS.spo2High && spo2 < THRESHOLDS.spo2MediumHigh)
  ) return 'medium';

  return 'ok';
}

function metricSeverity(value, criticalHigh, high, criticalLow, highLow, mediumHighEdge, mediumLowEdge) {
  if (value == null) return 'normal';
  if (criticalHigh !== undefined && value >= criticalHigh) return 'critical';
  if (criticalLow !== undefined && value <= criticalLow) return 'critical';
  if (high !== undefined && value > high) return 'high';
  if (highLow !== undefined && value < highLow) return 'high';
  if (mediumHighEdge !== undefined && high !== undefined && value > mediumHighEdge && value <= high) return 'medium';
  if (mediumLowEdge !== undefined && highLow !== undefined && value >= highLow && value < mediumLowEdge) return 'medium';
  return 'normal';
}

function relativeTime(lastSeen, now) {
  if (!lastSeen) return '—';
  const diff = Math.round((now - lastSeen) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.round(diff / 60)}min`;
  return `hace ${Math.round(diff / 3600)}h`;
}

function playBeep(critical = false) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const times = critical ? [0, 0.45] : [0];
    times.forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = critical ? 880 : 620;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.35);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.35);
    });
  } catch {
    // AudioContext may be blocked without prior user gesture
  }
}

export default function PatientMonitoringPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pollTimer = useRef(null);
  const alertPollTimer = useRef(null);
  const authFailedRef = useRef(false);
  const soundEnabledRef = useRef(false);
  const prevStatusRef = useRef({});
  const patientsRef = useRef({});

  const [connected, setConnected] = useState(false);
  const [patients, setPatients] = useState({});
  const [alertLog, setAlertLog] = useState([]);
  const [dbAlertsByPatient, setDbAlertsByPatient] = useState({});
  const [errors, setErrors] = useState([]);
  const [lastPolled, setLastPolled] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [patientMeta, setPatientMeta] = useState({});
  const [spo2Trend, setSpo2Trend] = useState([]);
  const [now, setNow] = useState(Date.now());

  const addError = useCallback((msg) => {
    const id = Date.now();
    setErrors((prev) => [...prev, { id, msg }]);
    setTimeout(() => setErrors((prev) => prev.filter((e) => e.id !== id)), 8000);
  }, []);

  const dismissError = (id) => setErrors((prev) => prev.filter((e) => e.id !== id));

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      soundEnabledRef.current = !prev;
      return !prev;
    });
  }, []);

  /* ── DB alerts per patient ── */
  const fetchPatientAlerts = useCallback(async (patientId) => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/alerts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { patientId, status: 'pending', category: 'critical_symptom' },
      });
      const list = Array.isArray(data?.data) ? data.data : [];
      setDbAlertsByPatient((prev) => ({ ...prev, [patientId]: list }));
    } catch {
      // DB alerts are supplementary; ignore fetch errors silently
    }
  }, [token]);

  const acknowledgeAlert = useCallback(async (alertId) => {
    if (!token) return;
    try {
      await axios.post(`${API_BASE}/alerts/${alertId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDbAlertsByPatient((prev) => {
        const next = { ...prev };
        for (const pid of Object.keys(next)) {
          next[pid] = next[pid].filter((a) => a._id !== alertId);
        }
        return next;
      });
    } catch (err) {
      addError(`Error al reconocer la alerta: ${err.response?.data?.message || err.message}`);
    }
  }, [token, addError]);

  /* ── Patient name/age (denormalised on MedicalHistory) ── */
  const fetchPatientMeta = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/medical-histories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      const payload = data?.data;
      const list = Array.isArray(payload) ? payload : payload?.records || payload?.histories || [];
      setPatientMeta((prev) => {
        const next = { ...prev };
        list.forEach((h) => {
          const pid = h.patientId?._id || h.patientId;
          if (!pid || next[pid]) return; // list is sorted by date desc: first hit is the most recent
          next[pid] = { name: h.patientName, age: h.age };
        });
        return next;
      });
    } catch {
      // Nombre/edad son un complemento visual; ignorar errores de fetch
    }
  }, [token]);

  /* ── 7-day SpO2 trend ── */
  const fetchSpo2Trend = useCallback(async () => {
    if (!token) return;
    try {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await axios.get(`${API_BASE}/wearables/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, limit: 1000 },
      });
      const readings = data?.data?.data ?? data?.data ?? [];
      const byDay = {};
      readings.forEach((r) => {
        if (r.oxygenSaturation == null || !r.timestamp) return;
        const day = new Date(r.timestamp).toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = { sum: 0, count: 0 };
        byDay[day].sum += r.oxygenSaturation;
        byDay[day].count += 1;
      });
      const days = Object.keys(byDay).sort();
      setSpo2Trend(days.map((day) => ({
        day: new Date(`${day}T00:00:00`).toLocaleDateString('es-PE', { weekday: 'short' }),
        spo2: Math.round((byDay[day].sum / byDay[day].count) * 10) / 10,
      })));
    } catch {
      // El gráfico de tendencia es complementario; ignorar errores de fetch
    }
  }, [token]);

  /* ── Vitals processing with sound and alert log ── */
  const processVitals = useCallback((patientId, reading) => {
    setPatients((prev) => ({
      ...prev,
      [patientId]: { reading, lastSeen: Date.now() },
    }));

    const newStatus = statusFor(reading);
    const prevStatus = prevStatusRef.current[patientId];

    if (newStatus !== prevStatus && (newStatus === 'critical' || newStatus === 'high')) {
      if (soundEnabledRef.current) playBeep(newStatus === 'critical');

      setAlertLog((prev) => [
        {
          patientId,
          reading,
          status: newStatus,
          time: new Date().toLocaleTimeString('es-PE'),
          date: new Date().toDateString(),
        },
        ...prev.slice(0, 49),
      ]);
    }

    prevStatusRef.current[patientId] = newStatus;
  }, []);

  /* ── WebSocket ── */
  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState < 2) return;
    authFailedRef.current = false;

    let ws;
    try {
      ws = new WebSocket(`${WS_URL}/ws/doctor`);
    } catch (err) {
      addError(`No se pudo crear la conexión WebSocket: ${err.message}`);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
    };

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch {
        addError('Mensaje WebSocket malformado recibido.');
        return;
      }

      if (msg.type === 'auth:ok') {
        // El servidor filtra los pacientes por el JWT del doctor autenticado
        ws.send(JSON.stringify({ type: 'subscribe', payload: {} }));
      }

      if (msg.type === 'auth:error') {
        authFailedRef.current = true;
        addError(msg.payload?.message || 'Sin permiso para el monitoreo en tiempo real. Verifica tu sesión.');
        ws.close(1000, 'auth error');
        return;
      }

      if (msg.type === 'error') {
        addError(msg.payload?.message || 'Error recibido del servidor de monitoreo.');
        return;
      }

      if (msg.type === 'vitals') {
        const { patientId, ...reading } = msg.payload;
        processVitals(patientId, reading);
      }
    };

    ws.onclose = (ev) => {
      setConnected(false);
      if (ev.code !== 1000 && !authFailedRef.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      if (!authFailedRef.current) {
        addError('Error de conexión WebSocket. Intentando reconectar en 3 segundos…');
      }
      ws.close();
    };
  }, [token, addError, processVitals]);

  /* ── Polling wearables from DB ── */
  const pollWearables = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/wearables/data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      const readings = data?.data?.data ?? data?.data ?? [];
      if (!Array.isArray(readings) || readings.length === 0) return;

      setLastPolled(new Date());
      setPatients((prev) => {
        const next = { ...prev };
        readings.forEach((r) => {
          const pid = r.patientId ?? r.userId ?? r._id;
          if (!pid) return;
          const reading = {
            heartRate: r.heartRate,
            oxygenSaturation: r.oxygenSaturation,
            respiratoryRate: r.respiratoryRate,
          };
          const ts = r.timestamp ? new Date(r.timestamp).getTime() : Date.now();
          if (!next[pid] || ts > (next[pid].lastSeen ?? 0)) {
            next[pid] = { reading, lastSeen: ts };
          }
        });
        return next;
      });
    } catch (err) {
      addError(`[BD] ${err.response?.data?.message || err.message}`);
    }
  }, [token, addError]);

  useEffect(() => {
    connect();
    const ping = setInterval(() => {
      if (wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25_000);

    pollWearables();
    pollTimer.current = setInterval(pollWearables, WEARABLE_POLL_MS);

    fetchPatientMeta();
    fetchSpo2Trend();

    return () => {
      clearInterval(ping);
      clearInterval(pollTimer.current);
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close(1000, 'component unmount');
    };
  }, [connect, pollWearables, fetchPatientMeta, fetchSpo2Trend]);

  // Tick every 5s so "última lectura" / "conectados en vivo" stay fresh
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(tick);
  }, []);

  // Keep patientsRef current
  useEffect(() => { patientsRef.current = patients; }, [patients]);

  // Fetch DB alerts when a new patient appears
  useEffect(() => {
    const prevPids = new Set(Object.keys(patientsRef.current));
    const newPids = Object.keys(patients).filter((pid) => !prevPids.has(pid));
    newPids.forEach((pid) => fetchPatientAlerts(pid));
  }, [patients, fetchPatientAlerts]);

  // Periodic DB alert refresh
  useEffect(() => {
    alertPollTimer.current = setInterval(() => {
      Object.keys(patientsRef.current).forEach((pid) => fetchPatientAlerts(pid));
    }, ALERT_POLL_MS);
    return () => clearInterval(alertPollTimer.current);
  }, [fetchPatientAlerts]);

  const patientEntries = Object.entries(patients);
  const criticalCount = patientEntries.filter(([, v]) => statusFor(v.reading) === 'critical').length;
  const liveCount = patientEntries.filter(([, v]) => now - v.lastSeen < 60_000).length;
  const todayStr = new Date().toDateString();
  const alertsTodayFromLog = alertLog.filter((e) => e.date === todayStr).length;
  const pendingDbAlertsCount = Object.values(dbAlertsByPatient).reduce((sum, list) => sum + (list?.length || 0), 0);
  const alertsToday = alertsTodayFromLog + pendingDbAlertsCount;

  const sortedPatientEntries = [...patientEntries].sort(([, a], [, b]) => {
    const rank = { critical: 0, high: 1, medium: 2, ok: 3, waiting: 4 };
    const ra = rank[statusFor(a.reading)] ?? 4;
    const rb = rank[statusFor(b.reading)] ?? 4;
    return ra - rb || b.lastSeen - a.lastSeen;
  });

  const pendingAlertsFlat = Object.entries(dbAlertsByPatient)
    .flatMap(([pid, list]) => (list || []).map((a) => ({ ...a, patientId: pid })))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="monitoring-page">
      <header className="monitoring-header">
        <h1 className="monitoring-title">Panel del médico</h1>
        <div className="monitoring-status">
          <span className={`monitoring-dot monitoring-dot--${connected ? 'on' : 'off'}`} />
          {connected ? 'Conectado' : 'Reconectando...'}
          {lastPolled && (
            <span className="monitoring-poll-info">BD: {lastPolled.toLocaleTimeString('es-PE')}</span>
          )}
          <button
            className={`monitoring-sound-btn ${soundEnabled ? 'monitoring-sound-btn--on' : ''}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar alertas sonoras' : 'Activar sonido de alertas'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
        </div>
      </header>

      {errors.map(({ id, msg }) => (
        <div key={id} className="monitoring-error" role="alert">
          ⚠️ {msg}
          <button className="monitoring-error__dismiss" onClick={() => dismissError(id)} aria-label="Cerrar">✕</button>
        </div>
      ))}

      <div className="monitoring-stats">
        <div className="stat-card">
          <span className="stat-card__value">{patientEntries.length}</span>
          <span className="stat-card__label">Pacientes activos</span>
        </div>
        <div className="stat-card stat-card--warn">
          <span className="stat-card__value">{alertsToday}</span>
          <span className="stat-card__label">Alertas hoy</span>
        </div>
        <div className="stat-card stat-card--critical">
          <span className="stat-card__value">{criticalCount}</span>
          <span className="stat-card__label">Riesgo crítico</span>
        </div>
        <div className="stat-card stat-card--live">
          <span className="stat-card__value">{liveCount}</span>
          <span className="stat-card__label">Conectados en vivo</span>
        </div>
      </div>

      <section className="monitoring-table-card">
        <h2 className="monitoring-table-card__title">Pacientes bajo seguimiento</h2>
        {patientEntries.length === 0 ? (
          <div className="monitoring-empty">
            <p>Esperando datos de pacientes...</p>
            <p className="monitoring-empty__sub">
              Los pacientes aparecerán aquí cuando envíen datos desde su wearable.
            </p>
          </div>
        ) : (
          <div className="monitoring-table-wrapper">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Edad</th>
                  <th>SpO₂</th>
                  <th>FC</th>
                  <th>Última lectura</th>
                  <th>Riesgo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatientEntries.map(([pid, { reading, lastSeen }]) => {
                  const status = statusFor(reading);
                  const meta = patientMeta[pid];
                  const spo2Sev = metricSeverity(
                    reading?.oxygenSaturation, undefined, undefined,
                    THRESHOLDS.spo2Critical, THRESHOLDS.spo2High, undefined, THRESHOLDS.spo2MediumHigh
                  );
                  const hrSev = metricSeverity(
                    reading?.heartRate, THRESHOLDS.hrCriticalHigh, THRESHOLDS.hrHigh,
                    THRESHOLDS.hrCriticalLow, THRESHOLDS.hrHighLow, THRESHOLDS.hrMediumHighLow, THRESHOLDS.hrMediumLowHigh
                  );
                  return (
                    <tr key={pid} className={`monitoring-row monitoring-row--${status}`}>
                      <td className="monitoring-table__name" title={pid}>
                        {meta?.name || `Paciente ${pid.slice(-6)}`}
                      </td>
                      <td>{meta?.age ?? '—'}</td>
                      <td className={`monitoring-table__metric monitoring-table__metric--${spo2Sev}`}>
                        {reading?.oxygenSaturation != null ? `${reading.oxygenSaturation}%` : '—'}
                      </td>
                      <td className={`monitoring-table__metric monitoring-table__metric--${hrSev}`}>
                        {reading?.heartRate != null ? `${reading.heartRate} bpm` : '—'}
                      </td>
                      <td>{relativeTime(lastSeen, now)}</td>
                      <td>
                        <span className={`risk-badge risk-badge--${status}`}>{RISK_LABELS[status]}</span>
                      </td>
                      <td>
                        <button
                          className="monitoring-table__action"
                          onClick={() => navigate(`/medical-history?patientId=${pid}`)}
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="monitoring-columns">
        <section className="monitoring-chart-card">
          <h2 className="monitoring-chart-card__title">SpO₂ últimos 7 días</h2>
          {spo2Trend.length === 0 ? (
            <p className="monitoring-chart-card__empty">Sin datos suficientes todavía.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={spo2Trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[80, 100]} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="spo2" name="SpO₂ promedio" stroke="#0ea5e9" fill="#0ea5e933" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="monitoring-feed-card">
          <h2 className="monitoring-feed-card__title">Últimas alertas</h2>
          {pendingAlertsFlat.length === 0 && alertLog.length === 0 ? (
            <p className="monitoring-feed-card__empty">Sin alertas registradas.</p>
          ) : (
            <ul className="monitoring-feed">
              {pendingAlertsFlat.length > 0
                ? pendingAlertsFlat.slice(0, 5).map((a) => (
                  <li
                    key={a._id}
                    className={`monitoring-feed__item monitoring-feed__item--${a.priority === 'critical' ? 'critical' : 'high'}`}
                  >
                    <span className="monitoring-feed__dot" />
                    <div className="monitoring-feed__body">
                      <span className="monitoring-feed__patient">
                        {patientMeta[a.patientId]?.name || `Paciente ${a.patientId.slice(-6)}`}
                      </span>
                      <span className="monitoring-feed__msg">{a.title} · {a.message}</span>
                    </div>
                    <button
                      className="monitoring-feed__ack"
                      onClick={() => acknowledgeAlert(a._id)}
                      title="Marcar como revisado"
                    >
                      ✓
                    </button>
                  </li>
                ))
                : alertLog.slice(0, 5).map((entry, i) => (
                  <li key={i} className={`monitoring-feed__item monitoring-feed__item--${entry.status}`}>
                    <span className="monitoring-feed__dot" />
                    <div className="monitoring-feed__body">
                      <span className="monitoring-feed__patient">
                        {patientMeta[entry.patientId]?.name || `Paciente ${entry.patientId.slice(-6)}`}
                      </span>
                      <span className="monitoring-feed__msg">
                        {entry.status === 'critical' ? 'Lectura crítica' : 'Lectura fuera de rango'}
                        {entry.reading.heartRate != null && ` · FC ${entry.reading.heartRate} bpm`}
                        {entry.reading.oxygenSaturation != null && ` · SpO₂ ${entry.reading.oxygenSaturation}%`}
                      </span>
                    </div>
                    <span className="monitoring-feed__time">{entry.time}</span>
                  </li>
                ))
              }
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
