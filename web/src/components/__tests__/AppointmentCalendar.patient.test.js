import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import AppointmentCalendar from '../AppointmentCalendar';

jest.mock('axios');

let mockAuthUser = { _id: 'pat-1', name: 'Paciente Uno', role: 'patient' };
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

const mockDoctors = [
  { _id: 'doc-1', name: 'Dra. Ana Rojas' },
  { _id: 'doc-2', name: 'Dr. Luis Paredes' },
];

const mockAppointments = [
  {
    _id: 'appt-1',
    scheduledAt: '2025-11-10T15:00:00Z',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    status: 'scheduled',
    reason: 'Control respiratorio',
  },
];

const mockSlots = [
  { start: '2025-11-12T09:00:00Z', end: '2025-11-12T09:30:00Z', available: true },
  { start: '2025-11-12T09:30:00Z', end: '2025-11-12T10:00:00Z', available: false },
];

// Mismo formato que formatDateTime() en el componente: depende de la zona
// horaria del entorno de test, así que lo recalculamos en lugar de asumir UTC.
const formatSlotLabel = (iso) => {
  const date = new Date(iso);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

describe('AppointmentCalendar — patient view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = { _id: 'pat-1', name: 'Paciente Uno', role: 'patient' };
    axios.get.mockImplementation((url) => {
      if (url.includes('/auth/doctors')) {
        return Promise.resolve({ data: { data: mockDoctors } });
      }
      if (url.includes('/availability')) {
        return Promise.resolve({ data: { data: mockSlots } });
      }
      return Promise.resolve({ data: { data: mockAppointments } });
    });
    axios.post.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it('does not show the raw ID filter inputs', async () => {
    render(<AppointmentCalendar />);
    await waitFor(() => screen.getByText('Control respiratorio'));
    expect(screen.queryByPlaceholderText(/doctor-123/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/patient-456/i)).not.toBeInTheDocument();
  });

  it('shows the appointment list with the doctor name resolved instead of a raw id', async () => {
    render(<AppointmentCalendar />);
    await waitFor(() => screen.getByText('Control respiratorio'));
    await waitFor(() => expect(screen.getAllByText('Dra. Ana Rojas').length).toBeGreaterThan(0));
    expect(screen.queryByText('doc-1')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no upcoming appointments', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/auth/doctors')) return Promise.resolve({ data: { data: mockDoctors } });
      return Promise.resolve({ data: { data: [] } });
    });
    render(<AppointmentCalendar />);
    await waitFor(() => expect(screen.getByText(/no tienes citas programadas/i)).toBeInTheDocument());
  });

  it('populates the doctor dropdown from GET /auth/doctors', async () => {
    render(<AppointmentCalendar />);
    await screen.findByRole('option', { name: 'Dra. Ana Rojas' });
    expect(screen.getByRole('option', { name: 'Dra. Ana Rojas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dr. Luis Paredes' })).toBeInTheDocument();
  });

  it('loads and shows availability slots after picking a doctor', async () => {
    const user = userEvent.setup();
    render(<AppointmentCalendar />);
    await screen.findByRole('option', { name: 'Dra. Ana Rojas' });

    await user.selectOptions(screen.getByRole('combobox'), 'doc-1');
    await user.click(screen.getByRole('button', { name: /ver horarios disponibles/i }));

    await waitFor(() => {
      const availabilityCall = axios.get.mock.calls.find(([url]) => url.includes('/availability'));
      expect(availabilityCall[0]).toContain('/appointments/doctor/doc-1/availability');
    });
  });

  it('books the selected slot and refreshes the appointment list', async () => {
    const user = userEvent.setup();
    render(<AppointmentCalendar />);
    await screen.findByRole('option', { name: 'Dra. Ana Rojas' });

    await user.selectOptions(screen.getByRole('combobox'), 'doc-1');
    await user.click(screen.getByRole('button', { name: /ver horarios disponibles/i }));

    const freeSlotButton = await screen.findByRole('button', { name: formatSlotLabel(mockSlots[0].start) });
    await user.click(freeSlotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar cita/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/appointments'),
        expect.objectContaining({
          patientId: 'pat-1',
          doctorId: 'doc-1',
          scheduledAt: '2025-11-12T09:00:00Z',
        }),
        expect.any(Object)
      );
    });
    await waitFor(() => expect(screen.getByText(/cita reservada correctamente/i)).toBeInTheDocument());
  });

  it('does not let the patient pick an unavailable (busy) slot', async () => {
    const user = userEvent.setup();
    render(<AppointmentCalendar />);
    await screen.findByRole('option', { name: 'Dra. Ana Rojas' });

    await user.selectOptions(screen.getByRole('combobox'), 'doc-1');
    await user.click(screen.getByRole('button', { name: /ver horarios disponibles/i }));

    const busySlotButton = await screen.findByRole('button', { name: formatSlotLabel(mockSlots[1].start) });
    expect(busySlotButton).toBeDisabled();
    fireEvent.click(busySlotButton);
    expect(screen.queryByRole('button', { name: /confirmar cita/i })).not.toBeInTheDocument();
  });
});
