import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'

export interface PatientSearchResult {
  _id: string
  name: string
  email: string
  createdAt?: string
}

class PatientService {
  async search(query: string): Promise<PatientSearchResult[]> {
    const q = encodeURIComponent(query.trim())
    const url = q ? `${API_ENDPOINTS.patients.search}?q=${q}` : API_ENDPOINTS.patients.search
    const response = await apiClient.get<{ success: boolean; data: PatientSearchResult[] } | PatientSearchResult[]>(url)
    if (Array.isArray(response)) return response
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: PatientSearchResult[] }).data ?? []
    }
    return []
  }
}

export const patientService = new PatientService()
