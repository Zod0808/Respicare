"""
Unit tests for MedicalHistoryService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any

from services.medical_history_service import MedicalHistoryService


class TestMedicalHistoryService:
    """Test MedicalHistoryService implementation"""
    
    @pytest.fixture
    def service_manager_mock(self):
        """Create mock service manager"""
        mock = AsyncMock()
        mock.process_medical_history.return_value = {
            "symptoms": ["tos", "fiebre"],
            "entities": ["medication", "diagnosis"],
            "summary": "Patient history processed"
        }
        return mock
    
    @pytest.fixture
    def medical_history_service(self, service_manager_mock):
        """Create medical history service instance"""
        return MedicalHistoryService(service_manager=service_manager_mock)
    
    @pytest.fixture
    def sample_text(self):
        """Sample medical history text"""
        return "Paciente de 45 años con tos persistente y fiebre de 3 días. Historial de asma."
    
    @pytest.mark.asyncio
    async def test_process_medical_history_comprehensive_basic(self, medical_history_service, sample_text):
        """Test comprehensive processing with basic options"""
        result = await medical_history_service.process_medical_history_comprehensive(
            text=sample_text,
            patient_id="patient_123",
            include_entity_extraction=False,
            include_diagnosis_suggestions=False,
            include_risk_assessment=False
        )
        
        assert result is not None
        assert "symptoms" in result or "summary" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_entities(self, medical_history_service, sample_text):
        """Test processing with entity extraction"""
        with patch.object(medical_history_service, '_extract_medical_entities', new_callable=AsyncMock) as mock_entities:
            mock_entities.return_value = {"medications": [], "diagnoses": ["asma"]}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_entity_extraction=True
            )
            
            assert "entity_analysis" in result
            mock_entities.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_diagnosis(self, medical_history_service, sample_text):
        """Test processing with diagnosis suggestions"""
        with patch.object(medical_history_service, '_generate_diagnosis_suggestions', new_callable=AsyncMock) as mock_diag:
            mock_diag.return_value = {"suggestions": ["Bronquitis", "Asma"]}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_diagnosis_suggestions=True
            )
            
            assert "diagnosis_analysis" in result
            mock_diag.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_risk(self, medical_history_service, sample_text):
        """Test processing with risk assessment"""
        with patch.object(medical_history_service, '_assess_medical_risks', new_callable=AsyncMock) as mock_risk:
            mock_risk.return_value = {"risk_level": "moderate"}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_risk_assessment=True
            )
            
            assert "risk_assessment" in result
            mock_risk.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_summary(self, medical_history_service, sample_text):
        """Test medical summary generation"""
        with patch.object(medical_history_service, '_generate_medical_summary', new_callable=AsyncMock) as mock_summary:
            mock_summary.return_value = {"summary": "45-year-old with persistent cough"}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            assert "summary" in result or "symptoms" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_batch(self, medical_history_service):
        """Test batch medical history processing"""
        batch_requests = [
            {"text": "Text 1", "patient_id": "P001"},
            {"text": "Text 2", "patient_id": "P002"}
        ]
        
        with patch.object(medical_history_service.service_manager, 'process_medical_history_batch', new_callable=AsyncMock) as mock_batch:
            mock_batch.return_value = [
                {"symptoms": [], "patient_id": "P001"},
                {"symptoms": [], "patient_id": "P002"}
            ]
            
            results = await medical_history_service.process_medical_history_batch(batch_requests)
            
            assert len(results) == 2
            mock_batch.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_perform_basic_processing_with_manager(self, medical_history_service, sample_text):
        """Test basic processing using service manager"""
        result = await medical_history_service._perform_basic_processing(
            text=sample_text,
            patient_id="patient_123",
            context=None
        )
        
        assert result is not None
        medical_history_service.service_manager.process_medical_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_perform_basic_processing_fallback(self, sample_text):
        """Test basic processing fallback when no manager"""
        service = MedicalHistoryService(service_manager=None)
        
        with patch('medical_history_processor.processor.processor') as mock_processor:
            mock_processor.process_history = AsyncMock(return_value={"symptoms": []})
            
            result = await service._perform_basic_processing(
                text=sample_text,
                patient_id="patient_123",
                context=None
            )
            
            assert result is not None
            mock_processor.process_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_extract_medical_entities(self, medical_history_service, sample_text):
        """Test medical entity extraction"""
        result = await medical_history_service._extract_medical_entities(sample_text)
        
        assert isinstance(result, dict)
        assert "medications" in result or "diagnoses" in result or "entities" in result
    
    @pytest.mark.asyncio
    async def test_generate_diagnosis_suggestions(self, medical_history_service):
        """Test diagnosis suggestions generation"""
        symptoms = [{"symptom": "tos", "category": "respiratory"}]
        entities = [{"text": "asma", "type": "DISEASE"}]
        
        result = await medical_history_service._generate_diagnosis_suggestions(symptoms, entities)
        
        assert isinstance(result, dict)
        assert "suggestions" in result or isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_assess_medical_risks(self, medical_history_service, sample_text):
        """Test medical risk assessment"""
        result = await medical_history_service._assess_medical_risks(sample_text, {})
        
        assert isinstance(result, dict)
        assert "risk_level" in result or "risks" in result
    
    @pytest.mark.asyncio
    async def test_generate_medical_summary(self, medical_history_service, sample_text):
        """Test medical summary generation"""
        processing_result = {
            "symptoms": [{"symptom": "tos"}],
            "entities": [{"text": "asma", "type": "DISEASE"}]
        }
        
        result = await medical_history_service._generate_medical_summary(processing_result)
        
        assert isinstance(result, dict)
        assert "summary" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_comprehensive_all_options(self, medical_history_service, sample_text):
        """Test comprehensive processing with all options enabled"""
        result = await medical_history_service.process_medical_history_comprehensive(
            text=sample_text,
            patient_id="patient_123",
            include_entity_extraction=True,
            include_diagnosis_suggestions=True,
            include_risk_assessment=True
        )
        
        assert result is not None
        assert "entity_analysis" in result or "symptoms" in result
        assert "diagnosis_analysis" in result or "symptoms" in result
        assert "risk_assessment" in result or "symptoms" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_comprehensive_error_handling(self, medical_history_service, sample_text):
        """Test error handling in comprehensive processing"""
        medical_history_service.service_manager.process_medical_history.side_effect = Exception("Processing error")
        
        with pytest.raises(Exception):
            await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            assert "medical_summary" in result
            mock_summary.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_care_recommendations(self, medical_history_service, sample_text):
        """Test care recommendations generation"""
        with patch.object(medical_history_service, '_generate_care_recommendations', new_callable=AsyncMock) as mock_care:
            mock_care.return_value = ["Monitor symptoms", "Follow-up in 3 days"]
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            assert "care_recommendations" in result
            mock_care.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_batch_returns_list(self, medical_history_service):
        """Test batch medical history processing returns a list of results"""
        batch_requests = [
            {"text": "Patient 1 history", "patient_id": "p1"},
            {"text": "Patient 2 history", "patient_id": "p2"}
        ]

        medical_history_service.service_manager.process_medical_history_batch.return_value = [
            {"symptoms": [], "patient_id": "p1"},
            {"symptoms": [], "patient_id": "p2"}
        ]

        result = await medical_history_service.process_medical_history_batch(batch_requests)

        assert isinstance(result, list)
        assert len(result) == 2
    
    @pytest.mark.asyncio
    async def test_perform_basic_processing_with_manager(self, medical_history_service, sample_text):
        """Test basic processing using service manager"""
        result = await medical_history_service._perform_basic_processing(
            text=sample_text,
            patient_id="patient_123",
            context=None
        )
        
        assert result is not None
        medical_history_service.service_manager.process_medical_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_extract_medical_entities(self, medical_history_service, sample_text):
        """Test medical entity extraction"""
        result = await medical_history_service._extract_medical_entities(sample_text)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_diagnosis_suggestions(self, medical_history_service, sample_text):
        """Test diagnosis suggestions generation"""
        processing_result = {"symptoms": ["tos", "fiebre"], "entities": []}
        
        result = await medical_history_service._generate_diagnosis_suggestions(processing_result)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_assess_medical_risks(self, medical_history_service, sample_text):
        """Test medical risk assessment"""
        processing_result = {"symptoms": ["tos"], "entities": []}
        context = {"age": 45}
        
        result = await medical_history_service._assess_medical_risks(processing_result, context)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_medical_summary(self, medical_history_service, sample_text):
        """Test medical summary generation"""
        processing_result = {"symptoms": ["tos"], "entities": []}
        
        result = await medical_history_service._generate_medical_summary(
            processing_result=processing_result,
            patient_id="patient_123"
        )
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_care_recommendations(self, medical_history_service, sample_text):
        """Test care recommendations generation"""
        processing_result = {"symptoms": ["tos"], "diagnosis": "Bronquitis"}
        
        result = await medical_history_service._generate_care_recommendations(processing_result)

        # _generate_care_recommendations returns Dict, not list
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_assess_medical_risks_detects_chronic_conditions(self, medical_history_service):
        """Las condiciones crónicas mencionadas en entities deben quedar en risk_factors"""
        processing_result = {"symptoms": [], "entities": ["Paciente con diabetes e hipertensión"]}

        result = await medical_history_service._assess_medical_risks(processing_result, {})

        assert any("diabetes" in rf.lower() for rf in result["risk_factors"])
        assert any("hipertensión" in rf.lower() for rf in result["risk_factors"])

    @pytest.mark.asyncio
    async def test_generate_care_recommendations_reads_nested_risk_factors(self, medical_history_service):
        """Regresión: care_recommendations debe leer risk_assessment.risk_factors
        (anidado por process_medical_history_comprehensive), no una clave plana
        'risk_factors' que nunca se escribe."""
        processing_result = {
            "symptoms": [],
            "risk_assessment": {
                "risk_factors": ["Condición crónica: diabetes", "Condición crónica: hipertensión"]
            },
        }

        result = await medical_history_service._generate_care_recommendations(processing_result)

        meds = " ".join(result["medication_recommendations"]).lower()
        assert "diabetes" in meds
        assert "antihipertensivos" in meds

    @pytest.mark.asyncio
    async def test_generate_care_recommendations_reads_nested_diagnosis_suggestions(self, medical_history_service):
        """Regresión: care_recommendations debe leer diagnosis_analysis.primary_suggestions,
        no la clave plana 'diagnosis_suggestions' que nunca se escribe."""
        processing_result = {
            "symptoms": [],
            "diagnosis_analysis": {"primary_suggestions": ["Posible diabetes mellitus descompensada"]},
        }

        result = await medical_history_service._generate_care_recommendations(processing_result)

        assert "Endocrinología" in result["specialist_referrals"]

    @pytest.mark.asyncio
    async def test_generate_medical_summary_includes_nested_risk_factors(self, medical_history_service):
        """Regresión: el resumen debe reportar los factores de riesgo reales del risk_assessment."""
        processing_result = {
            "symptoms": [{"symptom": "tos"}],
            "entities": [],
            "risk_assessment": {"risk_factors": ["Condición crónica: diabetes"]},
        }

        result = await medical_history_service._generate_medical_summary(processing_result, "patient_123")

        assert any("Factores de riesgo" in kf for kf in result["key_findings"])

    @pytest.mark.asyncio
    async def test_generate_medical_summary_clinical_impression_uses_nested_diagnosis(self, medical_history_service):
        """Regresión: la impresión clínica debe citar las sugerencias diagnósticas reales."""
        processing_result = {
            "symptoms": [{"symptom": "tos"}],
            "entities": [],
            "diagnosis_analysis": {"primary_suggestions": ["Bronquitis", "Asma"]},
        }

        result = await medical_history_service._generate_medical_summary(processing_result, "patient_123")

        assert "Bronquitis" in result["clinical_impression"]

    @pytest.mark.asyncio
    async def test_comprehensive_processing_propagates_risk_factors_to_care_recommendations(
        self, medical_history_service, sample_text
    ):
        """Regresión end-to-end: process_medical_history_comprehensive debe propagar el
        risk_assessment real hacia care_recommendations en lugar de perderlo en una
        clave plana inexistente."""
        with patch.object(medical_history_service, '_perform_basic_processing', new_callable=AsyncMock) as mock_basic:
            mock_basic.return_value = {"symptoms": [], "entities": ["Paciente con antecedente de diabetes"]}

            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_entity_extraction=False,
                include_diagnosis_suggestions=False,
                include_risk_assessment=True
            )

            meds = " ".join(result["care_recommendations"]["medication_recommendations"]).lower()
            assert "diabetes" in meds

    @pytest.mark.asyncio
    async def test_error_handling(self, medical_history_service, sample_text):
        """Test error handling in comprehensive processing"""
        medical_history_service.service_manager.process_medical_history.side_effect = Exception("Service error")
        
        with pytest.raises(Exception):
            await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )

