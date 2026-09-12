// E2E — RespiCare Mobile (CP-018)
// Flujo: login -> dashboard -> análisis de síntomas.
// Ejercita la capa web del híbrido Capacitor (misma UI del WebView nativo)
// contra un `next dev` real, interceptando las llamadas al backend.

describe('Login -> Dashboard -> Análisis de síntomas', () => {
  const user = {
    _id: 'patient-e2e-1',
    name: 'Ana Torres',
    email: 'ana.torres@respicare.com',
    role: 'patient',
  }

  beforeEach(() => {
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
  })

  it('permite iniciar sesión y llegar al dashboard', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token', refreshToken: 'mock-refresh-token', user },
    }).as('loginRequest')

    cy.visit('/')
    cy.get('input[type="email"]').type(user.email)
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Iniciar Sesión').click()

    cy.wait('@loginRequest')
    cy.contains(`Hola, ${user.name.split(' ')[0]}`, { timeout: 10000 }).should('be.visible')
  })

  it('muestra un error con credenciales inválidas y permanece en el login', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 401,
      body: { message: 'Credenciales inválidas' },
    }).as('loginError')

    cy.visit('/')
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpass')
    cy.contains('button', 'Iniciar Sesión').click()

    cy.wait('@loginError')
    cy.contains(/credenciales inválidas/i).should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
  })

  it('completa el flujo de análisis de síntomas end-to-end tras iniciar sesión', () => {
    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token', refreshToken: 'mock-refresh-token', user },
    }).as('loginRequest')

    cy.intercept('POST', '**/api/v1/symptom-analyzer/analyze', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Análisis completado',
        data: {
          patient_id: user._id,
          analyzed_at: new Date().toISOString(),
          urgency_level: 'medium',
          severity_score: 5,
          classification: {
            urgency: 'medium',
            severity_score: 5,
            recommendation: 'Se recomienda reposo y control en 48 horas.',
            categories: ['Respiratorio'],
            confidence: 0.82,
          },
          recommendations: ['Reposo', 'Hidratación abundante'],
          warning_signs: [],
          follow_up_required: true,
          confidence_score: 0.82,
          processing_time_ms: 128,
        },
      },
    }).as('analyzeSymptoms')

    cy.visit('/')
    cy.get('input[type="email"]').type(user.email)
    cy.get('input[type="password"]').type('Password123!')
    cy.contains('button', 'Iniciar Sesión').click()
    cy.wait('@loginRequest')
    cy.contains(`Hola, ${user.name.split(' ')[0]}`, { timeout: 10000 }).should('be.visible')

    cy.contains('Nuevo Síntoma').click()
    cy.contains('Síntomas Comunes').should('be.visible')
    cy.contains('button', 'Tos seca').click()
    cy.contains('h3', 'Agregar Síntoma').should('be.visible')
    cy.contains('button', 'Agregar Síntoma').click()
    cy.contains('button', /^Analizar Síntomas \(1\)$/).click()

    cy.wait('@analyzeSymptoms')
    cy.contains('Resultados del Análisis').should('be.visible')
    cy.contains('MEDIUM').should('be.visible')
    cy.contains('Se recomienda reposo y control en 48 horas.').should('be.visible')
  })
})
