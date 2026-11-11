import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  FileText,
  CheckCircle2,
  Circle,
  RefreshCw,
  AlertCircle,
  ScanText,
  Database,
  ArrowRight,
  Clock,
} from "lucide-react";

import { getReportById, getReports } from "../services/reportService";
import Surface from "../components/common/Surface";
import { tokens } from "/theme";

const POLLING_INTERVAL = 3000;

const STATUS = {
  COMPLETED: ["EXTRACTED", "COMPLETED", "PROCESSED"],
  FAILED: ["FAILED", "OCR_FAILED", "ERROR"],
};

const PROCESSING_STAGES = [
  {
    id: "upload",
    title: "Report uploaded",
    description: "Your medical report has been received.",
    icon: FileText,
    getValue: (report) => (report ? "COMPLETED" : "PENDING"),
  },
  {
    id: "text",
    title: "Text extraction",
    description: "Extracting readable text from your PDF.",
    icon: ScanText,
    getValue: (report) => report?.textExtractionStatus,
  },
  {
    id: "ocr",
    title: "OCR processing",
    description: "Recognising text from scanned pages when required.",
    icon: ScanText,
    getValue: (report) => report?.ocrStatus,
  },
  {
    id: "structured",
    title: "Structured extraction",
    description: "Preparing medical test names, values, units and ranges.",
    icon: Database,
    getValue: (report) => report?.structuredExtractionStatus,
  },
];

/* ---------- helpers ---------- */

function normalizeStageStatus(value) {
  return String(value || "PENDING").toUpperCase();
}

function getStageState(value) {
  const status = normalizeStageStatus(value);
  if (["COMPLETED", "SKIPPED"].includes(status)) return "completed";
  if (["FAILED", "ERROR", "OCR_FAILED"].includes(status)) return "failed";
  if (["PROCESSING", "IN_PROGRESS"].includes(status)) return "active";
  return "pending";
}

function getProcessingStatus(report) {
  return String(report?.processingStatus || "UNKNOWN").toUpperCase();
}

function isExtractionComplete(status) {
  return STATUS.COMPLETED.includes(status);
}

function isProcessingFailed(status) {
  return STATUS.FAILED.includes(status);
}

function getStatusMessage(status) {
  if (isExtractionComplete(status))
    return "Your report text has been extracted successfully.";
  if (isProcessingFailed(status))
    return "We could not complete report processing.";
  if (status === "OCR_REQUIRED")
    return "The report requires OCR processing.";
  if (status === "UPLOADED")
    return "Your report has been uploaded.";
  if (status === "PROCESSING")
    return "Your report is currently being processed.";
  return "Checking your report processing status.";
}

function getStageLabel(stageState) {
  return (
    {
      completed: "Completed",
      active: "In progress",
      failed: "Failed",
      pending: "Pending",
    }[stageState] || "Pending"
  );
}

