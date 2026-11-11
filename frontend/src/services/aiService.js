
import api from "./api";

// Generate an AI summary of a medical report
export const generateReportSummary = async (id) => {
  const response = await api.post(`/reports/${id}/ai/summary`);
  return response.data;
};

// Index a report in the vector database for RAG
export const indexReport = async (id) => {
  const response = await api.post(`/reports/${id}/ai/index`);
  return response.data;
};

// Ask a question about a specific medical report
export const askReportQuestion = async (id, question) => {
  const response = await api.post(`/reports/${id}/ai/ask`, {
    question,
  });

  return response.data;
};

// Generate rule-based test explanation
export const explainTestResult = async (id, test) => {
  const response = await api.post(
    `/reports/${id}/ai/explain-result`,
    {
      test_name: test.testName,
      numeric_value: test.numericValue ?? null,
      text_value: test.textValue ?? null,
      unit: test.unit ?? null,
      reference_range: test.referenceRange ?? null,
      result_flag: test.resultFlag,
    }
  );

  return response.data;
};

// Generate AI-powered test explanation
export const generateAiTestExplanation = async (id, test) => {
  const response = await api.post(
    `/reports/${id}/ai/ai-explain-result`,
    {
      test_name: test.testName,
      numeric_value: test.numericValue ?? null,
      text_value: test.textValue ?? null,
      unit: test.unit ?? null,
      reference_range: test.referenceRange ?? null,
      result_flag: test.resultFlag,
    }
  );

  return response.data;
};
