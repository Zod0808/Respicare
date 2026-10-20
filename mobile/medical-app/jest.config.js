const nextJest = (() => {
  const mod = require('next/jest')
  return mod.default || mod
})()

const createJestConfig = nextJest({ dir: './' })

/**
 * Nombre de Objeto: jest.config (mobile/medical-app)
 * Fecha de Creación: 2026-05-07
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RNF-012 - Cobertura de pruebas (calidad verificable del código)
 * Descripción: Configuración de Jest sobre next/jest para la app móvil,
 * delimitando qué módulos se miden en cobertura y haciendo verificable la
 * calidad del código vía pruebas automatizadas.
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Coverage se recolecta sólo sobre módulos con tests unitarios. Los
  // componentes React se validan con render-tests puntuales y con el flujo E2E
  // sobre el backend; incluir todo `components/**` inflaba el denominador y
  // enmascaraba las mejoras reales en las utilidades y servicios.
  collectCoverageFrom: [
    'components/tabs/wearables.tsx',
    'lib/utils/battery-monitor.ts',
    'lib/utils/device-metrics.ts',
    'lib/utils/imageCache.ts',
    'lib/utils/performance.ts',
    'lib/services/nativeStorage.ts',
    'lib/services/offlineQueue.ts',
    'lib/services/offlineOperations.ts',
    'lib/services/notificationService.ts',
    'lib/services/sqliteDatabase.ts',
    'lib/services/emulatorSensors.ts',
    'lib/services/healthConnectService.ts',
    'lib/services/wearableWebSocket.ts',
    'lib/services/bleWearableService.ts',
    'lib/api/services/wearableService.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: { lines: 80, functions: 80, statements: 80, branches: 60 },
  },
}

module.exports = createJestConfig(config)
