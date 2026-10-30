import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReferralsView } from '@/components/tabs/referrals-view'
import { referralService } from '@/lib/api/services/referralService'

// ── Mocks ──────────────────────────────────────────────────────────────────

let mockUser: any = { _id: 'doc-1', name: 'Dr. Autor', role: 'doctor' }

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (s: any) => any) => selector({ user: mockUser }),
}))

jest.mock('@/lib/api/services/referralService', () => ({
  referralService: {
    getMyReferrals: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
    complete: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const assignedToMeReferral = {
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

const assignedToSomeoneElseReferral = {
  ...assignedToMeReferral,
  _id: 'ref-2',
  referredToDoctorId: 'doc-99',
  referredToDoctorName: 'Otro Doctor',
}

const inProgressReferral = {
  ...assignedToMeReferral,
  _id: 'ref-3',
  status: 'in_progress',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUser = { _id: 'doc-1', name: 'Dr. Autor', role: 'doctor' }
})

describe('ReferralsView', () => {
  it('renders the referral list with patient name and specialty', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToMeReferral])
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

  it('shows accept and reject actions when the referral is assigned to the logged-in doctor', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToMeReferral])
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    expect(await screen.findByRole('button', { name: /aceptar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument()
  })

  it('hides reject when the referral is assigned to a different doctor', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToSomeoneElseReferral])
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    await screen.findByText('Detalle de Referido')
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument()
  })

  it('accepts a referral using the logged-in doctor id, not just notes', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToMeReferral])
    ;(referralService.accept as jest.Mock).mockResolvedValue({})
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    fireEvent.click(await screen.findByRole('button', { name: /aceptar/i }))
    await waitFor(() => {
      expect(referralService.accept).toHaveBeenCalledWith('ref-1', 'doc-1')
    })
  })

  it('requires a reason before confirming rejection', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToMeReferral])
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    fireEvent.click(await screen.findByRole('button', { name: /rechazar/i }))
    fireEvent.click(await screen.findByRole('button', { name: /confirmar rechazo/i }))
    expect(await screen.findByText(/por favor proporciona una razón/i)).toBeInTheDocument()
    expect(referralService.reject).not.toHaveBeenCalled()
  })

  it('rejects a referral with the typed reason', async () => {
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([assignedToMeReferral])
    ;(referralService.reject as jest.Mock).mockResolvedValue({})
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    fireEvent.click(await screen.findByRole('button', { name: /rechazar/i }))
    const textarea = await screen.findByPlaceholderText(/describe la razón del rechazo/i)
    fireEvent.change(textarea, { target: { value: 'No corresponde a mi especialidad' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar rechazo/i }))
    await waitFor(() => {
      expect(referralService.reject).toHaveBeenCalledWith('ref-1', 'No corresponde a mi especialidad')
    })
  })

  it('shows complete action for accepted referrals assigned to the logged-in doctor', async () => {
    const accepted = { ...assignedToMeReferral, status: 'accepted' }
    ;(referralService.getMyReferrals as jest.Mock).mockResolvedValue([accepted])
    ;(referralService.complete as jest.Mock).mockResolvedValue({})
    render(<ReferralsView />)
    fireEvent.click(await screen.findByText('Ana Flores'))
    fireEvent.click(await screen.findByRole('button', { name: /marcar como completado/i }))
    await waitFor(() => {
      expect(referralService.complete).toHaveBeenCalledWith('ref-1')
    })
  })
})
