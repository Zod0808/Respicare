/**
 * Visual Regression Tests — MLAdvancedResults + SHAPVisualization
 *
 * Strategy: DOM snapshots de los estados reales del componente
 * (tabs, explicaciones SHAP, comparación de modelos, recomendaciones RL,
 * historial de experimentos) y visualización SHAP standalone.
 *
 * `MLAdvancedResults` no recibe un prop `result` con disease/confidence/
 * urgencyLevel — carga sus datos vía axios según `analysisId`/`experimentId`/
 * `sessionId` y los distribuye en 4 tabs (ver `src/components/MLAdvancedResults.js`).
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MLAdvancedResults from '../../components/MLAdvancedResults';
import SHAPVisualization from '../../components/SHAPVisualization';

jest.mock('axios');
const mockedAxios = axios;

const mockToken = 'visual-test-token';
const mockAnalysisId = 'analysis-123';

const mockShapFactors = [
  { feature: 'sibilancias', value: 0.42, impact: 'positive' },
  { feature: 'tos_nocturna', value: 0.31, impact: 'positive' },
  { feature: 'dificultad_respiratoria', value: 0.14, impact: 'positive' },
  { feature: 'fiebre', value: -0.05, impact: 'negative' },
];

const mockModels = [
  { name: 'XGBoost', precision: 0.9, recall: 0.88, f1: 0.89, rocAuc: 0.95, inferenceTime: 45, status: 'active' },
  { name: 'Random Forest', precision: 0.86, recall: 0.85, f1: 0.855, rocAuc: 0.91, inferenceTime: 60, status: 'active' },
];

const mockRecommendations = [
  {
    action: 'Reforzar seguimiento respiratorio',
    confidence: 0.87,
    recommendation: 'Programar control en 48 horas por riesgo elevado.',
    state_summary: { adherence_rate: 0.7, recent_reminders: 1, time_to_next_dose: '2h' },
  },
];

const mockExperiments = [
  {
    experimentId: 'exp-0001-abcdef',
    experimentType: 'rl_session',
    modelName: 'XGBoost',
    status: 'completed',
    performance: { durationMs: 2450 },
    createdAt: '2026-01-15T12:00:00.000Z',
  },
];

beforeEach(() => {
  localStorage.setItem('token', mockToken);
  mockedAxios.get.mockImplementation((url) => {
    if (typeof url === 'string' && url.includes('/symptom-analyzer/ml-analyze/')) {
      return Promise.resolve({ data: { success: true, data: { explanation: mockShapFactors } } });
    }
    if (typeof url === 'string' && url.includes('/ml/models/compare')) {
      return Promise.resolve({ data: { success: true, data: { models: mockModels, metrics: { accuracy: 0.9 } } } });
    }
    if (typeof url === 'string' && url.includes('/ml/rl/session/')) {
      return Promise.resolve({ data: { success: true, data: mockRecommendations } });
    }
    if (typeof url === 'string' && url.includes('/ml/experiments')) {
      return Promise.resolve({ data: { success: true, data: mockExperiments } });
    }
    return Promise.resolve({ data: { success: true, data: {} } });
  });
});

afterEach(() => {
  localStorage.removeItem('token');
  jest.clearAllMocks();
});

// ─── DOM Snapshot — estados reales del componente ────────────────────────────

describe('MLAdvancedResults — Snapshot Visual Regression', () => {
  it('matches DOM snapshot with only tabs (no ids provided)', () => {
    const { asFragment } = render(<MLAdvancedResults />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot with SHAP explanations loaded', async () => {
    const { asFragment } = render(<MLAdvancedResults analysisId={mockAnalysisId} />);
    await waitFor(() => {
      expect(screen.getByText('Explicaciones SHAP Detalladas')).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot with model comparison table', async () => {
    const { asFragment } = render(<MLAdvancedResults />);
    fireEvent.click(screen.getByText(/Comparación de Modelos/));
    await waitFor(() => {
      expect(screen.getByText('XGBoost')).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches DOM snapshot with RL recommendations loaded', async () => {
    const { asFragment } = render(<MLAdvancedResults sessionId="session-789" />);
    fireEvent.click(screen.getByText(/Recomendaciones Optimizadas/));
    await waitFor(() => {
      expect(screen.getByText(/Reforzar seguimiento respiratorio/i)).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});

// ─── Tabs — estructura visual ─────────────────────────────────────────────────

describe('MLAdvancedResults — Visual de Tabs', () => {
  it('should render all 4 tabs', () => {
    render(<MLAdvancedResults />);
    expect(screen.getByText(/Explicaciones SHAP/)).toBeInTheDocument();
    expect(screen.getByText(/Comparación de Modelos/)).toBeInTheDocument();
    expect(screen.getByText(/Recomendaciones Optimizadas/)).toBeInTheDocument();
    expect(screen.getByText(/Historial de Experimentos/)).toBeInTheDocument();
  });

  it('should mark explanations tab as active by default', () => {
    render(<MLAdvancedResults />);
    const explanationsTab = screen.getByText(/Explicaciones SHAP/).closest('button');
    expect(explanationsTab).toHaveClass('active');
  });
});

// ─── Explicaciones SHAP — factores y su impacto ──────────────────────────────

describe('MLAdvancedResults — Visual de Explicaciones SHAP', () => {
  it('should display SHAP feature names once loaded', async () => {
    render(<MLAdvancedResults analysisId={mockAnalysisId} />);
    await waitFor(() => {
      expect(screen.getByText(/sibilancias/i)).toBeInTheDocument();
    });
  });

  it('should not render the explanations block without analysisId', () => {
    render(<MLAdvancedResults />);
    expect(screen.queryByText('Explicaciones SHAP Detalladas')).not.toBeInTheDocument();
  });
});

// ─── Comparación de modelos — tabla con métricas en porcentaje ──────────────

describe('MLAdvancedResults — Visual de Comparación de Modelos', () => {
  it('should display model names and percentage metrics', async () => {
    render(<MLAdvancedResults />);
    fireEvent.click(screen.getByText(/Comparación de Modelos/));

    await waitFor(() => {
      expect(screen.getByText('XGBoost')).toBeInTheDocument();
    });
    expect(screen.getByText('Random Forest')).toBeInTheDocument();
    expect(screen.getByText('90.00%')).toBeInTheDocument();
  });
});

// ─── Recomendaciones RL — badge de confianza ─────────────────────────────────

describe('MLAdvancedResults — Visual de Recomendaciones RL', () => {
  it('should display recommendation confidence badge', async () => {
    render(<MLAdvancedResults sessionId="session-789" />);
    fireEvent.click(screen.getByText(/Recomendaciones Optimizadas/));

    await waitFor(() => {
      expect(screen.getByText(/Confianza: 87\.0%/i)).toBeInTheDocument();
    });
  });
});

// ─── Historial de experimentos — tabla con estado ────────────────────────────

describe('MLAdvancedResults — Visual de Historial de Experimentos', () => {
  it('should display experiment status badge', async () => {
    render(<MLAdvancedResults experimentId="experiment-456" />);
    fireEvent.click(screen.getByText(/Historial de Experimentos/));

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });
});

// ─── Estados de carga y error ─────────────────────────────────────────────────

describe('MLAdvancedResults — Estados Visuales de Carga y Error', () => {
  it('should show loading indicator while fetching', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    render(<MLAdvancedResults analysisId={mockAnalysisId} />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should show error message when the request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    render(<MLAdvancedResults analysisId={mockAnalysisId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error cargando datos de análisis/i)).toBeInTheDocument();
    });
  });
});

// ─── SHAPVisualization — componente visual de importancia (standalone) ──────

describe('SHAPVisualization — Snapshot Visual Regression', () => {
  it('matches DOM snapshot with SHAP data', () => {
    const { asFragment } = render(
      <SHAPVisualization shapData={mockShapFactors} disease="Asma bronquial" confidence={0.87} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render SHAP feature names', () => {
    render(<SHAPVisualization shapData={mockShapFactors} disease="Asma bronquial" confidence={0.87} />);
    expect(screen.getByText(/sibilancias/i)).toBeInTheDocument();
  });

  it('should render an empty state without SHAP data', () => {
    render(<SHAPVisualization shapData={null} />);
    expect(screen.getByText(/No hay datos de explicación disponibles/i)).toBeInTheDocument();
  });
});
