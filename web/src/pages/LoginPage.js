/**
 * Nombre de Objeto: LoginPage
 * Fecha de Creación: 2026-05-04
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-001 - Gestión de usuarios
 * Descripción: Página de inicio de sesión. Autentica al usuario contra
 * AuthContext y redirige según su rol (paciente, doctor o admin).
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const FEATURES = [
  'Seguimiento respiratorio personalizado',
  'Reportes clínicos en tiempo real',
  'Monitoreo de pacientes por wearable',
  'Datos protegidos con cifrado médico',
];

// Alterna entre ojo abierto (mostrar) y ojo tachado (ocultar) para el toggle de contraseña.
export const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
    {open && <line x1="3" y1="21" x2="21" y2="3" />}
  </svg>
);

// Identifica visualmente cada tipo de usuario en las tarjetas de rol
// (paciente / médico / admin) de Login y Register.
const ROLE_ICON_PATHS = {
  patient: (
    <>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M4.5 20c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </>
  ),
  doctor: (
    <>
      <path d="M7 3v5a3.5 3.5 0 0 0 7 0V3" />
      <path d="M10.5 10.5v2.5a5 5 0 0 0 10 0v-2" />
      <circle cx="20.5" cy="12.3" r="1.5" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3l7 3.1v4.9c0 5-3.4 8-7 9.9-3.6-1.9-7-4.9-7-9.9V6.1L12 3Z" />
      <path d="M9 12.2l2.1 2.1L15.5 10" />
    </>
  ),
};

export const RoleIcon = ({ role }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="role-icon"
  >
    {ROLE_ICON_PATHS[role]}
  </svg>
);

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Si ya está autenticado, redirigir según rol
  if (!authLoading && isAuthenticated) {
    const dest = ['doctor', 'admin'].includes(user?.role) ? '/dashboard' : '/';
    return <Navigate to={dest} replace />;
  }

  // Envía las credenciales a AuthContext.login() y redirige según el rol
  // devuelto (o a la ruta de origen si el usuario venía de una ruta protegida).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      const from = location.state?.from?.pathname;
      // Redirigir según rol
      const dest = from && from !== '/login'
        ? from
        : ['doctor', 'admin'].includes(loggedUser?.role) ? '/dashboard' : '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Intenta de nuevo.');
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
          <span className="login-brand__eyebrow">Plataforma clínica</span>
          <div className="login-brand__logo">
            <span className="login-brand__name">RespiCare</span>
          </div>
          <p className="login-brand__tagline">
            Cada respiración cuenta. Te acompañamos en el manejo de tu salud respiratoria.
          </p>
          <ol className="login-brand__list">
            {FEATURES.map((text, i) => (
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
        <div className="login-form-card">
          <div className="login-form-header">
            <span className="login-form-eyebrow">Acceso pacientes</span>
            <h1 className="login-form-title">Bienvenido</h1>
            <p className="login-form-subtitle">Ingresa tus credenciales para continuar tu seguimiento</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert" aria-live="polite">
                <span className="login-error__icon" aria-hidden="true">!</span>
                {error}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email">Correo electrónico</label>
              <div className="login-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <><span className="login-spinner" aria-hidden="true" />Verificando…</>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-roles">
            <p className="login-roles__label">Acceso por tipo de usuario</p>
            <div className="login-roles__grid">
              <div className="login-role-card">
                <RoleIcon role="patient" />
                <strong>Paciente</strong>
                <span>Chatbot, historial y citas</span>
              </div>
              <div className="login-role-card">
                <RoleIcon role="doctor" />
                <strong>Médico</strong>
                <span>Reportes, monitoreo y analítica</span>
              </div>
              <div className="login-role-card">
                <RoleIcon role="admin" />
                <strong>Admin</strong>
                <span>Gestión completa del sistema</span>
              </div>
            </div>
          </div>

          <p className="login-footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="login-link">Regístrate aquí</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
