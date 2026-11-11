import { useCallback, useState } from "react";
import api from "../services/api";

export default function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitFeedback = useCallback(async (feedback) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Connect this endpoint after confirming the backend route.
      const response = await api.post("/feedback", feedback);

      setSuccess(true);

      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to submit feedback.";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetFeedback = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    submitFeedback,
    resetFeedback,
  };
}