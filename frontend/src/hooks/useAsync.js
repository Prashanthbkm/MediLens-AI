import { useCallback, useState } from "react";

export default function useAsync(asyncFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFunction(...params);

        setData(result);

        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong.";

        setError(errorMessage);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}