
import os
import logging

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. Check your .env file."
    )

# Shared Groq client configuration
client = Groq(
    api_key=GROQ_API_KEY,
    timeout=60.0,
    max_retries=2
)


def generate_medical_explanation(
    test_name: str,
    numeric_value: float | None,
    text_value: str | None,
    unit: str | None,
    reference_range: str | None,
    result_flag: str
) -> str:

    result_value = (
        str(numeric_value)
        if numeric_value is not None
        else text_value or "Not provided"
    )

    prompt = f"""
You are an educational medical laboratory information assistant.

Explain the following laboratory result in simple language.

Test name: {test_name}
Result: {result_value}
Unit: {unit or "Not provided"}
Laboratory reference range: {reference_range or "Not provided"}
Classification supplied by the laboratory system: {result_flag}

Instructions:
1. Explain what this test generally measures.
2. Explain what the supplied classification means.
3. Mention possible general factors without claiming they caused the result.
4. Do not diagnose diseases or prescribe treatment.
5. Never invent or change laboratory values or reference ranges.
6. Clearly mention when information is insufficient.
7. Recommend discussing the result with a qualified healthcare professional.

This is educational information, not a medical diagnosis.
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You provide cautious, evidence-aware "
                    "educational explanations of laboratory tests."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_completion_tokens=700
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("Groq returned an empty explanation.")

    return content.strip()
