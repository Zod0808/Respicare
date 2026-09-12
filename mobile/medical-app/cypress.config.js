/**
 * Cypress E2E Testing Configuration — RespiCare Mobile (Capacitor + Next.js)
 *
 * Cierra el gap documentado en Documentation/pruebas/Catalogo_de_Pruebas_RespiCare.xlsx (CP-018):
 * no existía framework E2E configurado para la app móvil, solo pruebas unitarias con Jest.
 *
 * Estas pruebas ejercitan la capa web del híbrido Capacitor (misma UI que corre dentro
 * del WebView nativo) contra un servidor `next dev` real, interceptando las llamadas al
 * backend con cy.intercept en lugar de requerir MongoDB/backend real.
 */

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8083',
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      return config
    },
  },
})
