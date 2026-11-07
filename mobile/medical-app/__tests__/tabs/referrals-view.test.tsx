import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReferralsView } from '@/components/tabs/referrals-view'
import { referralService } from '@/lib/api/services/referralService'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockUser = { _id: 'pat-1', name: 'Ana Flores', role: 'patient' }

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (s: any) => any) => selector({ user: mockUser }),
}))

jest.mock('@/lib/api/services/referralService', () => ({
  referralService: {
    getMyReferrals: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const referral = {
  _id: 'ref-1',
  patientId: 'pat-1',
  patientName: 'Ana Flores',
  referringDoctorId: 'doc-2',
  referringDoctorName: 'Dra. Remitente',
  referredToDoctorId: 'doc-1',
  referredToDoctorName: 'Dr. Autor',
  referredToSpecialty: 'Neumología',
  referralType: 'specialist',
  priority: 'high',
  status: 'pending',
  reason: 'Dificultad respiratoria persistente',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const inProgressReferral = { ...referral, _id: 'ref-3', status: 'in_progress' }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ReferralsView', () => {
  it('renders the referral list with patient name and specialty', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([referral])
    render(<ReferralsView />)
    expect(await screen.findByText('Ana Flores')).toBeInTheDocument()
    expect(screen.getByText('Neumología')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('renders an in_progress referral without crashing', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([inProgressReferral])
    render(<ReferralsView />)
    expect(await screen.findByText('En Progreso')).toBeInTheDocument()
  })

  it('shows a read-only detail view with no accept/reject/complete actions', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([referral])
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    await screen.findByText('Detalle de Referido')
    expect(screen.getByText('Dr. Autor')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /marcar como completado/i })).not.toBeInTheDocument()
  })

  it('returns to the list when going back from the detail view', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([referral])
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    await screen.findByText('Detalle de Referido')
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(await screen.findByText('Referidos Médicos')).toBeInTheDocument()
  })
})
