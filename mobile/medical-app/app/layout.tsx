/**
 * Nombre de Objeto: RootLayout
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal — layout raíz de la app móvil (Capacitor + Next.js),
 * provee contexto de Capacitor/sincronización offline/performance para todos los RF
 * Descripción: Root layout de Next.js: define fuentes y metadata, y envuelve la app
 * con CapacitorProvider, OfflineSyncProvider y PerformanceProvider.
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { CapacitorProvider } from '@/components/providers/capacitor-provider'
import { OfflineSyncProvider } from '@/components/providers/offline-sync-provider'
import { PerformanceProvider } from '@/components/providers/performance-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'RespiCare - Sistema de Enfermedades Respiratorias',
  description: 'Aplicación móvil para gestión de enfermedades respiratorias',
  generator: 'RespiCare',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <CapacitorProvider>
          <PerformanceProvider>
            <OfflineSyncProvider>
              {children}
            </OfflineSyncProvider>
          </PerformanceProvider>
        </CapacitorProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
