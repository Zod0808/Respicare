'use client'

/**
 * Nombre de Objeto: aspect-ratio
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: Transversal/Infraestructura - librería de componentes ui genéricos
 * (shadcn)
 * Descripción: Aspect ratio. Parte de: librería de componentes ui genéricos (shadcn).
 */

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
