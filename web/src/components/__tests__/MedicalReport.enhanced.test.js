/**
 * Enhanced Tests for MedicalReport Component
 * Additional edge cases and coverage improvements
 *
 * El componente real no recibe props (no `reportId`), no hace fetch al
 * montar, y no tiene botones de exportar/imprimir/compartir — solo un
 * formulario con "Generar PDF" y "Ver historial" (ver MedicalReport.js).
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MedicalReport from '../MedicalReport';

jest.mock('axios');

describe('MedicalReport Enhanced Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  describe('Edge Cases', () => {
    it('should disable action buttons while a request is pending', async () => {
      axios.get.mockImplementation(() => new Promise(() => {})); // nunca resuelve

      render(<MedicalReport />);
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText(/patient-123/i), 'patient-1');
      await user.click(screen.getByRole('button', { name: /Ver historial/i }));

      expect(screen.getByRole('button', { name: /Ver historial/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Generar PDF/i })).toBeDisabled();
    });

    it('should render history rows with fallback text when optional fields are missing', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'report-3',
              title: 'Reporte sin firma',
              createdAt: '2024-01-15T00:00:00Z',
              sharedWith: [],
              signedBy: null,
            },
          ],
        },
      });

      render(<MedicalReport />);
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText(/patient-123/i), 'patient-3');
      await user.click(screen.getByRole('button', { name: /Ver historial/i }));

      await waitFor(() => {
        expect(screen.getByText('Reporte sin firma')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
        expect(screen.getByText('Pendiente')).toBeInTheDocument();
      });
    });

    it('should show an error message when history load fails', async () => {
      axios.get.mockRejectedValueOnce({
        response: { data: { message: 'Historial no encontrado' } },
      });

      render(<MedicalReport />);
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText(/patient-123/i), 'patient-404');
      await user.click(screen.getByRole('button', { name: /Ver historial/i }));

      await waitFor(() => {
        expect(screen.getByText(/Historial no encontrado/i)).toBeInTheDocument();
      });
    });

    it('should allow switching the report template', async () => {
      render(<MedicalReport />);
      const select = screen.getByRole('combobox');
      const user = userEvent.setup();

      expect(select).toHaveValue('clinical-summary');
      await user.selectOptions(select, 'treatment-plan');
      expect(select).toHaveValue('treatment-plan');
    });
  });
});
