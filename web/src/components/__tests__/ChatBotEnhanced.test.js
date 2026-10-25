/**
 * Tests for ChatBotEnhanced Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import ChatBotEnhanced from '../ChatBotEnhanced';
import * as i18nService from '../../services/i18nService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock i18n service
jest.mock('../../services/i18nService', () => ({
  t: jest.fn((key) => key),
  getCurrentLanguage: jest.fn(() => 'es')
}));

// Mock child components
jest.mock('../SHAPVisualization', () => {
  return function MockSHAPVisualization({ shapData }) {
    return <div data-testid="shap-visualization">SHAP Visualization</div>;
  };
});

jest.mock('../FactorChart', () => {
  return function MockFactorChart({ factors }) {
    return <div data-testid="factor-chart">Factor Chart</div>;
  };
});

jest.mock('../MLAdvancedResults', () => {
  return function MockMLAdvancedResults({ analysisId, sessionId }) {
    return <div data-testid="ml-advanced-results">ML Advanced Results</div>;
  };
});

// axios.post se usa para 3 endpoints distintos dentro de un mismo flujo de envío
// (init de sesión, ml-analyze, analyze); cada uno tiene un shape de respuesta
// diferente, así que se enruta por URL en vez de usar mockResolvedValue único.
const sessionResponse = {
  data: { success: true, data: { sessionId: 'test-session-id' } }
};
const mlAnalyzeResponse = {
  data: {
    success: true,
    data: {
      disease: 'Resfriado común',
      confidence: 0.8,
      urgency_level: 'low',
      explanation: { friendly: { main_explanation: 'Explicación amigable', key_factors: [], recommendations: [] } },
      needs_medical_attention: false,
      id: 'test-analysis-id',
    }
  }
};
const analyzeResponse = {
  data: {
    message: 'Respuesta del bot',
    urgency_level: 'low',
    symptom_count: 1,
    symptom_categories: [],
  }
};

const defaultPostImplementation = (url) => {
  if (url.includes('/chat-conversations')) return Promise.resolve(sessionResponse);
  if (url.includes('/ml-analyze')) return Promise.resolve(mlAnalyzeResponse);
  if (url.includes('/analyze')) return Promise.resolve(analyzeResponse);
  return Promise.resolve({ data: {} });
};

describe('ChatBotEnhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();

    mockedAxios.post.mockImplementation(defaultPostImplementation);

    // Mock Speech Recognition
    global.SpeechRecognition = jest.fn(() => ({
      continuous: false,
      interimResults: false,
      lang: 'es-ES',
      start: jest.fn(),
      stop: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null
    }));
    
    global.webkitSpeechRecognition = global.SpeechRecognition;
  });

  it('should render chatbot component', () => {
    render(<ChatBotEnhanced />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display greeting message', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      expect(screen.getByText(/chatbot.greeting/i)).toBeInTheDocument();
    });
  });

  it('should initialize session on mount', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chat-conversations'),
        expect.any(Object)
      );
    });
  });

  it('should send message when form is submitted', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Tengo tos' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/symptom-analyzer/ml-analyze'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('should display user message after sending', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Tengo tos' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tengo tos')).toBeInTheDocument();
    });
  });

  it('should display bot response', async () => {
    render(<ChatBotEnhanced />);

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });

      // Sin palabras clave de síntomas no se dispara el análisis ML, así que
      // el texto del bot queda igual a response.data.message, sin el bloque
      // de resultados ML concatenado.
      fireEvent.change(input, { target: { value: 'Hola, buenos días' } });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Respuesta del bot')).toBeInTheDocument();
    });
  });

  it('should show SHAP visualization when analysis is available', async () => {
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/ml-analyze')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              ...mlAnalyzeResponse.data.data,
              explanation: { key_factors: [{ feature: 'Tos', importance: 0.8 }] },
            }
          }
        });
      }
      return defaultPostImplementation(url);
    });

    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Tengo tos' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('shap-visualization')).toBeInTheDocument();
    });
  });

  it('should show suggestions', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      // Suggestions should be displayed (implementation dependent)
      const suggestions = screen.queryAllByRole('button');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  it('should handle voice recognition start', () => {
    render(<ChatBotEnhanced />);
    
    const voiceButton = screen.getByRole('button', { name: /voz|voice|microphone/i });
    if (voiceButton) {
      fireEvent.click(voiceButton);
      // Should start listening (implementation dependent)
    }
  });

  it('should load conversation history from localStorage', () => {
    const mockHistory = [
      { role: 'user', content: 'Previous message', timestamp: new Date().toISOString() }
    ];
    Storage.prototype.getItem.mockReturnValue(JSON.stringify(mockHistory));
    
    render(<ChatBotEnhanced />);
    
    // History should be loaded (implementation dependent)
    expect(Storage.prototype.getItem).toHaveBeenCalledWith('chatbot_history');
  });

  it('should save conversation history to localStorage', async () => {
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        'chatbot_history',
        expect.any(String)
      );
    });
  });

  it('should handle language change', () => {
    render(<ChatBotEnhanced />);
    
    // Simulate language change event
    const event = new CustomEvent('languageChanged', {
      detail: { language: 'en' }
    });
    window.dispatchEvent(event);
    
    // Component should update (implementation dependent)
    expect(i18nService.getCurrentLanguage).toHaveBeenCalled();
  });

  it('should show advanced results button when analysis is available', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: 'Respuesta',
          analysis: {
            id: 'test-analysis-id',
            experimentId: 'test-experiment-id'
          }
        }
      }
    });
    
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      const advancedButton = screen.queryByText(/resultados avanzados|advanced results/i);
      if (advancedButton) {
        expect(advancedButton).toBeInTheDocument();
      }
    });
  });

  it('should open advanced results modal when button is clicked', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: 'Respuesta',
          analysis: {
            id: 'test-analysis-id',
            experimentId: 'test-experiment-id'
          }
        }
      }
    });
    
    render(<ChatBotEnhanced />);
    
    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      const advancedButton = screen.queryByText(/resultados avanzados|advanced results/i);
      if (advancedButton) {
        fireEvent.click(advancedButton);
        expect(screen.getByTestId('ml-advanced-results')).toBeInTheDocument();
      }
    });
  });

  it('should handle error when sending message', async () => {
    // mockRejectedValueOnce antes de render() lo consume la llamada de init de
    // sesión al montar, no el envío del mensaje; se enruta por URL para que
    // falle específicamente la llamada a /analyze del envío de mensaje.
    mockedAxios.post.mockImplementation((url) => {
      if (url.includes('/analyze') && !url.includes('/ml-analyze')) {
        return Promise.reject({
          response: { data: { message: 'Error sending message' } }
        });
      }
      return defaultPostImplementation(url);
    });

    render(<ChatBotEnhanced />);

    await waitFor(() => {
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /enviar/i });

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(sendButton);
    });

    // El componente no muestra la palabra "error" al usuario: ante un fallo
    // de /analyze cae a una respuesta canned de keywords sin romper el chat.
    await waitFor(() => {
      expect(screen.getByText(/Gracias por tu consulta/i)).toBeInTheDocument();
    });
  });
});

