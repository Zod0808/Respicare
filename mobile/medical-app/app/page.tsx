/**
 * Nombre de Objeto: Page (root)
 * Fecha de Creación: 2026-11-06
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: N/A - Punto de entrada de ruta Next.js; no implementa un RF
 * propio, no aparece como objeto en la Matriz de Trazabilidad.
 * Descripción: Página raíz ("/") de la app móvil. Delega todo el render en
 * el componente MedicalApp.
 */
import { MedicalApp } from "@/components/medical-app"

export default function Page() {
  return <MedicalApp />
}
