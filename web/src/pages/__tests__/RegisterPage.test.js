/**
 * Unit tests for RegisterPage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const baseAuth = {
  register: jest.fn().mockResolvedValue({ name: 'User' }),
  isAuthenticated: false,
  loading: false,
};

const renderRegister = (authOverrides = {}) => {
  useAuth.mockReturnValue({ ...baseAuth, ...authOverrides });
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

// El rol real no es un <select> (no hay ningún elemento con label "rol"):
// es una grilla de botones ("Paciente"/"Médico"/"Administrador") que se
// seleccionan haciendo click.
const ROLE_BUTTON_NAME = {
  patient: /paciente/i,
  doctor: /médico/i,
  admin: /administrador/i,
};

const fillForm = ({ name = 'Juan Pérez', email = 'j@test.com', password = 'Secure1!', confirm = 'Secure1!', role = 'patient' } = {}) => {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: confirm } });
  if (role !== 'patient') {
    fireEvent.click(screen.getByRole('button', { name: ROLE_BUTTON_NAME[role] }));
  }
};

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  // ── rendering ─────────────────────────────────────────────────────────────

  it('renders the registration form', () => {
    renderRegister();
    // El h1 real es "Crear cuenta" (minúscula); "Crear Cuenta" es el texto
    // del botón submit.
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('renders role options', () => {
    // No existe un <select>/<option> de rol: son botones ("Paciente",
    // "Médico" — no "Doctor" —, "Administrador").
    renderRegister();
    expect(screen.getByRole('button', { name: /paciente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /médico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /administrador/i })).toBeInTheDocument();
  });

  it('renders link back to login', () => {
    renderRegister();
    expect(screen.getByRole('link', { name: /inicia sesión/i })).toBeInTheDocument();
  });

  // ── redirect when already authenticated ──────────────────────────────────

  it('redirects to /dashboard when already authenticated', () => {
    // El destino real es '/dashboard' solo para roles doctor/admin.
    renderRegister({ isAuthenticated: true, loading: false, user: { role: 'doctor' } });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // ── validation errors ─────────────────────────────────────────────────────

  it('shows error when passwords do not match', async () => {
    renderRegister();
    fillForm({ password: 'abc123', confirm: 'xyz999' });
    fireEvent.submit(screen.getByLabelText(/confirmar contraseña/i).closest('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/contraseñas no coinciden/i)
    );
  });

  it('shows error when password is too short', async () => {
    // El componente real exige 8 caracteres mínimo, no 6 (aunque el
    // placeholder del input diga "Mínimo 6 caracteres").
    renderRegister();
    fillForm({ password: 'abc', confirm: 'abc' });
    fireEvent.submit(screen.getByLabelText(/confirmar contraseña/i).closest('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/al menos 8 caracteres/i)
    );
  });

  // ── successful submission ─────────────────────────────────────────────────

  it('calls register() and navigates to /dashboard on success', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ name: 'Juan' });
    useAuth.mockReturnValue({ register: mockRegister, isAuthenticated: false, loading: false });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // La contraseña debe cumplir las 4 reglas reales: >=8 caracteres,
    // mayúscula, número y carácter especial.
    fillForm({ password: 'Secure1!', confirm: 'Secure1!', role: 'doctor' });
    fireEvent.submit(screen.getByLabelText(/confirmar contraseña/i).closest('form'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Juan Pérez', 'j@test.com', 'Secure1!', 'doctor');
    });
    // `created` no trae `role`, así que el destino cae al rol del formulario (doctor).
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  // ── registration error ────────────────────────────────────────────────────

  it('shows error when register API fails', async () => {
    const err = Object.assign(new Error('Conflict'), {
      response: { data: { message: 'Email ya registrado.' } },
    });
    const mockRegister = jest.fn().mockRejectedValue(err);
    useAuth.mockReturnValue({ register: mockRegister, isAuthenticated: false, loading: false });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fillForm({ password: 'Valid123!', confirm: 'Valid123!' });
    fireEvent.submit(screen.getByLabelText(/confirmar contraseña/i).closest('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Email ya registrado.')
    );
  });
});