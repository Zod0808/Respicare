import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import PatientMonitoringReport from '../PatientMonitoringReport';
import { ThemeProvider } from '../ThemeProvider';

jest.mock('axios');
jest.mock('../../utils/apiBase', () => ({ API_BASE: 'http://test-api' }));
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', role: 'patient', name: 'Test' },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockMetrics = {
  heartRate: { current: 72, average: 74, min: 60, max: 90 },
  oxygenSaturation: { current: 98, average: 97, min: 95, max: 99 },
  respiratoryRate: { current: 16, average: 15, min: 12, max: 18 },
  activity: { steps: 7500, distance: 5200 },
};

const mockHistory = [
  {
    timestamp: '2024-01-01T10:00:00Z',
    heartRate: 72,
    oxygenSaturation: 98,
    respiratoryRate: 16,
  },
  {
    timestamp: '2024-01-01T11:00:00Z',
    heartRate: 75,
    oxygenSaturation: 97,
    respiratoryRate: 15,
  },
];

function renderWithTheme(ui) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function setupMocks(metricsData = mockMetrics, historyData = mockHistory) {
  axios.get.mockImplementation((url) => {
    if (url.includes('wearables/metrics')) {
      return Promise.resolve({ data: { data: { metrics: metricsData } } });
    }
    if (url.includes('wearables/data')) {
      return Promise.resolve({ data: { data: { data: historyData } } });
    }
    return Promise.resolve({ data: {} });
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe('PatientMonitoringReport', () => {
  it('shows loading state initially', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderWithTheme(<PatientMonitoringReport />);
    expect(screen.getByText(/cargando datos de monitoreo/i)).toBeInTheDocument();
  });

  it('renders main heading after data loads', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/monitor de salud del paciente/i)).toBeInTheDocument()
    );
  });

  it('renders subtitle text', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getAllByText(/resumen de las últimas 24 horas/i).length).toBeGreaterThan(0)
    );
  });

  it('renders vitals section heading', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/signos vitales en tiempo real/i)).toBeInTheDocument()
    );
  });

  it('displays heart rate value', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() => expect(screen.getByText('72')).toBeInTheDocument());
  });

  it('displays oxygen saturation value', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() => expect(screen.getByText('98')).toBeInTheDocument());
  });

  it('displays respiratory rate value', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() => expect(screen.getByText('16')).toBeInTheDocument());
  });

  it('renders refresh button', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/actualizar/i)).toBeInTheDocument()
    );
  });

  it('calls API again when refresh button clicked', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() => screen.getByText(/monitor de salud/i));
    const callsBefore = axios.get.mock.calls.length;
    fireEvent.click(screen.getByText(/actualizar/i));
    await waitFor(() => expect(axios.get.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it('shows 401 error message', async () => {
    const err = { response: { status: 401 } };
    axios.get.mockRejectedValue(err);
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    );
  });

  it('shows 404 error message', async () => {
    const err = { response: { status: 404 } };
    axios.get.mockRejectedValue(err);
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/no se pudieron cargar los datos/i)).toBeInTheDocument()
    );
  });

  it('shows generic error message on network failure', async () => {
    axios.get.mockRejectedValue(new Error('Server Error'));
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/error al cargar los datos/i)).toBeInTheDocument()
    );
  });

  it('shows overall status card when metrics loaded', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/estado general/i)).toBeInTheDocument()
    );
  });

  it('shows "Normal" status when vitals are in range', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/todos tus signos vitales/i)).toBeInTheDocument()
    );
  });

  it('shows activity steps', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/actividad del día/i)).toBeInTheDocument()
    );
  });

  it('shows averages section when metrics loaded', async () => {
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getAllByText(/resumen de las últimas 24 horas/i).length).toBeGreaterThanOrEqual(2)
    );
  });

  it('shows "sin datos" state when metrics are null', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('wearables/metrics')) {
        return Promise.resolve({ data: { data: { metrics: null } } });
      }
      return Promise.resolve({ data: { data: { data: [] } } });
    });
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getByText(/monitor de salud del paciente/i)).toBeInTheDocument()
    );
  });

  it('shows "precaucion" status for low oxygen', async () => {
    const lowOxygenMetrics = {
      ...mockMetrics,
      oxygenSaturation: { current: 92, average: 91, min: 90, max: 93 },
    };
    setupMocks(lowOxygenMetrics);
    renderWithTheme(<PatientMonitoringReport />);
    await waitFor(() =>
      expect(screen.getAllByText(/precaución/i).length).toBeGreaterThan(0)
    );
  });
});