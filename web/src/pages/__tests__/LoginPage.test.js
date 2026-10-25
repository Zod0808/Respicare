/**
 * Unit tests for LoginPage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = (authOverrides = {}) => {
  useAuth.mockReturnValue({
    login: jest.fn().mockResolvedValue({ name: 'User', role: 'patient' }),
    isAuthenticated: false,
    loading: false,
    ...authOverrides,
  });
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  // ── rendering ─────────────────────────────────────────────────────────────

  it('renders the login form', () => {
    renderLogin();
    // El h1 real es "Bienvenido"; "Iniciar Sesión" es el texto del botón submit.
    expect(screen.getByRole('heading', { name: 'Bienvenido' })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders RespiCare branding', () => {
    renderLogin();
    // "RespiCare" vive dentro de un <aside aria-hidden="true"> decorativo
    // (no es un heading accesible), por lo que getByRole no lo encuentra.
    expect(screen.getByText('RespiCare')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderLogin();
    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
  });

  // ── redirect when already authenticated ──────────────────────────────────

  it('redirects to /dashboard when already authenticated', () => {
    // El destino real es '/dashboard' solo para roles doctor/admin; para
    // cualquier otro rol (incluido undefined) cae a '/'.
    renderLogin({ isAuthenticated: true, loading: false, user: { role: 'doctor' } });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  // ── form interaction ──────────────────────────────────────────────────────

  it('updates email and password fields', () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passInput = screen.getByLabelText('Contraseña');

    fireEvent.change(emailInput, { target: { value: 'doc@hospital.com' } });
    fireEvent.change(passInput, { target: { value: 'secret123' } });

    expect(emailInput.value).toBe('doc@hospital.com');
    expect(passInput.value).toBe('secret123');
  });

  // ── successful submission ─────────────────────────────────────────────────

  it('calls login() and navigates on successful submit', async () => {
    // El destino '/dashboard' solo aplica a roles doctor/admin; sin rol
    // ('User' no tiene `role`) el destino real sería '/'.
    const mockLogin = jest.fn().mockResolvedValue({ name: 'User', role: 'doctor' });
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'mypassword' },
    });
    fireEvent.submit(screen.getByLabelText('Contraseña').closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'mypassword');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  // ── error display ─────────────────────────────────────────────────────────

  it('shows error message when login fails', async () => {
    const err = Object.assign(new Error('Bad'), {
      response: { data: { message: 'Credenciales inválidas.' } },
    });
    const mockLogin = jest.fn().mockRejectedValue(err);
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false, loading: false });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'bad@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(screen.getByLabelText('Contraseña').closest('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas.')
    );
  });

  it('shows fallback error when response has no message', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Network error'));
    useAuth.mockReturnValue({ login: mockLogin, isAuthenticated: false, loading: false });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByLabelText('Contraseña').closest('form'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
  });
});