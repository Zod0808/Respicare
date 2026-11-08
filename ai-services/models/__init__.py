"""
Nombre de Objeto: __init__
Fecha de Creación: 2026-06-27
Propietario: Cesar Fabian Chavez Linares
Requerimiento: Transversal/Infraestructura - infraestructura/mlops del microservicio
de ia
Descripción: Inicialización del módulo. Parte de: infraestructura/mlops del
microservicio de ia.
"""

# AI Models for RespiCare

try:
    from .model_manager import model_manager
    __all__ = ['model_manager']
except ImportError as e:
    print(f"Warning: Could not import model_manager: {e}")
    # Crear un model_manager dummy para desarrollo
    class DummyModelManager:
        def __init__(self):
            pass
        
        def get_model(self, name):
            return None
    
    model_manager = DummyModelManager()
    __all__ = ['model_manager']