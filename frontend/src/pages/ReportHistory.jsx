import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  RefreshCw,
  FileText,
  Trash2,
  Eye,
  UploadCloud,
  AlertTriangle,
} from "lucide-react";

import { getReports, deleteReport } from "../services/reportService";
import Surface, { SectionHeader } from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.message ||
  "Unable to complete the request. Please try again.";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatFileSize = (bytes) => {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getStatusColor = (status) => {
  const value = String(status || "").toUpperCase();
  if (value.includes("COMPLETE") || value.includes("SUCCESS")) return "success";
  if (value.includes("FAIL") || value.includes("ERROR")) return "error";
  if (value.includes("PROCESS") || value.includes("PENDING")) return "warning";
  return "default";
};

/* ---------- page ---------- */

export default function ReportHistory() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");
      const reportList = await getReports();
      setReports(Array.isArray(reportList) ? reportList : []);
    } catch (err) {
      console.error("Failed to fetch reports:", err.response?.data || err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRefresh = () => fetchReports(true);

  const handleOpenReport = (id) => {
    if (!id) {
      showNotification("Report ID is missing.", "error");
      return;
    }
    navigate(`/reports/${id}`);
  };

  const handleAskDelete = (report) => setConfirmDelete(report);

  const handleCancelDelete = () => setConfirmDelete(null);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const report = confirmDelete;

    try {
      setDeletingId(report.id);

      await deleteReport(report.id);

      setReports((previous) =>
        previous.filter((item) => String(item.id) !== String(report.id))
      );

      showNotification("Report deleted successfully.");
    } catch (err) {
      console.error("Failed to delete report:", err);
      showNotification(getErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <Box
      className="page-reveal"
      sx={{ width: "100%", maxWidth: tokens.contentMax, mx: "auto" }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" color={tokens.navy}>
            My reports
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage your uploaded medical reports.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25}>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <RefreshCw size={16} />
              )
            }
            onClick={handleRefresh}
            disabled={loading || refreshing}
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": { borderColor: tokens.teal, color: tokens.teal },
            }}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadCloud size={16} />}
            onClick={() => navigate("/upload")}
          >
            Upload report
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchReports()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Reports card */}
      <Surface padding={0} contentSx={{ p: 0 }} sx={{ overflow: "hidden" }}>
        {/* Card header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: tokens.infoTint,
              color: tokens.info,
              display: "grid",
              placeItems: "center",
            }}
          >
            <FileText size={17} />
          </Box>

          <Typography
            variant="h6"
            fontWeight={600}
            color={tokens.navy}
            sx={{ flex: 1 }}
          >
            Uploaded medical reports
          </Typography>

          <Chip
            size="small"
            label={`${reports.length} report${reports.length === 1 ? "" : "s"}`}
            variant="outlined"
            sx={{ borderColor: tokens.border, color: tokens.inkSoft }}
          />
        </Stack>

        {/* Body */}
        {loading ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress size={26} sx={{ color: tokens.teal }} />
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              Loading your reports…
            </Typography>
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
            <FileText
              size={42}
              color={tokens.inkFaint}
              strokeWidth={1.5}
            />
            <Typography fontWeight={600} sx={{ mt: 1.5 }} color={tokens.navy}>
              No reports uploaded yet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Your uploaded medical reports will appear here.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadCloud size={16} />}
              onClick={() => navigate("/upload")}
              sx={{ mt: 3 }}
            >
              Upload your first report
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report name</TableCell>
                  <TableCell>File size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: tokens.infoTint,
                            color: tokens.info,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={15} />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            fontWeight={600}
                            variant="body2"
                            color={tokens.navy}
                            noWrap
                            title={report.originalFilename}
                          >
                            {report.originalFilename || "Medical report"}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {report.fileType || "PDF"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(report.fileSizeBytes)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={report.processingStatus || "UPLOADED"}
                        color={getStatusColor(report.processingStatus)}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(report.uploadedAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="View report">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenReport(report.id)}
                            sx={{
                              color: tokens.navy,
                              "&:hover": { bgcolor: tokens.bgSubtle },
                            }}
                          >
                            <Eye size={17} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete report">
                          <span>
                            <IconButton
                              size="small"
                              disabled={deletingId === report.id}
                              onClick={() => handleAskDelete(report)}
                              sx={{
                                color: tokens.abnormal,
                                "&:hover": { bgcolor: tokens.abnormalTint },
                              }}
                            >
                              {deletingId === report.id ? (
                                <CircularProgress
                                  size={15}
                                  sx={{ color: tokens.abnormal }}
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Surface>

      {/* Delete confirmation dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: tokens.abnormalTint,
                color: tokens.abnormal,
                display: "grid",
                placeItems: "center",
              }}
            >
              <AlertTriangle size={17} />
            </Box>
            <Typography fontWeight={600} color={tokens.navy}>
              Delete this report?
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color={tokens.ink}>
            <strong>{confirmDelete?.originalFilename || "This report"}</strong>{" "}
            and all data extracted from it will be permanently removed. This
            action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={Boolean(deletingId)}
            sx={{ color: tokens.inkMuted }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={Boolean(deletingId)}
            sx={{
              bgcolor: tokens.abnormal,
              color: "#FFFFFF",
              "&:hover": { bgcolor: tokens.critical },
            }}
            startIcon={
              deletingId ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Trash2 size={15} />
              )
            }
          >
            {deletingId ? "Deleting…" : "Delete report"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() =>
          setNotification((previous) => ({ ...previous, open: false }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setNotification((previous) => ({ ...previous, open: false }))
          }
          severity={notification.severity}
          variant="filled"
          sx={{ borderRadius: 1.5 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}