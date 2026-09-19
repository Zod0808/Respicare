/**
 * Enhanced Tests for TemporalTrends Component
 * Additional edge cases and coverage improvements
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import TemporalTrends from '../TemporalTrends';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

const buildDailyTrendsResponse = (dailyTrends = [], overrides = {}) => ({
  data: {
    success: true,
    data: {
      dailyTrends,
      weeklyTrends: [],
      topSymptoms: [],
      ...overrides,
    },
  },
});

describe('TemporalTrends Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue(buildDailyTrendsResponse());
  });

  describe('Edge Cases', () => {
    it('should handle empty trends data', async () => {
      mockedAxios.get.mockResolvedValueOnce(buildDailyTrendsResponse([]));

      render(<TemporalTrends />);

      await waitFor(() => {
        expect(screen.getByText(/Tendencias Temporales/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.getAllByText('0', { selector: '.stat-value' })).toHaveLength(3);
    });

    it('should display trends with data', async () => {
      const dailyTrends = [
        { _id: '2024-01-01', total: 10, data: [{ severity: 'mild', count: 10 }] },
        { _id: '2024-01-02', total: 15, data: [{ severity: 'moderate', count: 15 }] },
        { _id: '2024-01-03', total: 12, data: [{ severity: 'severe', count: 12 }] },
      ];

      mockedAxios.get.mockResolvedValueOnce(buildDailyTrendsResponse(dailyTrends));

      render(<TemporalTrends />);

      await waitFor(() => {
        expect(screen.getByText(/Tendencias Temporales/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/12 reportes/i)).toBeInTheDocument();
    });

    it('should refetch when the period selection changes', async () => {
      render(<TemporalTrends />);

      await waitFor(() => {
        expect(screen.getByText(/Tendencias Diarias/i)).toBeInTheDocument();
      });

      mockedAxios.get.mockClear();
      const user = userEvent.setup();
      const [periodSelect] = screen.getAllByRole('combobox');
      await user.selectOptions(periodSelect, '7d');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ params: expect.objectContaining({ period: '7d' }) })
        );
      });
    });

    it('should refetch when the district selection changes', async () => {
      render(<TemporalTrends />);

      await waitFor(() => {
        expect(screen.getByText(/Tendencias Diarias/i)).toBeInTheDocument();
      });

      mockedAxios.get.mockClear();
      const user = userEvent.setup();
      const [, districtSelect] = screen.getAllByRole('combobox');
      await user.selectOptions(districtSelect, 'Pocollay');

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ params: expect.objectContaining({ district: 'Pocollay' }) })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { message: 'API Error' } }
      });

      render(<TemporalTrends />);

      await waitFor(() => {
        expect(
          screen.getByText(/no se pudieron cargar los datos de tendencias/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle very large datasets', async () => {
      const largeDailyTrends = Array.from({ length: 1000 }, (_, i) => ({
        _id: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        total: i + 1,
        data: [{ severity: 'mild', count: i + 1 }],
      }));

      mockedAxios.get.mockResolvedValueOnce(buildDailyTrendsResponse(largeDailyTrends));

      render(<TemporalTrends />);

      await waitFor(() => {
        // Should handle large dataset without crashing; only the first 7 days render.
        expect(screen.getByText(/Tendencias Temporales/i)).toBeInTheDocument();
        expect(screen.getByText('1000', { selector: '.stat-value' })).toBeInTheDocument();
      });
    });
  });
});
