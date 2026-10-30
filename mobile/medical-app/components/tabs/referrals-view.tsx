"use client"

import { useState, useEffect } from "react"
import { Share2, CheckCircle2, XCircle, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react"
import { ModernButton } from "@/components/ui/ModernButton"
import { ModernCard } from "@/components/ui/ModernCard"
import type { ViewState } from "@/lib/translations"
import { useAppStore } from "@/store/useAppStore"
import { referralService, type Referral } from "@/lib/api/services/referralService"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReferralsViewProps { setCurrentView?: (view: ViewState) => void }

const STATUS_CONFIG: Record<Referral['status'], { label: string; color: string }> = {
  pending:     { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-700' },
  accepted:    { label: 'Aceptado',     color: 'bg-green-100 text-green-700' },
  in_progress: { label: 'En Progreso',  color: 'bg-purple-100 text-purple-700' },
  completed:   { label: 'Completado',   color: 'bg-blue-100 text-blue-700' },
  rejected:    { label: 'Rechazado',    color: 'bg-red-100 text-red-600' },
  cancelled:   { label: 'Cancelado',    color: 'bg-gray-100 text-gray-600' },
}

const PRIORITY_CONFIG: Record<Referral['priority'], { label: string; color: string }> = {
  low:    { label: 'Baja',    color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Media',   color: 'bg-blue-50 text-blue-600' },
  high:   { label: 'Alta',    color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
}

export function ReferralsView({ setCurrentView }: ReferralsViewProps) {
  const user = useAppStore(s => s.user)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Referral | null>(null)

  useEffect(() => { loadReferrals() }, [user])

  const loadReferrals = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await referralService.getMyReferrals()
      setReferrals(data)
    } catch (err: any) {
      if (err?.status !== 401) toast.error("Error al cargar referidos")
    } finally {
      setIsLoading(false)
    }
  }

  if (selected) {
    return <ReferralDetail referral={selected} onBack={() => setSelected(null)} onUpdate={loadReferrals} />
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {setCurrentView && (
            <button onClick={() => setCurrentView('dashboard')} className="p-1 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold dark:text-white">Referidos Médicos</h2>
            <p className="text-sm text-muted-foreground">{referrals.length} referidos</p>
          </div>
        </div>
        <ModernButton size="sm" variant="ghost" onClick={loadReferrals} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </ModernButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>
      ) : referrals.length === 0 ? (
        <ModernCard className="p-8 text-center">
          <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold dark:text-white">Sin referidos</p>
          <p className="text-sm text-muted-foreground mt-1">No tienes referidos médicos registrados.</p>
        </ModernCard>
      ) : (
        <div className="space-y-3">
          {referrals.map(ref => {
            const sc = STATUS_CONFIG[ref.status]
            const pc = PRIORITY_CONFIG[ref.priority]
            return (
              <ModernCard key={ref._id} className="p-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setSelected(ref)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
                    </div>
                    <p className="font-semibold text-sm dark:text-white">{ref.patientName}</p>
                    {ref.referredToSpecialty && (
                      <p className="text-xs text-muted-foreground">{ref.referredToSpecialty}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ref.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(ref.requestedDate || ref.createdAt), "d MMM yyyy", { locale: es })}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </ModernCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReferralDetail({ referral: ref, onBack, onUpdate }: { referral: Referral; onBack: () => void; onUpdate: () => void }) {
  const user = useAppStore(s => s.user)
  const sc = STATUS_CONFIG[ref.status]
  const pc = PRIORITY_CONFIG[ref.priority]
  const isDoctor = user?.role === 'doctor'
  const isAssignedToMe = !ref.referredToDoctorId || ref.referredToDoctorId === user?._id
  const isMineToManage = isDoctor && ref.referredToDoctorId === user?._id
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectError, setRejectError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAccept = async () => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await referralService.accept(ref._id, user._id)
      toast.success("Referido aceptado")
      onUpdate(); onBack()
    } catch {
      toast.error("Error al aceptar referido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Por favor proporciona una razón")
      return
    }
    setIsSubmitting(true)
    try {
      await referralService.reject(ref._id, rejectReason.trim())
      toast.success("Referido rechazado")
      onUpdate(); onBack()
    } catch {
      toast.error("Error al rechazar referido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await referralService.complete(ref._id)
      toast.success("Referido completado")
      onUpdate(); onBack()
    } catch {
      toast.error("Error al completar referido")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <ModernButton size="sm" variant="ghost" onClick={onBack}>← Volver</ModernButton>
        <h2 className="text-lg font-bold dark:text-white">Detalle de Referido</h2>
      </div>

      <ModernCard className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pc.color}`}>{pc.label}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Paciente</p>
          <p className="font-semibold dark:text-white">{ref.patientName}</p>
        </div>
        {ref.referredToSpecialty && (
          <div>
            <p className="text-xs text-muted-foreground">Especialidad referida</p>
            <p className="font-semibold dark:text-white">{ref.referredToSpecialty}</p>
          </div>
        )}
        {ref.referredToDoctorName && (
          <div>
            <p className="text-xs text-muted-foreground">Doctor Destino</p>
            <p className="text-sm dark:text-white">{ref.referredToDoctorName}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Motivo</p>
          <p className="text-sm dark:text-white">{ref.reason}</p>
        </div>
        {ref.clinicalNotes && (
          <div>
            <p className="text-xs text-muted-foreground">Notas Clínicas</p>
            <p className="text-sm dark:text-white">{ref.clinicalNotes}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-2">
          <span>Creado: {format(new Date(ref.requestedDate || ref.createdAt), "d MMM yyyy", { locale: es })}</span>
          {ref.acceptedDate && <span>Aceptado: {format(new Date(ref.acceptedDate), "d MMM yyyy", { locale: es })}</span>}
          {ref.completedDate && <span>Completado: {format(new Date(ref.completedDate), "d MMM yyyy", { locale: es })}</span>}
        </div>
      </ModernCard>

      {isRejecting ? (
        <ModernCard className="p-4 space-y-3">
          <label className="text-sm font-medium dark:text-white block">Razón del Rechazo *</label>
          <textarea
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); setRejectError("") }}
            placeholder="Describe la razón del rechazo..."
            rows={3}
            maxLength={500}
            className={`w-full px-3 py-2 rounded-lg border ${
              rejectError ? 'border-red-500' : 'border-border/50 dark:border-slate-700'
            } bg-background dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
          />
          {rejectError && <p className="text-xs text-red-500">{rejectError}</p>}
          <div className="flex gap-3">
            <ModernButton
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirmar Rechazo
            </ModernButton>
            <ModernButton
              variant="ghost"
              className="flex-1"
              onClick={() => { setIsRejecting(false); setRejectReason(""); setRejectError("") }}
              disabled={isSubmitting}
            >
              Cancelar
            </ModernButton>
          </div>
        </ModernCard>
      ) : (
        <>
          {isDoctor && ref.status === 'pending' && isAssignedToMe && (
            <div className="flex gap-3">
              <ModernButton variant="primary" className="flex-1" onClick={handleAccept} isLoading={isSubmitting} disabled={isSubmitting}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Aceptar
              </ModernButton>
              {isMineToManage && (
                <ModernButton variant="ghost" className="flex-1 text-red-600" onClick={() => setIsRejecting(true)} disabled={isSubmitting}>
                  <XCircle className="w-4 h-4 mr-2" /> Rechazar
                </ModernButton>
              )}
            </div>
          )}
          {(ref.status === 'accepted' || ref.status === 'in_progress') && isMineToManage && (
            <ModernButton className="w-full" onClick={handleComplete} isLoading={isSubmitting} disabled={isSubmitting}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Completado
            </ModernButton>
          )}
        </>
      )}
    </div>
  )
}
