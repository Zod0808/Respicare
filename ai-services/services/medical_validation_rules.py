"""
Nombre de Objeto: MedicalValidationRules
Fecha de Creación: 2026-09-02
Propietario: Cesar Fabian Chavez Linares
Requerimiento: RF-005 - Validación de coherencia médica
Descripción: Reglas de coherencia clínica (edad, síntomas requeridos, umbrales
de vitales de wearables) que se aplican sobre la predicción de enfermedad del
modelo de ML para detectar diagnósticos clínicamente implausibles.

Medical Validation Rules

Coherence checks applied to a predicted disease given the reported symptoms
and patient age, to catch clinically implausible predictions before they
reach the patient (RF-005).
"""

from typing import Any, Dict, Optional


class MedicalValidationRules:
    """Medical validation rules to ensure plausible predictions"""

    def __init__(self):
        self.validation_rules = {
            'required_symptoms': {
                'asma': ['sibilancias', 'dificultad respiratoria'],
                'neumonia': ['fiebre', 'tos'],
                'bronquitis': ['tos'],
                'covid-19': ['fiebre', 'tos'],
                'influenza': ['fiebre'],
                'epoc': ['tos crónica', 'disnea'],
                'resfriado': ['congestión nasal'],
                'sinusitis': ['dolor facial'],
                'faringitis': ['dolor de garganta'],
                'rinitis': ['estornudos', 'congestión nasal']
            },
            'symptom_intensity': {
                'asma': {'sibilancias': 'required'},
                'neumonia': {'fiebre': 'high', 'tos': 'required'},
                'influenza': {'fiebre': 'high'},
                'resfriado': {'fiebre': 'low'}
            },
            'age_restrictions': {
                'bronquiolitis': (0, 2),  # Only in infants
                'crup': (1, 5),  # Common in toddlers
                'enfisema': (50, 100)  # Common in elderly
            },
            # Sprint 13: umbrales clínicos para vitales de wearables (SpO2, FC, FR)
            'vitals_thresholds': {
                'oxygen_saturation': {'severe_low': 90, 'mild_low': 94},
                'respiratory_rate': {'severe_high': 30, 'mild_high': 24},
                'heart_rate': {'severe_high': 120, 'mild_high': 100},
            }
        }

    def validate_vitals(self, vitals: Dict[str, float]) -> Dict[str, Any]:
        """
        Evalúa signos vitales de wearables (SpO2, frecuencia respiratoria, frecuencia
        cardíaca) capturados cerca del reporte de síntomas (Sprint 13).

        No reemplaza al modelo de ML: es una capa de seguridad clínica adicional que
        ajusta la confianza y puede escalar la urgencia cuando los vitales sugieren
        mayor severidad de la reflejada en la predicción de síntomas.
        """
        thresholds = self.validation_rules['vitals_thresholds']
        result: Dict[str, Any] = {
            'warnings': [],
            'confidence_adjustment': 0.0,
            'urgency_escalation': False,
        }

        spo2 = vitals.get('oxygen_saturation')
        if spo2 is not None:
            if spo2 < thresholds['oxygen_saturation']['severe_low']:
                result['warnings'].append(
                    f"Saturación de oxígeno crítica ({spo2}%) reportada por wearable: "
                    "sugiere compromiso respiratorio significativo"
                )
                result['confidence_adjustment'] += 0.1
                result['urgency_escalation'] = True
            elif spo2 < thresholds['oxygen_saturation']['mild_low']:
                result['warnings'].append(
                    f"Saturación de oxígeno levemente baja ({spo2}%) reportada por wearable: "
                    "se recomienda monitoreo cercano"
                )
                result['confidence_adjustment'] += 0.05

        respiratory_rate = vitals.get('respiratory_rate')
        if respiratory_rate is not None:
            if respiratory_rate > thresholds['respiratory_rate']['severe_high']:
                result['warnings'].append(
                    f"Frecuencia respiratoria elevada ({respiratory_rate} rpm) reportada por wearable: "
                    "sugiere dificultad respiratoria significativa"
                )
                result['confidence_adjustment'] += 0.1
                result['urgency_escalation'] = True
            elif respiratory_rate > thresholds['respiratory_rate']['mild_high']:
                result['warnings'].append(
                    f"Frecuencia respiratoria por encima de lo normal ({respiratory_rate} rpm) reportada por wearable"
                )
                result['confidence_adjustment'] += 0.05

        heart_rate = vitals.get('heart_rate')
        if heart_rate is not None and heart_rate > thresholds['heart_rate']['severe_high']:
            result['warnings'].append(
                f"Frecuencia cardíaca elevada ({heart_rate} bpm) reportada por wearable: "
                "posible signo de estrés fisiológico"
            )
            result['confidence_adjustment'] += 0.05

        return result

    def validate_prediction(
        self,
        disease: str,
        symptoms: str,
        age: int,
        vitals: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Validate if predicted disease is plausible given symptoms, age and
        (optionally) wearable vitals captured near the time of the report (Sprint 13).

        Returns:
            Dict with validation status and any warnings
        """
        symptoms_lower = symptoms.lower()

        validation_status = {
            'is_valid': True,
            'warnings': [],
            'confidence_adjustment': 0.0,
            'urgency_escalation': False,
        }

        # Check age restrictions
        for disease_name, (min_age, max_age) in self.validation_rules['age_restrictions'].items():
            if disease_name.lower() in disease.lower():
                if not (min_age <= age <= max_age):
                    validation_status['warnings'].append(
                        f"Enfermedad '{disease}' típicamente presenta en edad {min_age}-{max_age}, paciente tiene {age} años"
                    )
                    validation_status['confidence_adjustment'] -= 0.2

        # Check required symptoms
        for disease_name, required in self.validation_rules['required_symptoms'].items():
            if disease_name.lower() in disease.lower():
                missing = []
                for req_symptom in required:
                    if req_symptom.lower() not in symptoms_lower:
                        missing.append(req_symptom)

                if missing:
                    validation_status['warnings'].append(
                        f"Faltan síntomas típicos de '{disease}': {', '.join(missing)}"
                    )
                    validation_status['confidence_adjustment'] -= 0.15

        # Sprint 13: incorporar vitales de wearables cuando están disponibles.
        # Fallback automático: si no hay vitales, el comportamiento es idéntico al anterior.
        if vitals:
            vitals_result = self.validate_vitals(vitals)
            validation_status['warnings'].extend(vitals_result['warnings'])
            validation_status['confidence_adjustment'] += vitals_result['confidence_adjustment']
            validation_status['urgency_escalation'] = vitals_result['urgency_escalation']

        if validation_status['warnings']:
            validation_status['is_valid'] = False

        return validation_status
