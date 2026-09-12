// E2E — RespiCare Mobile (CP-018)
// Flujo: modo offline -> sincronización.
// hooks/useNetworkStatus.ts usa @capacitor/network en nativo, pero en web
// (navegador dentro del WebView / esta suite) cae al fallback de
// window.addEventListener('online'|'offline', ...) + navigator.onLine,
// por lo que la prueba simula la conectividad forzando esos mismos eventos.

describe('Modo offline -> sincronización', () => {
  const user = {
    _id: 'patient-e2e-1',
    name: 'Ana Torres',
    email: 'ana.torres@respicare.com',
    role: 'patient',
  }

  beforeEach(() => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token', refreshToken: 'mock-refresh-token', user },
    }).as('loginRequest')
    cy.intercept('GET', '**/api/v1/dashboard/patient', {
      statusCode: 200,
      body: { success: true, data: { totalHistories: 2, upcomingAppointments: 0, pendingAlerts: 0 } },
    }).as('dashboardStats')
    cy.intercept('GET', '**/api/v1/appointments/me/upcoming*', {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as('upcomingAppointments')
    cy.intercept('GET', '**/api/v1/alerts*', {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as('alertsList')

    cy.visit('/')
    cy.get('input[type="email"]').type(user.email)
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Iniciar Sesión').click()
    cy.wait('@loginRequest')
    cy.contains(`Hola, ${user.name.split(' ')[0]}`, { timeout: 10000 }).should('be.visible')
  })

  const setBrowserOnline = (online) => {
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'onLine', { value: online, configurable: true })
      win.dispatchEvent(new Event(online ? 'online' : 'offline'))
    })
  }

  it('muestra el indicador "Sincronizado" cuando hay conexión', () => {
    cy.contains('Sincronizado').should('be.visible')
  })

  it('detecta la pérdida de conexión y muestra "Sin conexión"', () => {
    cy.contains('Sincronizado').should('be.visible')

    setBrowserOnline(false)

    cy.contains('Sin conexión').should('be.visible')
  })

  it('detecta la recuperación de conexión y vuelve a mostrar "Sincronizado"', () => {
    setBrowserOnline(false)
    cy.contains('Sin conexión').should('be.visible')

    setBrowserOnline(true)

    cy.contains('Sincronizado').should('be.visible')
  })
})