const STAGE_COLORS = {
  completed: tokens.normal,
  active: tokens.teal,
  failed: tokens.abnormal,
  pending: tokens.inkFaint,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

/* ---------- page ---------- */

export default function ProcessingView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // State for the Queue (if no ID)
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const loadReportStatus = useCallback(
    async (showLoader = false) => {
      if (!id) return;

      if (showLoader) setChecking(true);

      try {
        const response = await getReportById(id);
        setReport(response);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to retrieve report status."
        );
      } finally {
        setLoading(false);
        setChecking(false);
      }
    },
    [id]
  );

  // Fetch queue if no ID
  useEffect(() => {
    if (!id) {
      const fetchQueue = async () => {
        try {
          setLoadingQueue(true);
          const res = await getReports();
          const allReports = Array.isArray(res) ? res : [];
          
          // Filter for reports that are NOT fully completed/extracted
          const activeQueue = allReports.filter((r) => {
            const s = String(r.processingStatus || "").toUpperCase();
            return (
              s.includes("PROCESS") ||
              s.includes("PENDING") ||
              s.includes("UPLOAD") ||
              s.includes("FAIL") ||
              s.includes("ERROR")
            );
          });
          setQueue(activeQueue);
        } catch (err) {
          console.error("Failed to fetch processing queue", err);
        } finally {
          setLoadingQueue(false);
        }
      };
      fetchQueue();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadReportStatus();
    const intervalId = setInterval(() => loadReportStatus(), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [id, loadReportStatus]);

  /* ---------- RENDER: QUEUE (No ID provided) ---------- */
  if (!id) {
    return (
      <Box className="page-reveal" sx={{ maxWidth: tokens.contentMax, mx: "auto", width: "100%" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color={tokens.navy}>
            Processing Queue
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Track reports that are currently uploading, processing, or require attention.
          </Typography>
        </Box>

        <Surface padding={0} contentSx={{ p: 0 }} sx={{ overflow: "hidden" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}` }}
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
              <Clock size={17} />
            </Box>
            <Typography variant="h6" fontWeight={600} color={tokens.navy} sx={{ flex: 1 }}>
              Active jobs
            </Typography>
            <Chip
              size="small"
              label={`${queue.length} in queue`}
              variant="outlined"
              sx={{ borderColor: tokens.border, color: tokens.inkSoft }}
            />
          </Stack>

          {loadingQueue ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <CircularProgress size={26} sx={{ color: tokens.teal }} />
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                Loading queue…
              </Typography>
            </Box>
          ) : queue.length === 0 ? (
            <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
              <Clock size={42} color={tokens.inkFaint} strokeWidth={1.5} />
              <Typography fontWeight={600} sx={{ mt: 1.5 }} color={tokens.navy}>
                Your queue is empty
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                All recent reports have finished processing.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/upload")}
                sx={{ mt: 3 }}
              >
                Upload a new report
              </Button>
            </Box>
          ) : (
            <Stack spacing={0} divider={<Box sx={{ borderBottom: `1px solid ${tokens.border}` }} />}>
              {queue.map((r) => {
                const isFailed = String(r.processingStatus).toUpperCase().includes("FAIL");
                
                return (
                  <Stack
                    key={r.id}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                    sx={{
                      p: 2.5,
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: tokens.bg },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: isFailed ? tokens.abnormalTint : tokens.bgSubtle,
                          color: isFailed ? tokens.abnormal : tokens.inkSoft,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isFailed ? <AlertCircle size={20} /> : <Clock size={20} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} color={tokens.navy} noWrap>
                          {r.originalFilename || "Medical Report"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded {formatDate(r.uploadedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        size="small"
                        label={r.processingStatus || "PENDING"}
                        color={isFailed ? "error" : "info"}
                        variant="outlined"
                      />
                      <Button
                        variant={isFailed ? "outlined" : "contained"}
                        color={isFailed ? "primary" : "secondary"}
                        onClick={() => navigate(`/reports/${r.id}/processing`)}
                      >
                        {isFailed ? "View Error" : "View Status"}
                      </Button>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Surface>
      </Box>
    );
  }

  /* ---------- RENDER: SINGLE REPORT (ID provided) ---------- */

  const status = getProcessingStatus(report);
  const completed = isExtractionComplete(status);
  const failed = isProcessingFailed(status);

  const handleContinue = () => navigate(`/reports/${id}/review`);
  const handleRetry = () => loadReportStatus(true);

  return (
    <Box
      className="page-reveal"
      sx={{ maxWidth: 900, mx: "auto", py: 2, width: "100%" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />}
          onClick={() => navigate("/processing")}
          sx={{ mb: 1, color: tokens.inkMuted, "&:hover": { bgcolor: tokens.bgSubtle } }}
        >
          Back to queue
        </Button>
        <Typography variant="h4" color={tokens.navy}>
          Report processing
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          MediLens AI is preparing your medical report for review.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report identity */}
      <Surface padding={2.5} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: tokens.infoTint,
              color: tokens.info,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={22} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} color={tokens.navy} noWrap>
              {report?.originalFilename || "Medical Report"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Report ID: {id}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={loading ? "Checking" : status.replaceAll("_", " ")}
            color={completed ? "success" : failed ? "error" : "info"}
            variant="outlined"
          />
        </Stack>
      </Surface>

      {/* Main status card */}
      <Surface padding={{ xs: 3, sm: 4 }} sx={{ mb: 3 }}>
        {/* Status hero */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {loading ? (
            <CircularProgress size={48} sx={{ color: tokens.teal }} />
          ) : completed ? (
            <CheckCircle2 size={48} color={tokens.normal} />
          ) : failed ? (
            <AlertCircle size={48} color={tokens.abnormal} />
          ) : (
            <CircularProgress size={48} sx={{ color: tokens.teal }} />
          )}

          <Typography
            variant="h5"
            fontWeight={700}
            color={tokens.navy}
            sx={{ mt: 2 }}
          >
            {loading
              ? "Checking report…"
              : completed
              ? "Report text extracted"
              : failed
              ? "Processing failed"
              : "Processing your report"}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {loading
              ? "Connecting to the MediLens server."
              : getStatusMessage(status)}
          </Typography>
        </Box>

        {/* Progress bar */}
        {!loading && !failed && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={tokens.ink}
              sx={{ mb: 1 }}
            >
              Report extraction status
            </Typography>

            <LinearProgress
              variant={completed ? "determinate" : "indeterminate"}
              value={completed ? 100 : undefined}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: tokens.bgSubtle,
                "& .MuiLinearProgress-bar": {
                  bgcolor: tokens.teal,
                  borderRadius: 4,
                },
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {completed
                ? "PDF text extraction has finished."
                : "Waiting for the backend processing status."}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Stage timeline */}
        <Typography
          variant="h6"
          fontWeight={600}
          color={tokens.navy}
          sx={{ mb: 2.5 }}
        >
          Processing stages
        </Typography>

        <Stack spacing={2.5}>
          {PROCESSING_STAGES.map((stage) => {
            const rawStatus = stage.getValue(report);
            const stageState = getStageState(rawStatus);
            const stageColor = STAGE_COLORS[stageState];

            return (
              <Stack
                key={stage.id}
                direction="row"
                spacing={2}
                alignItems="flex-start"
              >
                <Box sx={{ pt: 0.25, display: "flex" }}>
                  {stageState === "completed" ? (
                    <CheckCircle2 size={22} color={tokens.normal} />
                  ) : stageState === "failed" ? (
                    <AlertCircle size={22} color={tokens.abnormal} />
                  ) : stageState === "active" ? (
                    <CircularProgress size={20} sx={{ color: tokens.teal }} />
                  ) : (
                    <Circle size={22} color={tokens.inkFaint} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontWeight={600}
                    color={
                      stageState === "pending" ? tokens.inkSoft : tokens.navy
                    }
                  >
                    {stage.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {stage.description}
                  </Typography>

                  {stage.id === "ocr" &&
                    normalizeStageStatus(rawStatus) === "SKIPPED" && (
                      <Chip
                        size="small"
                        label="Not required for this PDF"
                        variant="outlined"
                        sx={{ mt: 1, borderColor: tokens.border }}
                      />
                    )}
                </Box>

                <Chip
                  size="small"
                  label={getStageLabel(stageState)}
                  variant="outlined"
                  sx={{
                    color: stageColor,
                    borderColor: stageColor,
                    backgroundColor:
                      stageState === "completed"
                        ? tokens.normalTint
                        : stageState === "failed"
                        ? tokens.abnormalTint
                        : stageState === "active"
                        ? tokens.tealTint
                        : "transparent",
                  }}
                />
              </Stack>
            );
          })}
        </Stack>

        {/* Error details */}
        {report?.processingError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography fontWeight={600} variant="body2" sx={{ mb: 0.5 }}>
              Processing details
            </Typography>
            <Typography variant="body2">{report.processingError}</Typography>
          </Alert>
        )}

        {failed && !report?.processingError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Your report could not be processed successfully. Check the backend
            logs or try uploading another PDF. Refreshing the status does not
            restart the failed job.
          </Alert>
        )}

        {/* Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mt: 3.5 }}
        >
          {completed && (
            <>
              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowRight size={16} />}
                onClick={handleContinue}
              >
                Continue to extraction review
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/reports/${id}`)}
                sx={{
                  borderColor: tokens.border,
                  color: tokens.navy,
                  "&:hover": { borderColor: tokens.teal, color: tokens.teal },
                }}
              >
                View report details
              </Button>
            </>
          )}

          {!completed && (
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={handleRetry}
              disabled={checking}
              sx={{
                borderColor: tokens.border,
                color: tokens.navy,
                "&:hover": { borderColor: tokens.teal, color: tokens.teal },
              }}
            >
              {checking ? "Checking…" : "Refresh status"}
            </Button>
          )}
        </Stack>

        {checking && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5 }}
          >
            Refreshing report status…
          </Typography>
        )}
      </Surface>

      {/* Disclaimer */}
      <Alert
        severity="info"
        icon={false}
        sx={{ bgcolor: tokens.infoTint, color: tokens.ink }}
      >
        <Typography variant="body2">
          MediLens AI provides educational information only and does not
          replace professional medical advice.
        </Typography>
      </Alert>
    </Box>
  );
}