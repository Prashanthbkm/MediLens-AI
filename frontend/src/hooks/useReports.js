import { useCallback, useEffect, useState } from "react";
import {
  getReports,
  getReportById,
} from "../services/reportService";

export default function useReports(autoFetch = true) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await getReports();

      const data = response?.data ?? response;

      const reportList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setReports(reportList);

      return reportList;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to fetch reports.";

      setError(message);

      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchReportById = useCallback(async (id) => {
    try {
      setError(null);

      const response = await getReportById(id);

      return response?.data ?? response;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to fetch report details.";

      setError(message);

      throw err;
    }
  }, []);

  const refreshReports = useCallback(() => {
    return fetchReports(true);
  }, [fetchReports]);

  useEffect(() => {
    if (autoFetch) {
      fetchReports().catch(() => {
        // Error is already stored in hook state.
      });
    }
  }, [autoFetch, fetchReports]);

  return {
    reports,
    setReports,
    loading,
    refreshing,
    error,
    fetchReports,
    fetchReportById,
    refreshReports,
  };
}