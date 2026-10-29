/**
 * Design System y Temas
 * 
 * Sistema de diseño unificado con soporte para temas light/dark
 */

import React from 'react';

export const colors = {
  // Colores primarios
  primary: {
    main: '#103c37',
    light: '#1d5c54',
    dark: '#0a2b27',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  // Colores de estado
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
  // Colores neutros
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

export const lightTheme = {
  mode: 'light',
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: {
      default: '#f8f1e4',
      paper: '#fffaf2',
      elevated: '#fffaf2',
    },
    text: {
      primary: '#152420',
      secondary: 'rgba(21, 36, 32, 0.6)',
      disabled: 'rgba(21, 36, 32, 0.38)',
      hint: 'rgba(21, 36, 32, 0.38)',
    },
    divider: 'rgba(21, 36, 32, 0.12)',
    action: {
      active: 'rgba(21, 36, 32, 0.54)',
      hover: 'rgba(16, 60, 55, 0.06)',
      selected: 'rgba(16, 60, 55, 0.1)',
      disabled: 'rgba(21, 36, 32, 0.26)',
      disabledBackground: 'rgba(21, 36, 32, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase',
    },
  },
  spacing: {
    unit: 8,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shape: {
    borderRadius: 4,
    borderRadiusSmall: 2,
    borderRadiusLarge: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  palette: {
    ...lightTheme.palette,
    primary: {
      main: '#f0a677',
      light: '#f6c4a0',
      dark: '#d9683f',
      contrastText: '#2e130a',
    },
    background: {
      default: '#16201d',
      paper: '#1c2823',
      elevated: '#223029',
    },
    text: {
      primary: '#f8f1e4',
      secondary: 'rgba(248, 241, 228, 0.6)',
      disabled: 'rgba(248, 241, 228, 0.38)',
      hint: 'rgba(248, 241, 228, 0.38)',
    },
    divider: 'rgba(248, 241, 228, 0.12)',
    action: {
      active: 'rgba(248, 241, 228, 0.7)',
      hover: 'rgba(248, 241, 228, 0.08)',
      selected: 'rgba(248, 241, 228, 0.16)',
      disabled: 'rgba(248, 241, 228, 0.3)',
      disabledBackground: 'rgba(248, 241, 228, 0.12)',
    },
  },
};

// Función para obtener el tema según preferencia del sistema o almacenamiento
export const getTheme = (mode = 'light') => {
  // Detectar preferencia del sistema si no hay modo especificado
  if (mode === 'auto') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      mode = prefersDark ? 'dark' : 'light';
    } else {
      mode = 'light';
    }
  }
  
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Hook para usar el tema (si se usa React Context)
export const useTheme = () => {
  const [mode, setMode] = React.useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme-mode');
        return saved || 'light';
      }
    } catch {
      // localStorage puede lanzar (modo privado, cuota excedida) — usar default
    }
    return 'light';
  });

  const theme = getTheme(mode);

  const persist = (newMode) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', newMode);
      }
    } catch {
      // Ignorar: la UI sigue funcionando en memoria aunque no persista
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    persist(newMode);
  };

  const setTheme = (newMode) => {
    setMode(newMode);
    persist(newMode);
  };

  return { theme, mode, toggleTheme, setTheme };
};

