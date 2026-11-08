/**
 * Nombre de Objeto: ThemeToggle
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - tema visual de la interfaz
 * Descripción: Theme toggle. Parte de: tema visual de la interfaz.
 *
 * Theme Toggle Component
 * 
 * Componente para cambiar entre temas light/dark
 */

import React from 'react';
import { useThemeContext } from './ThemeProvider';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${mode === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a tema ${mode === 'light' ? 'oscuro' : 'claro'}`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {mode === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="theme-toggle__text">
        {mode === 'light' ? 'Modo oscuro' : 'Modo claro'}
      </span>
    </button>
  );
};

export default ThemeToggle;

