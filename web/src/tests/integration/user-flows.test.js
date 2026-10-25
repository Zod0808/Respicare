/**
 * User Flow Integration Tests
 * 
 * Tests complete user journeys across multiple components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// `/dashboard` está detrás de `ProtectedRoute roles={['doctor', 'admin']}`
// (ver App.js); sin mockear useAuth, el usuario no autenticado rebota a
// `/login` y el flujo de "Error Recovery" nunca llega a montar <Dashboard />.
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'doctor' },
    token: 'test-token',
    isAuthenticated: true,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock i18n service
jest.mock('../../services/i18nService', () => ({
  t: jest.fn((key) => key),
  getCurrentLanguage: jest.fn(() => 'es'),
  setLanguage: jest.fn(),
  SUPPORTED_LANGUAGES: {
    es: 'Español',
    en: 'English'
  }
}));

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
    
    mockedAxios.get.mockResolvedValue({
      data: { success: true, data: {} }
    });
    
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          sessionId: 'test-session',
          message: 'Respuesta del bot',
          analysis: {
            id: 'test-analysis',
            shapExplanation: { key_factors: [] }
          }
        }
      }
    });
  });

  describe('Complete Symptom Analysis Flow', () => {
    it('should complete full symptom analysis journey', async () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      
      // 1. User arrives at home page
      await waitFor(() => {
        expect(screen.getByText(/home.welcome/i)).toBeInTheDocument();
      });
      
      // 2. User interacts with chatbot
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Tengo tos persistente y fiebre' } });
      
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      fireEvent.click(sendButton);
      
      // 3. System analyzes symptoms
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/symptom-analyzer'),
          expect.any(Object),
          expect.any(Object)
        );
      });
      
      // 4. User sees analysis results
      await waitFor(() => {
        expect(screen.getByText('Tengo tos persistente y fiebre')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate through all main pages', async () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      
      // Start at home
      await waitFor(() => {
        expect(screen.getByText(/home.welcome/i)).toBeInTheDocument();
      });
      
      // Navigate to dashboard (if link exists)
      const dashboardLinks = screen.queryAllByRole('link');
      const dashboardLink = dashboardLinks.find(link => 
        link.getAttribute('href')?.includes('dashboard') ||
        link.textContent.toLowerCase().includes('dashboard')
      );
      
      if (dashboardLink) {
        fireEvent.click(dashboardLink);
        await waitFor(() => {
          expect(screen.getByText(/estado del sistema|dashboard/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Theme Customization Flow', () => {
    it('should allow user to customize theme and see changes', () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      
      // Find theme toggle
      const themeButtons = screen.queryAllByRole('button');
      const themeToggle = themeButtons.find(btn => 
        btn.textContent.includes('tema') || 
        btn.textContent.includes('theme') ||
        btn.getAttribute('aria-label')?.includes('tema')
      );
      
      if (themeToggle) {
        // Toggle to dark
        fireEvent.click(themeToggle);
        expect(document.body).toHaveClass('theme-dark');
        
        // Toggle back to light
        fireEvent.click(themeToggle);
        expect(document.body).toHaveClass('theme-light');
      }
    });
  });

  describe('Language Selection Flow', () => {
    it('should allow user to change language and see updates', () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      
      // Find language selector
      const langButton = screen.queryByRole('button', { name: /seleccionar idioma/i });
      
      if (langButton) {
        fireEvent.click(langButton);
        
        const englishOption = screen.queryByRole('button', { name: /seleccionar english/i });
        if (englishOption) {
          fireEvent.click(englishOption);
          
          // Language should change
          expect(screen.getByText('English')).toBeInTheDocument();
        }
      }
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle errors and allow recovery', async () => {
      // Dashboard.checkServices llama primero a `.../health` (backend) y luego
      // a `.../health` de IA; AppointmentCalendar también dispara su propio
      // axios.get en paralelo, así que encadenar mockRejectedValueOnce por
      // orden de llamada es frágil — se enruta por URL. Además, rechazar con
      // un objeto plano (sin `.message`) deja `err.message` undefined, por lo
      // que `setError` nunca se dispara: hay que rechazar con un `Error` real.
      let backendHealthCalls = 0;
      mockedAxios.get.mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/health') && !url.includes('/ai')) {
          backendHealthCalls += 1;
          if (backendHealthCalls === 1) {
            return Promise.reject(new Error('Service unavailable'));
          }
          return Promise.resolve({ data: { status: 'healthy' } });
        }
        // AppointmentCalendar también cuelga de axios.get (`/appointments`) y
        // hace `response.data?.data ?? []`: un `{}` truthy no activa el `??`,
        // por lo que `appointments` queda como objeto y `.map` explota.
        return Promise.resolve({ data: { success: true, data: [] } });
      });

      window.history.pushState({}, '', '/dashboard');
      render(<App />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Retry
      const retryButton = screen.getByText(/reintentar/i);
      fireEvent.click(retryButton);

      // Should recover
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Multi-step Analysis Flow', () => {
    it('should handle multi-step symptom analysis with follow-up questions', async () => {
      // ChatBotEnhanced.handleSend hace varias llamadas a axios.post por
      // mensaje (init de sesión, ml-analyze, el endpoint de chat `/analyze`
      // y el guardado del mensaje), y el orden exacto varía según si
      // `sessionId` ya se resolvió — encadenar mockResolvedValueOnce por
      // orden de llamada es frágil. Se enruta por URL: `/analyze` (el único
      // endpoint que determina el texto del bot) devuelve la pregunta de
      // seguimiento en la primera llamada y la recomendación en la segunda;
      // además devuelve el mensaje "plano" (`response.data.message`), no
      // envuelto en `{success, data}` como los demás endpoints.
      let analyzeCallCount = 0;
      mockedAxios.post.mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/symptom-analyzer/ml-analyze')) {
          return Promise.resolve({
            data: {
              success: true,
              data: { id: 'test-analysis', disease: 'Bronquitis', confidence: 0.85, urgency_level: 'medium' }
            }
          });
        }
        if (typeof url === 'string' && url.endsWith('/analyze')) {
          analyzeCallCount += 1;
          const message = analyzeCallCount === 1
            ? '¿Cuánto tiempo llevas con la tos?'
            : 'Basado en tus síntomas, te recomiendo...';
          return Promise.resolve({ data: { message } });
        }
        if (typeof url === 'string' && url.includes('/chat-conversations') && !url.includes('/messages')) {
          return Promise.resolve({ data: { success: true, data: { sessionId: 'test-session' } } });
        }
        return Promise.resolve({ data: { success: true } });
      });

      window.history.pushState({}, '', '/');
      render(<App />);
      
      // First message
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Tengo tos' } });
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/cuánto tiempo/i)).toBeInTheDocument();
      });
      
      // Follow-up message
      fireEvent.change(input, { target: { value: 'Hace 2 semanas' } });
      fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/recomiendo/i)).toBeInTheDocument();
      });
    });
  });
});

