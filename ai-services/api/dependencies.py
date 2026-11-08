"""
Nombre de Objeto: dependencies
Fecha de Creación: 2026-08-06
Propietario: Cesar Fabian Chavez Linares
Requerimiento: Transversal/Infraestructura - infraestructura/mlops del microservicio
de ia
Descripción: Dependencies. Parte de: infraestructura/mlops del microservicio de ia.

Shared FastAPI dependency providers for AI service/model singletons.
"""

from models.model_manager import model_manager as _model_manager
from services.ai_service_manager import ai_service_manager as _ai_service_manager


def get_model_manager():
    """Dependency provider for the global ModelManager singleton"""
    return _model_manager


def get_service_manager():
    """Dependency provider for the global AIServiceManager singleton"""
    return _ai_service_manager
