/**
 * Nombre de Objeto: RegisterPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-001 - Gestión de usuarios
 * Descripción: Página de registro. Valida la fortaleza de la contraseña en
 * cliente y crea la cuenta llamando a AuthContext.register() según el rol elegido.
 */
import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, RoleIcon } from './LoginPage';
import './LoginPage.css';

const ROLES = [
  { value: 'patient', label: 'Paciente',      desc: 'Gestión de citas e historial' },
  { value: 'doctor',  label: 'Médico',         desc: 'Monitoreo y reportes clínicos' },
  { value: 'admin',   label: 'Administrador',  desc: 'Control completo del sistema' },
];

const BENEFITS = [
  'Datos médicos cifrados y seguros',
  'Acceso desde cualquier dispositivo',
  'Seguimiento clínico personalizado',
  'Reportes e indicadores en tiempo real',
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Reglas de fortaleza de contraseña — se muestran como checklist en vivo
  // para que el usuario las vea ANTES de enviar, en vez de descubrirlas
  // una por una a través de errores sucesivos tras cada intento fallido.
  const pwdChecks = [
    { label: 'Al menos 8 caracteres', met: form.password.length >= 8 },
    { label: 'Una letra mayúscula', met: /[A-Z]/.test(form.password) },
    { label: 'Un número', met: /[0-9]/.test(form.password) },
    { label: 'Un carácter especial (!@#$%...)', met: /[^A-Za-z0-9]/.test(form.password) },
  ];

  if (!authLoading && isAuthenticated) {
    const dest = ['doctor', 'admin'].includes(user?.role) ? '/dashboard' : '/';
    return <Navigate to={dest} replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Valida fortaleza de contraseña en cliente y, si pasa, registra al usuario
  // llamando a AuthContext.register() con el rol seleccionado.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('La contraseña debe contener al menos una letra mayúscula.');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError('La contraseña debe contener al menos un número.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError('La contraseña debe contener al menos un carácter especial (ej: !@#$%).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const created = await register(form.name, form.email, form.password, form.role);
      const dest = ['doctor', 'admin'].includes(created?.role ?? form.role) ? '/dashboard' : '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Panel izquierdo — branding ── */}
      <aside className="login-brand" aria-hidden="true">
        <div className="login-brand__rings">
          <span className="login-brand__ring login-brand__ring--1" />
          <span className="login-brand__ring login-brand__ring--2" />
          <span className="login-brand__ring login-brand__ring--3" />
        </div>
        <div className="login-brand__inner">
          <span className="login-brand__eyebrow">Nuevo registro</span>
          <div className="login-brand__logo">
            <span className="login-brand__name">RespiCare</span>
          </div>
          <p className="login-brand__tagline">
            Únete a la plataforma clínica más completa para el manejo de enfermedades respiratorias.
          </p>
          <ol className="login-brand__list">
            {BENEFITS.map((text, i) => (
              <li
                key={i}
                className="login-brand__list-item"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <span className="login-brand__list-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="login-brand__list-text">{text}</span>
              </li>
            ))}
          </ol>
          <div className="login-brand__badge">
            Sistema certificado · Datos encriptados · HIPAA-ready
          </div>
        </div>
      </aside>

      {/* ── Panel derecho — formulario ── */}
      <section className="login-form-panel">
        <div className="login-form-card" style={{ maxWidth: 480 }}>
          <div className="login-form-header">
            <span className="login-form-eyebrow">Crea tu cuenta</span>
            <h1 className="login-form-title">Crear cuenta</h1>
            <p className="login-form-subtitle">Completa tus datos para registrarte en RespiCare</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert" aria-live="polite">
                <span className="login-error__icon" aria-hidden="true">!</span>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="login-field">
              <label htmlFor="reg-name">Nombre completo</label>
              <div className="login-input-wrap">
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Juan Pérez"
                  required
                  autoFocus
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="reg-email">Correo electrónico</label>
              <div className="login-input-wrap">
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="usuario@ejemplo.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Rol */}
            <div className="login-field">
              <label htmlFor="reg-role">Tipo de usuario</label>
              <div className="login-roles__grid" style={{ marginTop: 4 }}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`login-role-card${form.role === r.value ? ' is-selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  >
                    <RoleIcon role={r.value} />
                    <strong>{r.label}</strong>
                    <span>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contraseña */}
            <div className="login-field">
              <label htmlFor="reg-password">Contraseña</label>
              <div className="login-input-wrap">
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Crea una contraseña segura"
                  required
                  autoComplete="new-password"
                  aria-describedby="reg-password-hints"
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              <ul id="reg-password-hints" className="login-pwd-hints">
                {pwdChecks.map(({ label, met }) => (
                  <li key={label} className={met ? 'is-met' : ''}>
                    <span aria-hidden="true">{met ? '✓' : '○'}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirmar contraseña */}
            <div className="login-field">
              <label htmlFor="reg-confirm">Confirmar contraseña</label>
              <div className="login-input-wrap">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Repite tu contraseña"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <><span className="login-spinner" aria-hidden="true" />Registrando…</>
              ) : 'Crear Cuenta'}
            </button>
          </form>

          <p className="login-footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="login-link">Inicia sesión aquí</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
