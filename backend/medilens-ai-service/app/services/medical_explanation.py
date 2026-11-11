
from app.schemas.medical import (
    MedicalTestResultRequest,
    MedicalTestExplanationResponse
)


class MedicalExplanationService:

    DISCLAIMER = (
        "This explanation is for educational purposes only. "
        "It is not a medical diagnosis or a substitute for "
        "professional medical advice. Consult a qualified "
        "healthcare professional for interpretation."
    )

    @staticmethod
    def generate_explanation(
        request: MedicalTestResultRequest
    ) -> MedicalTestExplanationResponse:

        test_name = request.test_name.strip()
        flag = request.result_flag.strip().upper()

        if request.numeric_value is not None:
            result_value = str(request.numeric_value)
        else:
            result_value = request.text_value

        explanations = {
            "LOW": (
                f"The reported {test_name} result is below the "
                "reference range supplied with the report. "
                "The significance depends on the person's overall "
                "health and other test results."
            ),
            "HIGH": (
                f"The reported {test_name} result is above the "
                "reference range supplied with the report. "
                "Its significance depends on the person's overall "
                "health and other test results."
            ),
            "NORMAL": (
                f"The reported {test_name} result is within the "
                "reference range supplied with the report. "
                "A result within range does not rule out every "
                "health condition."
            ),
            "BORDERLINE": (
                f"The reported {test_name} result is classified "
                "as borderline. A healthcare professional can "
                "interpret it alongside other findings."
            ),
            "CRITICAL": (
                f"The reported {test_name} result is marked "
                "critical by the reporting system. Please contact "
                "a healthcare professional promptly for guidance."
            )
        }

        explanation = explanations.get(
            flag,
            (
                f"The result for {test_name} has the classification "
                f"'{flag}'. Its clinical significance has not been "
                "determined by this service."
            )
        )

        possible_factors = []

        if flag in ["LOW", "HIGH", "BORDERLINE", "CRITICAL"]:
            possible_factors.append(
                "Interpretation may depend on age, health history, "
                "medications and other laboratory findings."
            )

        if request.reference_range:
            possible_factors.append(
                "Compare the result with the reference range "
                f"provided by the laboratory: {request.reference_range}."
            )

        if request.unit:
            possible_factors.append(
                f"The laboratory reported the measurement in {request.unit}."
            )

        return MedicalTestExplanationResponse(
            test_name=test_name,
            result_value=result_value,
            result_flag=flag,
            explanation=explanation,
            possible_factors=possible_factors,
            disclaimer=MedicalExplanationService.DISCLAIMER
        )
