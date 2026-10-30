"""
Tests for api/routes/symptom_ml_analyzer.py

Focus: RF-005 medical coherence validation is applied to every real prediction
returned by POST /v1/ml-analyze (the endpoint actually consumed by the patient),
not just inside the offline training script.
"""

import pytest
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.routes.symptom_ml_analyzer import router, _apply_medical_validation, SymptomMLOutput


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


class TestApplyMedicalValidation:
    def test_adjusts_confidence_and_flags_incoherent_prediction(self):
        response = SymptomMLOutput(disease='neumonia', confidence=0.9, urgency_level='medium')

        validated = _apply_medical_validation(response, symptoms_str='dolor de cabeza', patient_age=40)

        assert validated.is_clinically_coherent is False
        assert validated.coherence_warnings != []
        assert validated.confidence == pytest.approx(0.75)

    def test_leaves_coherent_prediction_untouched(self):
        response = SymptomMLOutput(disease='neumonia', confidence=0.9, urgency_level='medium')

        validated = _apply_medical_validation(response, symptoms_str='fiebre, tos', patient_age=40)

        assert validated.is_clinically_coherent is True
        assert validated.coherence_warnings == []
        assert validated.confidence == pytest.approx(0.9)

    def test_confidence_never_drops_below_zero(self):
        response = SymptomMLOutput(disease='bronquiolitis', confidence=0.1, urgency_level='low')

        validated = _apply_medical_validation(response, symptoms_str='tos', patient_age=80)

        assert validated.confidence == 0.0


class TestMlAnalyzeEndpoint:
    """Uses the global shap_explainer mock registered in tests/conftest.py
    (disease='resfriado', confidence=0.8) via the non-ensemble fallback path."""

    def test_incoherent_prediction_lowers_confidence_and_reports_warnings(self, client):
        response = client.post(
            '/v1/ml-analyze?use_ensemble=false',
            json={'symptoms': ['tos'], 'patient_age': 30}
        )

        assert response.status_code == 200
        data = response.json()
        assert data['disease'] == 'resfriado'
        assert data['is_clinically_coherent'] is False
        assert data['coherence_warnings'] != []
        assert data['confidence'] == pytest.approx(0.65)

    def test_coherent_prediction_keeps_original_confidence(self, client):
        response = client.post(
            '/v1/ml-analyze?use_ensemble=false',
            json={'symptoms': ['congestión nasal'], 'patient_age': 30}
        )

        assert response.status_code == 200
        data = response.json()
        assert data['disease'] == 'resfriado'
        assert data['is_clinically_coherent'] is True
        assert data['coherence_warnings'] == []
        assert data['confidence'] == pytest.approx(0.8)

    # --- Sprint 13: vitales de wearables ---

    def test_no_vitals_field_behaves_exactly_as_before(self, client):
        response = client.post(
            '/v1/ml-analyze?use_ensemble=false',
            json={'symptoms': ['congestión nasal'], 'patient_age': 30}
        )

        assert response.status_code == 200
        data = response.json()
        assert data['urgency_level'] == 'medium'
        assert data['needs_medical_attention'] is False

    def test_critical_vitals_escalate_urgency_and_confidence(self, client):
        response = client.post(
            '/v1/ml-analyze?use_ensemble=false',
            json={
                'symptoms': ['congestión nasal'],
                'patient_age': 30,
                'vitals': {'oxygen_saturation': 85},
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data['urgency_level'] == 'high'
        assert data['needs_medical_attention'] is True
        assert data['is_clinically_coherent'] is False
        assert any('crítica' in warning for warning in data['coherence_warnings'])
        assert data['confidence'] == pytest.approx(0.9)

    def test_normal_vitals_do_not_change_prediction(self, client):
        response = client.post(
            '/v1/ml-analyze?use_ensemble=false',
            json={
                'symptoms': ['congestión nasal'],
                'patient_age': 30,
                'vitals': {'oxygen_saturation': 98, 'heart_rate': 75, 'respiratory_rate': 16},
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data['urgency_level'] == 'medium'
        assert data['needs_medical_attention'] is False
        assert data['is_clinically_coherent'] is True
        assert data['confidence'] == pytest.approx(0.8)

    def test_pattern_fallback_translates_spanish_urgency_to_english(self, client):
        """Regresión: cuando ambos modelos ML fallan al cargar, el endpoint
        recurre a _classify_by_patterns(), que reporta 'urgency' en español
        ('alta' para neumonía). Sin traducir a inglés, urgency_level quedaba
        en español (inconsistente con el resto del endpoint) y
        needs_medical_attention quedaba siempre en False, ya que 'alta'
        nunca es igual a 'high'/'critical'."""
        with patch('shap_explainer.SHAPDiseaseExplainer', side_effect=Exception('no model available')):
            response = client.post(
                '/v1/ml-analyze?use_ensemble=false',
                json={
                    'symptoms': ['fiebre alto', 'dificultad para respirar', 'tos', 'dolor torácico de pecho'],
                    'patient_age': 30
                }
            )

        assert response.status_code == 200
        data = response.json()
        assert data['urgency_level'] == 'high'
        assert data['needs_medical_attention'] is True
