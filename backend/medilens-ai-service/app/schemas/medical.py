
from typing import Optional
from pydantic import BaseModel, Field


class MedicalTestResultRequest(BaseModel):
    test_name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Name of the medical test"
    )

    numeric_value: Optional[float] = Field(
        default=None,
        description="Numeric test result"
    )

    text_value: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Qualitative test result"
    )

    unit: Optional[str] = Field(
        default=None,
        max_length=50
    )

    reference_range: Optional[str] = Field(
        default=None,
        max_length=100
    )

    result_flag: str = Field(
        ...,
        description="Result classification from the Java backend"
    )


class MedicalTestExplanationResponse(BaseModel):
    test_name: str
    result_value: Optional[str] = None
    result_flag: str
    explanation: str
    possible_factors: list[str] = []
    disclaimer: str
