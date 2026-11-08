"""
Nombre de Objeto: __init__
Fecha de Creación: 2026-04-25
Propietario: Cesar Fabian Chavez Linares
Requerimiento: Transversal/Infraestructura - pipeline de mlops
(entrenamiento/validación/análisis/etl)
Descripción: Inicialización del módulo. Parte de: pipeline de mlops
(entrenamiento/validación/análisis/etl).

Scripts de validación de modelos
"""

import sys
from pathlib import Path

# Agregar raíz del proyecto al path para imports
project_root = Path(__file__).parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

