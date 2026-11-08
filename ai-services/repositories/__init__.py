"""
Nombre de Objeto: __init__
Fecha de Creación: 2026-04-25
Propietario: Cesar Fabian Chavez Linares
Requerimiento: Transversal/Infraestructura - infraestructura/mlops del microservicio
de ia
Descripción: Inicialización del módulo. Parte de: infraestructura/mlops del
microservicio de ia.

Repository Pattern Implementation
"""

from .base_repository import BaseRepository, IRepository
from .medical_history_repository import MedicalHistoryRepository
from .ai_result_repository import AIResultRepository
from .patient_repository import PatientRepository

__all__ = [
    'BaseRepository',
    'IRepository',
    'MedicalHistoryRepository',
    'AIResultRepository', 
    'PatientRepository'
]
