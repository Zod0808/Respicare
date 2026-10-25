/**
 * Enhanced Tests for AppointmentCalendar Component
 * Additional edge cases and coverage improvements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AppointmentCalendar from '../AppointmentCalendar';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('AppointmentCalendar Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: { data: [] }
    });
    mockedAxios.post.mockResolvedValue({
      data: { success: true }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty appointments list', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [] }
      });
      
      render(<AppointmentCalendar />);
      
      await waitFor(() => {
        expect(screen.getByText(/no hay citas|no appointments/i)).toBeInTheDocument();
      });
    });

    it('should handle date selection', () => {
      render(<AppointmentCalendar />);
      
      const dateInput = screen.getByLabelText(/fecha|date/i);
      if (dateInput) {
        fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
        expect(dateInput.value).toBe('2024-01-15');
      }
    });

    it('should render appointment rows with patient, doctor and status from the API', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [{
            _id: '1',
            scheduledAt: '2024-01-15T10:00:00Z',
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            status: 'scheduled',
            reason: 'Chequeo',
          }]
        }
      });

      render(<AppointmentCalendar />);

      await waitFor(() => {
        expect(screen.getByText('patient-1')).toBeInTheDocument();
        expect(screen.getByText('doctor-1')).toBeInTheDocument();
        expect(screen.getByText('scheduled')).toHaveClass('status-scheduled');
      });
    });

    it('should show a dash when an appointment has no reason', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [{
            _id: '1',
            scheduledAt: '2024-01-15T10:00:00Z',
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            status: 'scheduled',
          }]
        }
      });

      render(<AppointmentCalendar />);

      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('should re-fetch appointments when clicking Refrescar citas', async () => {
      render(<AppointmentCalendar />);

      // Esperar a que termine la carga inicial (botón deja de estar disabled={loading})
      await waitFor(() => expect(screen.getByText(/Citas cargadas correctamente/i)).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: /Refrescar citas/i }));

      await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(2));
    });

    it('should include patientId filter in the appointments request', async () => {
      render(<AppointmentCalendar />);

      const patientInput = screen.getByPlaceholderText(/patient-456/i);
      fireEvent.change(patientInput, { target: { value: 'patient-9' } });
      fireEvent.click(screen.getByRole('button', { name: /Refrescar citas/i }));

      await waitFor(() => {
        const lastCall = mockedAxios.get.mock.calls[mockedAxios.get.mock.calls.length - 1];
        expect(lastCall[0]).toContain('patientId=patient-9');
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { message: 'API Error' } }
      });
      
      render(<AppointmentCalendar />);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});

