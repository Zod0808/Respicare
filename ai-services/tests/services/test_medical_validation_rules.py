"""
Tests for services/medical_validation_rules.py (RF-005: coherencia médica)
"""

import pytest

from services.medical_validation_rules import MedicalValidationRules


class TestMedicalValidationRules:
    @pytest.fixture
    def validator(self):
        return MedicalValidationRules()

    def test_valid_prediction_has_no_warnings(self, validator):
        result = validator.validate_prediction(
            disease='asma',
            symptoms='sibilancias, dificultad respiratoria, tos',
            age=30
        )

        assert result['is_valid'] is True
        assert result['warnings'] == []
        assert result['confidence_adjustment'] == 0.0

    def test_missing_required_symptoms_lowers_confidence(self, validator):
        result = validator.validate_prediction(
            disease='neumonia',
            symptoms='dolor de cabeza',
            age=40
        )

        assert result['is_valid'] is False
        assert result['confidence_adjustment'] == pytest.approx(-0.15)
        assert any('neumonia' in warning for warning in result['warnings'])

    def test_age_outside_typical_range_lowers_confidence(self, validator):
        result = validator.validate_prediction(
            disease='bronquiolitis',
            symptoms='tos, dificultad respiratoria',
            age=45
        )

        assert result['is_valid'] is False
        assert result['confidence_adjustment'] == pytest.approx(-0.2)
        assert any('45' in warning for warning in result['warnings'])

    def test_age_within_typical_range_has_no_age_warning(self, validator):
        result = validator.validate_prediction(
            disease='bronquiolitis',
            symptoms='tos',
            age=1
        )

        assert not any('típicamente presenta en edad' in warning for warning in result['warnings'])

    def test_combined_age_and_symptom_warnings_stack_adjustment(self, validator):
        result = validator.validate_prediction(
            disease='enfisema',
            symptoms='fiebre',
            age=20
        )

        # enfisema tiene restricción de edad (50-100) pero no síntomas requeridos definidos
        assert result['is_valid'] is False
        assert result['confidence_adjustment'] == pytest.approx(-0.2)

    def test_disease_not_covered_by_rules_is_valid(self, validator):
        result = validator.validate_prediction(
            disease='alergia estacional',
            symptoms='estornudos',
            age=25
        )

        assert result['is_valid'] is True
        assert result['confidence_adjustment'] == 0.0

    # --- Sprint 13: vitales de wearables ---

    def test_no_vitals_behaves_exactly_as_before(self, validator):
        result = validator.validate_prediction(
            disease='asma',
            symptoms='sibilancias, dificultad respiratoria',
            age=30,
            vitals=None
        )

        assert result['is_valid'] is True
        assert result['warnings'] == []
        assert result['confidence_adjustment'] == 0.0
        assert result['urgency_escalation'] is False

    def test_critical_spo2_escalates_urgency(self, validator):
        result = validator.validate_prediction(
            disease='asma',
            symptoms='sibilancias, dificultad respiratoria',
            age=30,
            vitals={'oxygen_saturation': 85}
        )

        assert result['urgency_escalation'] is True
        assert result['confidence_adjustment'] == pytest.approx(0.1)
        assert any('crítica' in warning for warning in result['warnings'])

    def test_mild_spo2_drop_does_not_escalate_urgency(self, validator):
        result = validator.validate_prediction(
            disease='asma',
            symptoms='sibilancias, dificultad respiratoria',
            age=30,
            vitals={'oxygen_saturation': 92}
        )

        assert result['urgency_escalation'] is False
        assert result['confidence_adjustment'] == pytest.approx(0.05)

    def test_high_respiratory_rate_escalates_urgency(self, validator):
        result = validator.validate_prediction(
            disease='neumonia',
            symptoms='fiebre, tos',
            age=40,
            vitals={'respiratory_rate': 32}
        )

        assert result['urgency_escalation'] is True
        assert result['confidence_adjustment'] == pytest.approx(0.1)

    def test_high_heart_rate_adds_warning_without_escalation(self, validator):
        result = validator.validate_prediction(
            disease='resfriado',
            symptoms='congestión nasal',
            age=25,
            vitals={'heart_rate': 130}
        )

        assert result['urgency_escalation'] is False
        assert result['confidence_adjustment'] == pytest.approx(0.05)

    def test_normal_vitals_add_no_warnings(self, validator):
        result = validator.validate_prediction(
            disease='asma',
            symptoms='sibilancias, dificultad respiratoria',
            age=30,
            vitals={'oxygen_saturation': 98, 'respiratory_rate': 16, 'heart_rate': 75}
        )

        assert result['is_valid'] is True
        assert result['warnings'] == []
        assert result['urgency_escalation'] is False

    def test_validate_vitals_directly(self, validator):
        result = validator.validate_vitals({'oxygen_saturation': 88, 'respiratory_rate': 35, 'heart_rate': 125})

        assert result['urgency_escalation'] is True
        assert len(result['warnings']) == 3
        assert result['confidence_adjustment'] == pytest.approx(0.25)
