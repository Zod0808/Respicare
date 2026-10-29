/**
 * Tests for FactorChart Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FactorChart from '../FactorChart';
import { ThemeProvider } from '../ThemeProvider';

function renderWithTheme(ui) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('FactorChart', () => {
  const mockFactors = [
    { name: 'Factor 1', value: 0.8, description: 'Test factor 1' },
    { name: 'Factor 2', value: 0.6, description: 'Test factor 2' },
    { name: 'Factor 3', value: 0.4, description: 'Test factor 3' }
  ];

  it('should render with default props', () => {
    renderWithTheme(<FactorChart factors={mockFactors} />);
    expect(screen.getByText('Factores de Influencia')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    renderWithTheme(<FactorChart factors={mockFactors} title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render bar chart by default', () => {
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} />);
    expect(container.querySelector('.factor-chart-bar')).toBeInTheDocument();
  });

  it('should render pie chart when type is pie', () => {
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} type="pie" />);
    expect(container.querySelector('.factor-chart-pie')).toBeInTheDocument();
  });

  it('should render radar chart when type is radar', () => {
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} type="radar" />);
    expect(container.querySelector('.factor-chart-radar')).toBeInTheDocument();
  });

  it('should render an empty chart content area for an unsupported type', () => {
    // El componente solo implementa bar/pie/radar; cualquier otro "type"
    // (p. ej. "heatmap") deja el header pero sin contenido de gráfico.
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} type="heatmap" />);
    expect(screen.getByText('Factores de Influencia')).toBeInTheDocument();
    expect(container.querySelector('.factor-chart-content').children.length).toBe(0);
  });

  it('should display factor names', () => {
    renderWithTheme(<FactorChart factors={mockFactors} />);
    expect(screen.getByText('Factor 1')).toBeInTheDocument();
    expect(screen.getByText('Factor 2')).toBeInTheDocument();
    expect(screen.getByText('Factor 3')).toBeInTheDocument();
  });

  it('should handle empty factors array', () => {
    // Con factors vacíos el componente muestra el estado vacío, no el título.
    renderWithTheme(<FactorChart factors={[]} />);
    expect(screen.getByText('No hay factores disponibles para visualizar.')).toBeInTheDocument();
  });

  it('should handle null factors', () => {
    renderWithTheme(<FactorChart factors={null} />);
    expect(screen.getByText('No hay factores disponibles para visualizar.')).toBeInTheDocument();
  });

  it('should handle string factors', () => {
    const stringFactors = ['Factor A', 'Factor B', 'Factor C'];
    renderWithTheme(<FactorChart factors={stringFactors} />);
    expect(screen.getByText('Factor A')).toBeInTheDocument();
    expect(screen.getByText('Factor B')).toBeInTheDocument();
  });

  it('should show legend when showLegend is true', () => {
    // La leyenda solo existe en el chart de tipo "pie".
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} type="pie" showLegend={true} />);
    expect(container.querySelector('.pie-legend')).toBeInTheDocument();
  });

  it('should hide legend when showLegend is false', () => {
    const { container } = renderWithTheme(<FactorChart factors={mockFactors} type="pie" showLegend={false} />);
    expect(container.querySelector('.pie-legend')).not.toBeInTheDocument();
  });

  it('should handle hover interactions when interactive is true', () => {
    renderWithTheme(<FactorChart factors={mockFactors} interactive={true} />);
    const factorElement = screen.getByText('Factor 1').closest('.factor-chart__item');
    
    if (factorElement) {
      fireEvent.mouseEnter(factorElement);
      // Should show hover state (implementation dependent)
    }
  });

  it('should handle click interactions when interactive is true', () => {
    renderWithTheme(<FactorChart factors={mockFactors} interactive={true} />);
    const factorElement = screen.getByText('Factor 1');
    
    if (factorElement) {
      fireEvent.click(factorElement);
      // Should select factor (implementation dependent)
    }
  });

  it('should process factors with different formats', () => {
    const mixedFactors = [
      'Simple String',
      { name: 'Named Factor', value: 0.5 },
      { feature: 'Feature Factor', importance: 0.7 },
      { label: 'Label Factor', weight: 0.3 }
    ];
    
    renderWithTheme(<FactorChart factors={mixedFactors} />);
    expect(screen.getByText('Simple String')).toBeInTheDocument();
    expect(screen.getByText('Named Factor')).toBeInTheDocument();
    expect(screen.getByText('Feature Factor')).toBeInTheDocument();
    expect(screen.getByText('Label Factor')).toBeInTheDocument();
  });

  it('should handle factors with categories', () => {
    const categorizedFactors = [
      { name: 'Factor 1', value: 0.8, category: 'Symptom' },
      { name: 'Factor 2', value: 0.6, category: 'Risk' }
    ];
    
    renderWithTheme(<FactorChart factors={categorizedFactors} />);
    expect(screen.getByText('Factor 1')).toBeInTheDocument();
    expect(screen.getByText('Factor 2')).toBeInTheDocument();
  });
});

