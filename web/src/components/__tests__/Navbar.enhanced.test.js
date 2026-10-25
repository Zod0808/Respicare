/**
 * Enhanced Tests for Navbar Component
 * Additional edge cases and coverage improvements
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

jest.mock('../LanguageSelector', () => {
  return function MockLanguageSelector() {
    return <div data-testid="language-selector">Language Selector</div>;
  };
});

const renderWithRouter = (component, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('Navbar Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Dr. House', email: 'house@example.com', role: 'doctor' },
      logout: jest.fn(),
    });
  });

  describe('Edge Cases', () => {
    it('should highlight the active top-level link correctly', () => {
      renderWithRouter(<Navbar />, ['/dashboard']);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('active');
    });

    it('should not mark inactive links as active', () => {
      renderWithRouter(<Navbar />, ['/dashboard']);

      const chatbotLink = screen.getByText('Chatbot').closest('a');
      expect(chatbotLink).not.toHaveClass('active');
    });

    it('should mark a dropdown button active when one of its links matches the route', () => {
      renderWithRouter(<Navbar />, ['/analytics']);

      const analyticsBtn = screen.getByText('Analítica').closest('button');
      expect(analyticsBtn).toHaveClass('active');
    });

    it('should render brand information', () => {
      renderWithRouter(<Navbar />);

      expect(screen.getByText('RespiCare')).toBeInTheDocument();
    });

    it('should close the role dropdown after selecting a link inside it', () => {
      renderWithRouter(<Navbar />);

      const analyticsBtn = screen.getByText('Analítica').closest('button');
      fireEvent.click(analyticsBtn);
      const heatmapLink = screen.getByText('Mapa de Calor').closest('a');

      fireEvent.click(heatmapLink);

      expect(screen.queryByText('Mapa de Calor')).not.toBeInTheDocument();
    });

    it('should close the user menu when the route changes', () => {
      renderWithRouter(<Navbar />, ['/']);

      fireEvent.click(screen.getByLabelText('Menú de usuario'));
      expect(screen.getByRole('menuitem', { name: /cerrar sesión/i })).toBeInTheDocument();

      fireEvent.click(screen.getByText('Dashboard').closest('a'));

      expect(screen.queryByRole('menuitem', { name: /cerrar sesión/i })).not.toBeInTheDocument();
    });

    it('should handle rapid navigation across routes without crashing', () => {
      const { rerender } = renderWithRouter(<Navbar />, ['/']);

      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Navbar />
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter initialEntries={['/analytics']}>
          <Navbar />
        </MemoryRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should expose navigation landmark with a Spanish label', () => {
      renderWithRouter(<Navbar />);

      expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
    });

    it('should set aria-expanded on dropdown triggers when opened', () => {
      renderWithRouter(<Navbar />);

      const analyticsBtn = screen.getByText('Analítica').closest('button');
      expect(analyticsBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(analyticsBtn);
      expect(analyticsBtn).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
