import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import Dashboard from '../Dashboard';
import { BACKEND_BASE_URL, AI_BASE_URL } from '../../utils/apiBase';

jest.mock('axios');
jest.mock('../../components/AlertConsole', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-alert-console" />,
}));
jest.mock('../../components/AppointmentCalendar', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-appointment-calendar" />,
}));

const buildHealthResponse = (overrides = {}) => ({
  data: {
    status: 'healthy',
    version: '1.0.0',
    uptime: 120,
    service: 'ai-service',
    ...overrides,
  },
});

describe('Dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra estados saludables cuando ambas APIs responden correctamente', async () => {
    axios.get
      .mockResolvedValueOnce(buildHealthResponse({ status: 'healthy', uptime: 256 }))
      .mockResolvedValueOnce(buildHealthResponse({ status: 'healthy', service: 'ml-core' }));

    render(<Dashboard />);

    expect(screen.getByText(/Verificando servicios/i)).toBeInTheDocument();

    await waitFor(() => {
      // "✅ Operativo" aparece en ambas tarjetas (Backend API y AI Services).
      expect(screen.getAllByText(/✅ Operativo/i)).toHaveLength(2);
    });

    expect(screen.getByTestId('mock-alert-console')).toBeInTheDocument();
    expect(screen.getByTestId('mock-appointment-calendar')).toBeInTheDocument();
    // CRA no carga .env.local en modo test, así que BACKEND_BASE_URL/AI_BASE_URL
    // resuelven al fallback real de apiBase.js, no a localhost. Ambas llamadas
    // además pasan un AbortSignal como segundo argumento.
    expect(axios.get).toHaveBeenCalledWith(`${BACKEND_BASE_URL}/health`, expect.anything());
    expect(axios.get).toHaveBeenCalledWith(`${AI_BASE_URL}/health`, expect.anything());
  });

  it('muestra mensaje de error y permite reintentar', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network down'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error al conectar con los servicios/i)).toBeInTheDocument();
    });

    axios.get
      .mockResolvedValueOnce(buildHealthResponse({ status: 'healthy', uptime: 64 }))
      .mockResolvedValueOnce(buildHealthResponse({ status: 'healthy', service: 'ml-core' }));

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Reintentar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Error al conectar/i)).not.toBeInTheDocument();
      expect(screen.getAllByText(/✅ Operativo/i)).toHaveLength(2);
    });
  });
});

