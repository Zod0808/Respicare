/**
 * Enhanced Tests for ExecutiveDashboard Component
 * Additional edge cases and coverage improvements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import ExecutiveDashboard from '../ExecutiveDashboard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ExecutiveDashboard Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { data: {} }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty dashboard data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: null }
      });
      
      render(<ExecutiveDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/cargando|loading/i)).toBeInTheDocument();
      });
    });

    it('should display all KPI cards', async () => {
      // El componente consume response.data directamente (sin envoltorio
      // "data"), con la forma real summary/kpis/... (ver ExecutiveDashboard.js).
      const mockData = {
        summary: { patients: 100, doctors: 0, admins: 0, activeUsers: 0, openAlerts: 0, criticalAlerts: 0, openAppointments: 0 },
        kpis: { averageAcknowledgementMinutes: 0, appointmentCompletionRate: 0, aiConfidenceAverage: 0, criticalAlertRatio: 0, satisfactionScore: 0 },
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      render(<ExecutiveDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Pacientes')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should fall back to a message when there are no district trends', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { epidemiology: { districtTrends: [] } }
      });

      render(<ExecutiveDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/No se encontraron tendencias significativas/i)).toBeInTheDocument();
      });
    });

    it('should render the outbreak risk table when outbreaks are present', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          outbreaks: [{
            district: 'Pocollay',
            category: 'respiratory',
            recentTotal: 9,
            growthRate: 0.2,
            severityRate: 0.3,
            riskLevel: 'medium',
            confidence: 0.6,
          }]
        }
      });

      render(<ExecutiveDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Pocollay')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      });
    });

    it('should auto-refresh data on the configured interval when autoRefresh is true', async () => {
      jest.useFakeTimers();

      render(<ExecutiveDashboard autoRefresh refreshInterval={5000} />);

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(2));

      jest.useRealTimers();
    });

    it('should handle API errors gracefully', async () => {
      // err.message solo existe si se rechaza con un Error real; un objeto
      // plano sin .message cae al mensaje genérico de fallback del componente.
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      render(<ExecutiveDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument();
      });
    });
  });
});

