/**
 * Nombre de Objeto: HeatMapPage
 * Fecha de Creación: 2026-04-25
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-010 - Reportes y estadísticas
 * Descripción: Página web de heat map.
 */

import React, { Suspense, lazy } from 'react';
import './HeatMapPage.css';

const InteractiveHeatMap = lazy(() => import('../components/InteractiveHeatMap'));

function HeatMapPage() {
  return (
    <div className="heatmap-page">
      <Suspense fallback={<div className="heatmap-loading">Cargando mapa epidemiológico…</div>}>
        <InteractiveHeatMap />
      </Suspense>
    </div>
  );
}

export default HeatMapPage;
