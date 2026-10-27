import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../Home';
import { setLanguage } from '../../services/i18nService';
import { useAuth } from '../../contexts/AuthContext';

// Home.js usa ChatBotEnhanced, no ChatBot — mockear el componente equivocado
// deja que el real se monte (y haga llamadas de red reales en el test).
jest.mock('../../components/ChatBotEnhanced', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-chatbot">ChatBot embebido</div>,
}));

jest.mock('../../components/PatientQuickAccess', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-quick-access">Accesos rápidos</div>,
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const renderHome = () => render(<Home />, { wrapper: MemoryRouter });

describe('Home page', () => {
  beforeEach(() => {
    // jsdom resuelve navigator.language a 'en-US' por defecto; forzar 'es'
    // para que las traducciones sean deterministas.
    setLanguage('es');
    useAuth.mockReturnValue({ isAuthenticated: false, user: null });
  });

  it('muestra el banner de bienvenida y el chatbot', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: /Bienvenido a RespiCare/i })).toBeInTheDocument();
    expect(screen.getByText(/Sistema inteligente para la gestión/i)).toBeInTheDocument();
    // El alt de la imagen reutiliza la misma traducción que el título.
    expect(screen.getByAltText(/Bienvenido a RespiCare/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-chatbot')).toBeInTheDocument();
  });

  it('no muestra los accesos rápidos de salud si no hay sesión iniciada', () => {
    renderHome();

    expect(screen.queryByTestId('mock-quick-access')).not.toBeInTheDocument();
  });

  it('muestra los accesos rápidos de salud solo para pacientes autenticados', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'patient' } });

    renderHome();

    expect(screen.getByTestId('mock-quick-access')).toBeInTheDocument();
  });

  it('no muestra los accesos rápidos de salud para médicos o admins', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'doctor' } });

    renderHome();

    expect(screen.queryByTestId('mock-quick-access')).not.toBeInTheDocument();
  });
});

