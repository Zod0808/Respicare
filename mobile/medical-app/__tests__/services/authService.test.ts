import { authService } from '@/lib/api/services/authService'
import { apiClient } from '@/lib/api/client'
import { setAuthTokens, setUser } from '@/lib/api/config'

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}))

jest.mock('@/lib/api/config', () => ({
  ...jest.requireActual('@/lib/api/config'),
  setAuthTokens: jest.fn(),
  setUser: jest.fn(),
  clearAuthTokens: jest.fn(),
}))

const mockAuthResponse = (role: 'patient' | 'doctor' | 'admin') => ({
  token: 'token-123',
  refreshToken: 'refresh-123',
  user: { _id: 'u-1', name: 'Test User', email: 'test@example.com', role },
})

describe('authService.login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('logs in a patient and persists tokens/user', async () => {
    const response = mockAuthResponse('patient')
    ;(apiClient.post as jest.Mock).mockResolvedValue(response)

    const result = await authService.login({ email: 'p@test.com', password: 'secret' })

    expect(result).toBe(response)
    expect(setAuthTokens).toHaveBeenCalledWith(response.token, response.refreshToken)
    expect(setUser).toHaveBeenCalledWith(response.user)
  })

  it('rejects a doctor login without persisting tokens/user', async () => {
    const response = mockAuthResponse('doctor')
    ;(apiClient.post as jest.Mock).mockResolvedValue(response)

    await expect(
      authService.login({ email: 'doc@test.com', password: 'secret' })
    ).rejects.toThrow(/solo para pacientes/i)

    expect(setAuthTokens).not.toHaveBeenCalled()
    expect(setUser).not.toHaveBeenCalled()
  })

  it('rejects an admin login without persisting tokens/user', async () => {
    const response = mockAuthResponse('admin')
    ;(apiClient.post as jest.Mock).mockResolvedValue(response)

    await expect(
      authService.login({ email: 'admin@test.com', password: 'secret' })
    ).rejects.toThrow(/solo para pacientes/i)

    expect(setAuthTokens).not.toHaveBeenCalled()
    expect(setUser).not.toHaveBeenCalled()
  })
})
