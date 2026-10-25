import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';
import { setLanguage } from '../../services/i18nService';

// Home.js usa ChatBotEnhanced, no ChatBot — mockear el componente equivocado
// deja que el real se monte (y haga llamadas de red reales en el test).
jest.mock('../../components/ChatBotEnhanced', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-chatbot">ChatBot embebido</div>,
}));

describe('Home page', () => {
  beforeEach(() => {
    // jsdom resuelve navigator.language a 'en-US' por defecto; forzar 'es'
    // para que las traducciones sean deterministas.
    setLanguage('es');
  });

  it('muestra el banner de bienvenida y el chatbot', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Bienvenido a RespiCare/i })).toBeInTheDocument();
    expect(screen.getByText(/Sistema inteligente para la gestión/i)).toBeInTheDocument();
    // El alt de la imagen reutiliza la misma traducción que el título.
    expect(screen.getByAltText(/Bienvenido a RespiCare/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-chatbot')).toBeInTheDocument();
  });
});

