/**
 * Nombre de Objeto: EducationalContentPage
 * Fecha de Creación: 2026-09-02
 * Propietario: Cesar Fabian Chavez Linares
 * Requerimiento: RF-011 - Módulo educativo
 * Descripción: Página contenedora que renderiza la gestión de contenido
 * educativo dentro del layout clínico estándar.
 */
import React from 'react';
import EducationalContentManagement from '../components/EducationalContentManagement';
import './clinical.css';

const EducationalContentPage = () => (
  <div className="clinical-page">
    <div className="clinical-page-header">
      <h1>📚 Contenido Educativo</h1>
    </div>
    <EducationalContentManagement />
  </div>
);

export default EducationalContentPage;
