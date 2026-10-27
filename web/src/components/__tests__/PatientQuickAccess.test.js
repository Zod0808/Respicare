import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import PatientQuickAccess from '../PatientQuickAccess';

jest.mock('axios');

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PatientQuickAccess />
    </MemoryRouter>
  );

const mockApi = ({ appointments = [], prescriptions = [], labResults = [] } = {}) => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/appointments/me/upcoming')) {
      return Promise.resolve({ data: { data: appointments } });
    }
    if (url.includes('/prescriptions')) {
      return Promise.resolve({ data: { data: prescriptions } });
    }
    if (url.includes('/lab/results')) {
      return Promise.resolve({ data: { data: labResults } });
    }
    return Promise.resolve({ data: { data: [] } });
  });
};

describe('PatientQuickAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra la próxima cita, la receta activa y el último resultado de laboratorio', async () => {
    mockApi({
      appointments: [
        { scheduledAt: '2026-11-10T15:00:00Z', reason: 'Control respiratorio' },
      ],
      prescriptions: [
        { status: 'active', medications: [{ name: 'Salbutamol' }], createdAt: '2026-10-01T00:00:00Z' },
      ],
      labResults: [
        { testName: 'Espirometría', status: 'normal', date: '2026-10-20T00:00:00Z' },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Control respiratorio/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Salbutamol')).toBeInTheDocument();
    expect(screen.getByText('Espirometría')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('muestra estados vacíos con un enlace de acción cuando no hay datos', async () => {
    mockApi();

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No tienes citas programadas/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/No tienes recetas activas/i)).toBeInTheDocument();
    expect(screen.getByText(/Aún no tienes resultados de laboratorio/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Agendar cita/i })).toHaveAttribute('href', '/appointments');
  });

  it('degrada con elegancia a estado vacío cuando una llamada falla', async () => {
    axios.get.mockRejectedValue(new Error('network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No tienes citas programadas/i)).toBeInTheDocument();
    });
  });

  it('abre el formulario de reporte de síntomas al hacer clic en el botón', async () => {
    mockApi();
    renderComponent();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Reportar síntomas/i }));

    expect(screen.getByRole('heading', { name: /Reportar Síntomas/i })).toBeInTheDocument();
  });
});
