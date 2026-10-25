/**
 * Visual Regression Tests — Navbar Component
 *
 * Strategy: DOM snapshot + CSS class assertions + ARIA attributes
 * Detects structural and semantic visual regressions without external VRT tools.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../components/ThemeToggle', () =>
  function MockThemeToggle() {
    return <button data-testid="theme-toggle" className="navbar-theme-toggle">T</button>;
  }
);
jest.mock('../../components/LanguageSelector', () =>
  function MockLanguageSelector() {
    return <select data-testid="language-selector" className="navbar-language-selector" />;
  }
);

// Wrap with router since Navbar uses Link and useLocation
const renderNavbar = (initialRoute = '/') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>
  );

beforeEach(() => {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    user: { name: 'Dr. House', email: 'house@example.com', role: 'doctor' },
    logout: jest.fn(),
  });
});

// ─── DOM Snapshot — captura la estructura HTML completa ──────────────────────

describe('Navbar — Snapshot Visual Regression', () => {
  it('matches DOM snapshot on default route (/)', () => {
    const { asFragment } = renderNavbar('/');
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot on /dashboard route', () => {
    const { asFragment } = renderNavbar('/dashboard');
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot on /analytics route', () => {
    const { asFragment } = renderNavbar('/analytics');
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot on /heatmap route', () => {
    const { asFragment } = renderNavbar('/heatmap');
    expect(asFragment()).toMatchSnapshot();
  });
});

// ─── Estructura visual — elementos clave siempre presentes ───────────────────

describe('Navbar — Estructura Visual', () => {
  beforeEach(() => renderNavbar('/'));

  it('should render the brand section with icon, name and subtitle', () => {
    expect(screen.getByText('RespiCare')).toBeInTheDocument();
    expect(screen.getByText('Sistema Respiratorio')).toBeInTheDocument();
    expect(document.querySelector('.brand-icon')).toBeInTheDocument();
    expect(document.querySelector('.brand-name')).toBeInTheDocument();
    expect(document.querySelector('.brand-sub')).toBeInTheDocument();
  });

  it('should render navigation links for an authenticated staff user', () => {
    // Chatbot + Dashboard + Monitoreo + Analítica dropdown + Clínica dropdown
    const navLinks = document.querySelectorAll('.navbar-menu .nav-link');
    expect(navLinks.length).toBeGreaterThanOrEqual(4);
  });

  it('should render nav with correct role and aria-label', () => {
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Navegación principal');
    expect(nav).toHaveClass('navbar');
  });

  it('should render navbar-container as structural wrapper', () => {
    expect(document.querySelector('.navbar-container')).toBeInTheDocument();
    expect(document.querySelector('.navbar-menu')).toBeInTheDocument();
  });
});

// ─── Estado activo — ruta activa recibe clase 'active' ───────────────────────

describe('Navbar — Estado de Enlace Activo', () => {
  it('should mark chatbot (home) link as active when on / route', () => {
    renderNavbar('/');
    const homeLink = screen.getByText('Chatbot').closest('a');
    expect(homeLink).toHaveClass('active');
  });

  it('should mark dashboard link as active when on /dashboard route', () => {
    renderNavbar('/dashboard');
    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveClass('active');
  });

  it('should mark the Analítica dropdown trigger as active when on /analytics route', () => {
    renderNavbar('/analytics');
    const analyticsBtn = screen.getByText('Analítica').closest('button');
    expect(analyticsBtn).toHaveClass('active');
  });

  it('should NOT mark other links as active when one is active', () => {
    renderNavbar('/dashboard');
    const homeLink = screen.getByText('Chatbot').closest('a');
    expect(homeLink).not.toHaveClass('active');
  });
});

// ─── Atributos ARIA — accesibilidad visual ───────────────────────────────────

describe('Navbar — Atributos ARIA y Accesibilidad Visual', () => {
  it('should have aria-hidden on all nav icon spans', () => {
    renderNavbar('/');
    const iconSpans = document.querySelectorAll('.nav-icon');
    iconSpans.forEach((span) => {
      expect(span).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('should have aria-hidden on brand icon', () => {
    renderNavbar('/');
    const brandIcon = document.querySelector('.brand-icon');
    expect(brandIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have correct href attributes on top-level nav links', () => {
    renderNavbar('/');
    const mainHrefs = ['/', '/dashboard', '/monitoring'];
    const links = document.querySelectorAll('.navbar-menu > a.nav-link');
    const actualHrefs = Array.from(links).map((l) => l.getAttribute('href'));
    mainHrefs.forEach((href) => expect(actualHrefs).toContain(href));
  });
});

// ─── CSS classes — clases CSS aplicadas correctamente ───────────────────────

describe('Navbar — CSS Classes Visual', () => {
  it('should apply navbar class to root nav element', () => {
    renderNavbar('/');
    expect(document.querySelector('nav')).toHaveClass('navbar');
  });

  it('should apply nav-link class to top-level links', () => {
    renderNavbar('/');
    const links = document.querySelectorAll('.navbar-menu a.nav-link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('should only have ONE active top-level link at a time', () => {
    renderNavbar('/dashboard');
    const activeLinks = document.querySelectorAll('.navbar-menu > a.nav-link.active');
    expect(activeLinks).toHaveLength(1);
  });

  it('should render ThemeToggle and LanguageSelector inside navbar-controls', () => {
    renderNavbar('/');
    const controls = document.querySelector('.navbar-controls');
    expect(controls).toBeInTheDocument();
    expect(controls.querySelector('[data-testid="theme-toggle"]')).toBeInTheDocument();
    expect(controls.querySelector('[data-testid="language-selector"]')).toBeInTheDocument();
  });
});
