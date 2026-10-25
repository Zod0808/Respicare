import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Analytics from '../Analytics';

jest.mock('../../components/PatientMonitoringReport', () => ({
  __esModule: true,
  default: () => <div data-testid="patient-monitoring">Monitoreo Paciente</div>,
}));

jest.mock('../../components/AutomaticReportsDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="automatic-reports">Reportes Automáticos</div>,
}));

jest.mock('../../components/AnalyticsDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="analytics-dashboard">Dashboard Análisis</div>,
}));

jest.mock('../../components/TemporalTrends', () => ({
  __esModule: true,
  default: () => <div data-testid="temporal-trends">Tendencias</div>,
}));

jest.mock('../../components/DiseaseReports', () => ({
  __esModule: true,
  default: () => <div data-testid="disease-reports">Enfermedades</div>,
}));

jest.mock('../../components/ShapDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="shap-dashboard">Explicabilidad</div>,
}));

describe('Analytics page', () => {
  it('renders main heading', () => {
    render(<Analytics />);
    expect(screen.getByRole('heading', { name: /Centro de Análisis/i })).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    render(<Analytics />);
    expect(screen.getByText(/Estadísticas epidemiológicas/i)).toBeInTheDocument();
  });

  it('shows default dashboard tab content after load', async () => {
    // La pestaña activa por defecto es 'dashboard', no 'monitoring'.
    render(<Analytics />);
    await waitFor(() =>
      expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument()
    );
  });

  it('switches to Monitoreo tab on click', async () => {
    render(<Analytics />);
    await waitFor(() => screen.getByTestId('analytics-dashboard'));
    fireEvent.click(screen.getByText(/Monitoreo Wearables/i));
    await waitFor(() =>
      expect(screen.getByTestId('patient-monitoring')).toBeInTheDocument()
    );
  });

  it('switches to Tendencias tab on click', async () => {
    render(<Analytics />);
    await waitFor(() => screen.getByTestId('analytics-dashboard'));
    fireEvent.click(screen.getByText(/Tendencias Temporales/i));
    await waitFor(() =>
      expect(screen.getByTestId('temporal-trends')).toBeInTheDocument()
    );
  });

  it('switches to Enfermedades tab on click', async () => {
    render(<Analytics />);
    await waitFor(() => screen.getByTestId('analytics-dashboard'));
    fireEvent.click(screen.getByText(/🦠 Enfermedades/i));
    await waitFor(() =>
      expect(screen.getByTestId('disease-reports')).toBeInTheDocument()
    );
  });

  it('renders tab buttons for all tabs', () => {
    render(<Analytics />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });
});