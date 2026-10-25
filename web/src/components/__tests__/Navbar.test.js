/**
 * Unit tests for Navbar Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../ThemeToggle', () =>
  function MockThemeToggle() {
    return <div data-testid="theme-toggle" />;
  }
);

jest.mock('../LanguageSelector', () =>
  function MockLanguageSelector() {
    return <div data-testid="language-selector" />;
  }
);

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

const mockUnauthenticated = () => {
  useAuth.mockReturnValue({
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
  });
};

const mockAs = (role, name = 'Jane Doe') => {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    user: { name, email: 'jane@example.com', role },
    logout: jest.fn(),
  });
};

describe('Navbar Component', () => {
  describe('Component Rendering (unauthenticated)', () => {
    beforeEach(mockUnauthenticated);

    it('should render the navbar', () => {
      renderWithRouter(<Navbar />);
      expect(screen.getByText('RespiCare')).toBeInTheDocument();
    });

    it('should display brand name and subtitle', () => {
      renderWithRouter(<Navbar />);
      expect(screen.getByText('RespiCare')).toBeInTheDocument();
      expect(screen.getByText('Sistema Respiratorio')).toBeInTheDocument();
    });

    it('should render the chatbot link available to everyone', () => {
      renderWithRouter(<Navbar />);
      const chatbotLink = screen.getByText('Chatbot').closest('a');
      expect(chatbotLink).toHaveAttribute('href', '/');
    });

    it('should show a login link when not authenticated', () => {
      renderWithRouter(<Navbar />);
      const loginLink = screen.getByText('Iniciar sesión').closest('a');
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should not render role-based dropdowns when not authenticated', () => {
      renderWithRouter(<Navbar />);
      expect(screen.queryByText('Mi Salud')).not.toBeInTheDocument();
      expect(screen.queryByText('Analítica')).not.toBeInTheDocument();
      expect(screen.queryByText('Clínica')).not.toBeInTheDocument();
    });
  });

  describe('Role-based navigation', () => {
    it('should render patient-only "Mi Salud" dropdown for patients', () => {
      mockAs('patient');
      renderWithRouter(<Navbar />);
      expect(screen.getByText('Mi Salud')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should render staff links (Dashboard, Monitoreo, Analítica, Clínica) for doctors', () => {
      mockAs('doctor');
      renderWithRouter(<Navbar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Monitoreo')).toBeInTheDocument();
      expect(screen.getByText('Analítica')).toBeInTheDocument();
      expect(screen.getByText('Clínica')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should additionally render the Admin link for admins', () => {
      mockAs('admin');
      renderWithRouter(<Navbar />);
      expect(screen.getByText('Admin').closest('a')).toHaveAttribute('href', '/admin');
    });
  });

  describe('User menu', () => {
    beforeEach(() => mockAs('doctor', 'Dr. House'));

    it('should show the user first name and role badge', () => {
      renderWithRouter(<Navbar />);
      expect(screen.getByText('Dr.')).toBeInTheDocument();
      expect(screen.getByText('Médico')).toBeInTheDocument();
    });

    it('should open the user menu on click and expose logout', () => {
      renderWithRouter(<Navbar />);
      const userBtn = screen.getByLabelText('Menú de usuario');
      fireEvent.click(userBtn);
      expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(mockUnauthenticated);

    it('should have proper navigation role and label', () => {
      renderWithRouter(<Navbar />);
      const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible link names', () => {
      renderWithRouter(<Navbar />);
      const brandLink = screen.getByRole('link', { name: /RespiCare — Inicio/i });
      expect(brandLink).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderWithRouter(<Navbar />);
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
