/**
 * Servicio de Referidos Médicos
 */

import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'

export type ReferralStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
export type ReferralPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ReferralType = 'consultation' | 'specialist' | 'diagnostic' | 'treatment' | 'follow_up' | 'emergency'

export interface Referral {
  _id: string
  patientId: string
  patientName: string
  referringDoctorId: string
  referringDoctorName: string
  referredToDoctorId?: string
  referredToDoctorName?: string
  referredToSpecialty?: string
  referralType: ReferralType
  priority: ReferralPriority
  status: ReferralStatus
  reason: string
  clinicalNotes?: string
  requestedDate?: string
  acceptedDate?: string
  completedDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReferralRequest {
  patientId: string
  patientName: string
  referringDoctorId: string
  referringDoctorName: string
  referralType: ReferralType
  reason: string
  priority?: ReferralPriority
  clinicalNotes?: string
  referredToDoctorId?: string
  referredToSpecialty?: string
  requestedDate?: string
}

export interface ReferralFilters {
  page?: number
  limit?: number
  status?: ReferralStatus
  patientId?: string
  priority?: ReferralPriority
}

class ReferralService {
  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
      return response.data as T
    }
    return response as T
  }

  async list(filters?: ReferralFilters): Promise<{ data: Referral[]; total: number }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.status) params.append('status', filters.status)
    if (filters?.patientId) params.append('patientId', filters.patientId)
    if (filters?.priority) params.append('priority', filters.priority)

    const query = params.toString()
    const url = query ? `${API_ENDPOINTS.referrals.list}?${query}` : API_ENDPOINTS.referrals.list
    const response = await apiClient.get<any>(url)
    const data = this.unwrap<any>(response)
    if (Array.isArray(data)) return { data, total: data.length }
    return data
  }

  async get(id: string): Promise<Referral> {
    const response = await apiClient.get<any>(API_ENDPOINTS.referrals.get(id))
    return this.unwrap<Referral>(response)
  }

  async getMyReferrals(): Promise<Referral[]> {
    const response = await apiClient.get<any>(API_ENDPOINTS.referrals.myReferrals)
    const data = this.unwrap<any>(response)
    return Array.isArray(data) ? data : data?.data ?? []
  }

  async create(data: CreateReferralRequest): Promise<Referral> {
    const response = await apiClient.post<any>(API_ENDPOINTS.referrals.create, data)
    return this.unwrap<Referral>(response)
  }

  async accept(id: string, referredToDoctorId: string, notes?: string): Promise<Referral> {
    const response = await apiClient.post<any>(API_ENDPOINTS.referrals.accept(id), { referredToDoctorId, notes })
    return this.unwrap<Referral>(response)
  }

  async reject(id: string, reason: string): Promise<Referral> {
    const response = await apiClient.post<any>(API_ENDPOINTS.referrals.reject(id), { reason })
    return this.unwrap<Referral>(response)
  }

  async complete(id: string, notes?: string): Promise<Referral> {
    const response = await apiClient.post<any>(API_ENDPOINTS.referrals.complete(id), { notes })
    return this.unwrap<Referral>(response)
  }
}

export const referralService = new ReferralService()
