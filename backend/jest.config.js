/**
 * Nombre de Objeto: jest.config (backend)
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RNF-012 - Cobertura de pruebas (calidad verificable del código)
 * Descripción: Configuración de Jest para el backend (patrones de test,
 * entorno Node, recolección de cobertura), que hace medible la calidad del
 * código mediante pruebas automatizadas.
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/__tests__/**/*.ts'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json', 'cobertura'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/',
    '/coverage/',
    'jest.config.js',
    'package.json',
    'package-lock.json'
  ],
  
  // Coverage thresholds — target >70% on primary metrics
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Env vars must be set BEFORE module imports (setupFiles runs first)
  setupFiles: ['<rootDir>/tests/env.setup.ts'],
  // Jest globals (mock, beforeAll, etc.) go here
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Test timeout
  testTimeout: 10000,

  // Cada test suite levanta su propia instancia de mongodb-memory-server (un
  // mongod real). Con el default de Jest (núcleos-1 workers) eso dispara
  // demasiados procesos mongod en paralelo y provoca OOM/SIGSEGV intermitente
  // en máquinas de muchos núcleos. Se limita a la mitad de los núcleos.
  maxWorkers: '50%',
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // JUnit XML reporter for CI/CD
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'Backend Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true'
      }
    ]
  ],
  
  // Error handling
  errorOnDeprecated: true,
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@sentry/profiling-node$': '<rootDir>/tests/__mocks__/@sentry/profiling-node.js'
  },
  
  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Test paths
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Watch plugins (comentado si no está instalado)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ]
};
