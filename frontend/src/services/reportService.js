
import api from "./api";

// Normalize different possible API response structures.
const normalizeReports = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") return [];

  const possibleLists = [
    payload.reports,
    payload.content,
    payload.data,
    payload.items,
    payload.results,
    payload.data?.reports,
    payload.data?.content,
    payload.data?.items,
  ];

  return possibleLists.find(Array.isArray) || [];
};

// Normalize API responses.
const normalizeResponse = (payload) => {
  return payload?.data ?? payload;
};

// Upload a medical report with real upload progress tracking.
export const uploadReport = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/reports/upload", formData, {
    onUploadProgress: (event) => {
      if (event.total && typeof onProgress === "function") {
        const percentage = Math.round(
          (event.loaded * 100) / event.total
        );

        onProgress(percentage);
      }
    },
  });

  return normalizeResponse(response.data);
};

// Get all reports belonging to the logged-in user.
export const getReports = async () => {
  const response = await api.get("/reports");
  return normalizeReports(response.data);
};

// Get one report.
export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return normalizeResponse(response.data);
};

// Get real processing status.
export const getReportProcessingStatus = async (id) => {
  const response = await api.get(`/reports/${id}/status`, {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  return normalizeResponse(response.data);
};

// Get extracted medical report text.
export const getExtractedText = async (id) => {
  const response = await api.get(`/reports/${id}/text`);
  return normalizeResponse(response.data);
};

// Extract and save medical test results.
export const extractReportResults = async (id) => {
  const response = await api.post(`/reports/${id}/extract`);
  return normalizeResponse(response.data);
};

// Get saved test results.
export const getReportResults = async (id) => {
  const response = await api.get(`/reports/${id}/results`);
  return normalizeResponse(response.data);
};

// Save a manually corrected medical test result.
export const saveTestResultCorrection = async (
  reportId,
  resultId,
  correction
) => {
  const response = await api.put(
    `/reports/${reportId}/results/${resultId}`,
    correction
  );

  return normalizeResponse(response.data);
};

// Download original PDF.
export const downloadReport = async (id) => {
  const response = await api.get(`/reports/${id}/download`, {
    responseType: "blob",
  });

  return response.data;
};

// Delete a report.
export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};
