/**
 * Accessibility Tests — Navbar Component
 *
 * Strategy:
 * - axe-core: WCAG 2.1 AA automated violations scan
 * - Landmark roles: nav, role="navigation", aria-label
 * - Active link: 'active' class on the matching route
 * - Icon semantics: aria-hidden on decorative icons
 * - Keyboard navigability: all links reachable via Tab
 * - Brand name presence for screen readers
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

expect.extend(toHaveNoViolations);

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../components/ThemeToggle', () =>
  function MockThemeToggle() {
    return <button data-testid="theme-toggle">T</button>;
  }
);
jest.mock('../../components/LanguageSelector', () =>
  function MockLanguageSelector() {
    return <select aria-label="Idioma" data-testid="language-selector" />;
  }
);

beforeEach(() => {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    user: { name: 'Dr. House', email: 'house@example.com', role: 'doctor' },
    logout: jest.fn(),
  });
});

const renderNavbar = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  );

// ─── WCAG 2.1 AA — axe automated scan ────────────────────────────────────────

describe('Navbar — WCAG 2.1 AA (axe-core)', () => {
  it('should have no accessibility violations on default route', async () => {
    const { container } = renderNavbar('/');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations on /dashboard route', async () => {
    const { container } = renderNavbar('/dashboard');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations on /analytics route', async () => {
    const { container } = renderNavbar('/analytics');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations on /heatmap route', async () => {
    const { container } = renderNavbar('/heatmap');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Landmark roles ───────────────────────────────────────────────────────────

describe('Navbar — Landmark Roles', () => {
  it('should render a nav element with role="navigation"', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should have an aria-label on the nav element', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label');
    expect(nav.getAttribute('aria-label').length).toBeGreaterThan(0);
  });

  it('should expose the brand name as visible text for screen readers', () => {
    renderNavbar();
    expect(screen.getByText('RespiCare')).toBeInTheDocument();
  });
});

// ─── Active link — visual + semantic marker ──────────────────────────────────

describe('Navbar — Active Link State', () => {
  it('should mark the chatbot (home) link as active on /', () => {
    renderNavbar('/');
    const homeLink = screen.getByText('Chatbot').closest('a');
    expect(homeLink).toHaveClass('active');
  });

  it('should NOT mark non-active links as active when on /', () => {
    renderNavbar('/');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveClass('active');
  });

  it('should mark the dashboard link as active on /dashboard', () => {
    renderNavbar('/dashboard');
    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveClass('active');
  });

  it('should mark the Analítica dropdown trigger as active on /analytics', () => {
    renderNavbar('/analytics');
    const analyticsBtn = screen.getByText('Analítica').closest('button');
    expect(analyticsBtn).toHaveClass('active');
  });

  it('should only mark one top-level link as active at a time', () => {
    renderNavbar('/analytics');
    const activeTopLevel = document.querySelectorAll('.navbar-menu > a.nav-link.active');
    expect(activeTopLevel.length).toBe(0); // /analytics belongs to the dropdown, not a top-level link
    const activeDropdown = document.querySelectorAll('.navbar-menu > div > button.active');
    expect(activeDropdown.length).toBe(1);
  });
});

// ─── Decorative icons — aria-hidden ──────────────────────────────────────────

describe('Navbar — Decorative Icon Semantics', () => {
  it('should hide nav icons from screen readers with aria-hidden', () => {
    renderNavbar();
    const navIcons = document.querySelectorAll('.nav-icon');
    navIcons.forEach((icon) => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('should hide brand icon from screen readers with aria-hidden', () => {
    renderNavbar();
    const brandIcon = document.querySelector('.brand-icon');
    expect(brandIcon).toHaveAttribute('aria-hidden', 'true');
  });
});

// ─── Navigation links — keyboard accessibility ───────────────────────────────

describe('Navbar — Links Are Keyboard Accessible', () => {
  it('should render all top-level nav links as anchor elements', () => {
    renderNavbar();
    const links = document.querySelectorAll('.navbar-menu > a.nav-link');
    expect(links.length).toBeGreaterThanOrEqual(2);
    links.forEach((link) => {
      expect(link.tagName.toLowerCase()).toBe('a');
    });
  });

  it('should have valid href attributes on all top-level nav links', () => {
    renderNavbar();
    const links = document.querySelectorAll('.navbar-menu > a.nav-link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toBeNull();
      expect(href.startsWith('/')).toBe(true);
    });
  });

  it('should render the Chatbot link pointing to /', () => {
    renderNavbar();
    const homeLink = screen.getByText('Chatbot').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render the Dashboard link pointing to /dashboard', () => {
    renderNavbar();
    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveAttribute('href', '/dashboard');
  });

  it('should render dropdown items with valid hrefs once opened', () => {
    renderNavbar();
    const analyticsBtn = screen.getByText('Analítica').closest('button');
    fireEvent.click(analyticsBtn);
    const analyticsLink = screen.getByText('Analítica Epidemiológica').closest('a');
    expect(analyticsLink).toHaveAttribute('href', '/analytics');
  });
});

// ─── Brand — screen reader presence ──────────────────────────────────────────

describe('Navbar — Brand Accessibility', () => {
  it('should render brand name visible to screen readers', () => {
    renderNavbar();
    const brandName = document.querySelector('.brand-name');
    expect(brandName).not.toBeNull();
    expect(brandName.textContent).toBeTruthy();
  });

  it('should render brand subtitle visible to screen readers', () => {
    renderNavbar();
    const brandSubtitle = document.querySelector('.brand-sub');
    expect(brandSubtitle).toBeInTheDocument();
  });
});

// ─── Link text — meaningful labels ───────────────────────────────────────────

describe('Navbar — Link Text Quality', () => {
  it('should provide meaningful text for all top-level navigation links', () => {
    renderNavbar();
    const links = document.querySelectorAll('.navbar-menu > a.nav-link');
    links.forEach((link) => {
      // Each link should have visible text (not just an icon)
      const spans = link.querySelectorAll('span:not([aria-hidden])');
      const hasText = Array.from(spans).some((s) => s.textContent.trim().length > 0);
      expect(hasText).toBe(true);
    });
  });
});
