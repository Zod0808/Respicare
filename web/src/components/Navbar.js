/**
 * Nombre de Objeto: Navbar
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - componente estructural de la interfaz web
 * Descripción: Navbar. Parte de: componente estructural de la interfaz web.
 */

import React, { memo, useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

/* ── Nav link definitions by role ──────────────────────────────────────────── */

// Rutas accesibles para pacientes
const PATIENT_HEALTH_LINKS = [
  { to: '/medical-history', label: 'Mi Historial',    icon: '📋' },
  { to: '/appointments',    label: 'Mis Citas',        icon: '📅' },
  { to: '/prescriptions',   label: 'Mis Recetas',      icon: '💊' },
  { to: '/lab-results',     label: 'Resultados de Lab',icon: '🔬' },
  { to: '/consents',        label: 'Consentimientos',  icon: '📝' },
  { to: '/educational-content', label: 'Educación',    icon: '📚' },
];

// Dashboard + analítica para médico/admin
const STAFF_ANALYTICS_LINKS = [
  { to: '/analytics', label: 'Analítica Epidemiológica', icon: '📊' },
  { to: '/heatmap',   label: 'Mapa de Calor',            icon: '🗺️' },
  { to: '/fhir',      label: 'Recursos FHIR',            icon: '📋' },
  { to: '/hl7',       label: 'Mensajería HL7',           icon: '🔬' },
];

// Gestión clínica de pacientes (médico/admin)
const STAFF_CLINICAL_LINKS = [
  { to: '/medical-history', label: 'Historiales',     icon: '📋' },
  { to: '/appointments',    label: 'Citas',            icon: '📅' },
  { to: '/prescriptions',   label: 'Recetas',          icon: '💊' },
  { to: '/lab-results',     label: 'Resultados Lab',   icon: '🔬' },
  { to: '/alerts',          label: 'Alertas Clínicas', icon: '🔔' },
  { to: '/referrals',       label: 'Derivaciones',     icon: '🔗' },
  { to: '/emergency',       label: 'Emergencias',      icon: '🚨' },
  { to: '/consents',        label: 'Consentimientos',  icon: '📝' },
  { to: '/educational-content', label: 'Educación',    icon: '📚' },
];

/* ── Dropdown component ─────────────────────────────────────────────────────── */
function NavDropdown({ label, icon, links, activePathname }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const isActive = links.some(l => l.to === activePathname);

  useEffect(() => {
    // El menú vive en un portal fuera de .nav-dropdown (ver más abajo), así
    // que un mousedown nativo dentro de él no hace bubbling hasta `ref` y
    // hay que comprobarlo aparte para no cerrarlo al clickear sus opciones.
    const handler = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [activePathname]);

  // El menú se renderiza con position:fixed y coordenadas calculadas aquí
  // (en vez de depender del position:absolute relativo a .nav-dropdown)
  // porque .navbar-menu tiene overflow-x:auto, y eso fuerza a los
  // navegadores a computar overflow-y como auto también, recortando
  // cualquier hijo absolute que se salga de esa fila. position:fixed
  // escapa de ese recorte. En móvil (<=768px) el CSS lo ancla fijo
  // abajo-centrado, así que ahí no hace falta posición calculada.
  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (!btnRef.current) return;
      if (window.innerWidth > 768) {
        const rect = btnRef.current.getBoundingClientRect();
        setMenuStyle({ top: rect.bottom + 8, left: rect.left });
      } else {
        setMenuStyle(null);
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        ref={btnRef}
        className={`nav-link nav-dropdown-btn ${isActive ? 'active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="nav-icon" aria-hidden="true">{icon}</span>
        <span>{label}</span>
        <span className={`nav-chevron ${open ? 'nav-chevron--open' : ''}`} aria-hidden="true">›</span>
      </button>
      {open && createPortal(
        // Portal a document.body: .navbar es position:sticky + z-index:1000,
        // lo que crea su propio stacking context y atrapa dentro a este menú
        // (aunque sea position:fixed con z-index más alto). Dentro de ese
        // contexto gana cualquier z-index, pero frente a OTRO stacking
        // context hermano del navbar (p.ej. un header de página con su
        // propio z-index) siempre pierde por quedar anidado. Sacarlo del
        // árbol del navbar con un portal lo compara en la raíz, donde sí gana.
        <div ref={menuRef} className="nav-dropdown-menu" role="menu" style={menuStyle || undefined}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-dropdown-item ${activePathname === l.to ? 'active' : ''}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="nav-dropdown-item-icon" aria-hidden="true">{l.icon}</span>
              <span>{l.label}</span>
              {activePathname === l.to && <span className="nav-dropdown-active-dot" aria-hidden="true" />}
            </Link>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const path = location.pathname;

  const isStaff  = ['doctor', 'admin'].includes(user?.role);
  const isAdmin  = user?.role === 'admin';
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setUserOpen(false); }, [path]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const userInitial  = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const roleLabel    = { patient: 'Paciente', doctor: 'Médico', admin: 'Administrador' }[user?.role] || user?.role || '';
  const roleBadgeClass = { patient: 'role--patient', doctor: 'role--doctor', admin: 'role--admin' }[user?.role] || '';

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-container">

        {/* ── Brand ── */}
        <Link to="/" className="navbar-brand" aria-label="RespiCare — Inicio">
          <span className="brand-icon" aria-hidden="true">🫁</span>
          <div className="brand-text">
            <span className="brand-name">RespiCare</span>
            <span className="brand-sub">Sistema Respiratorio</span>
          </div>
        </Link>

        {/* ── Navigation by role ── */}
        <div className="navbar-menu">

          {/* Inicio (chatbot) — todos */}
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden="true">💬</span>
            <span>Chatbot</span>
          </Link>

          {/* ── PACIENTE ── */}
          {isAuthenticated && isPatient && (
            <NavDropdown
              label="Mi Salud"
              icon="❤️"
              links={PATIENT_HEALTH_LINKS}
              activePathname={path}
            />
          )}

          {/* ── MÉDICO / ADMIN ── */}
          {isAuthenticated && isStaff && (
            <>
              <Link to="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>
                <span className="nav-icon" aria-hidden="true">⚙️</span>
                <span>Dashboard</span>
              </Link>

              <Link to="/monitoring" className={`nav-link nav-link--highlight ${path === '/monitoring' ? 'active' : ''}`}>
                <span className="nav-icon" aria-hidden="true">🩺</span>
                <span>Monitoreo</span>
                <span className="nav-live-dot" aria-hidden="true" title="Tiempo real" />
              </Link>

              <NavDropdown
                label="Analítica"
                icon="📊"
                links={STAFF_ANALYTICS_LINKS}
                activePathname={path}
              />

              <NavDropdown
                label="Clínica"
                icon="🏥"
                links={STAFF_CLINICAL_LINKS}
                activePathname={path}
              />

              {isAdmin && (
                <Link to="/admin" className={`nav-link nav-link--admin ${path === '/admin' ? 'active' : ''}`}>
                  <span className="nav-icon" aria-hidden="true">🛡️</span>
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* ── Right controls ── */}
        <div className="navbar-controls">
          {/* Cambio de idioma: solo paciente (o visitante anónimo antes de
              autenticarse). Médico/admin trabajan en un idioma fijo para
              mantener consistencia en la terminología clínica. */}
          {(!isAuthenticated || isPatient) && (
            <LanguageSelector className="navbar-lang" />
          )}
          <ThemeToggle className="navbar-theme" />

          {isAuthenticated ? (
            <div className="nav-user" ref={userRef}>
              <button
                className="nav-user-btn"
                onClick={() => setUserOpen(v => !v)}
                aria-expanded={userOpen}
                aria-haspopup="true"
                aria-label="Menú de usuario"
              >
                <span className="nav-user-avatar" aria-hidden="true">{userInitial}</span>
                <div className="nav-user-info-mini">
                  <span className="nav-user-name">{user?.name?.split(' ')[0] || 'Usuario'}</span>
                  <span className={`nav-user-role-badge ${roleBadgeClass}`}>{roleLabel}</span>
                </div>
                <span className={`nav-chevron ${userOpen ? 'nav-chevron--open' : ''}`} aria-hidden="true">›</span>
              </button>

              {userOpen && (
                <div className="nav-user-menu" role="menu" aria-label="Opciones de usuario">
                  <div className="nav-user-menu-header" role="none">
                    <div className="nav-user-avatar-lg" aria-hidden="true">{userInitial}</div>
                    <div>
                      <p className="nav-user-fullname">{user?.name}</p>
                      <p className="nav-user-email">{user?.email}</p>
                      <span className={`nav-user-role-badge ${roleBadgeClass}`}>{roleLabel}</span>
                    </div>
                  </div>
                  <div className="nav-user-divider" role="separator" />
                  <button
                    className="nav-logout-btn"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span aria-hidden="true">🚪</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link nav-link--cta">
              <span className="nav-icon" aria-hidden="true">🔑</span>
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);
