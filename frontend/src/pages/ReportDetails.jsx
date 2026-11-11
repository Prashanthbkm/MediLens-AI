import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowLeft,
  Bot,
  FileText,
  RefreshCw,
  Sparkles,
  Activity,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Info,
  Edit3,
  Save,
} from "lucide-react";

import {
  getReportById,
  getReportResults,
  getExtractedText,
  extractReportResults,
  downloadReport,
  saveTestResultCorrection,
} from "../services/reportService";

import {
  generateReportSummary,
  explainTestResult,
} from "../services/aiService";

import ConfidenceIndicator from "../components/reports/ConfidenceIndicator";
import ExportReport from "../components/reports/ExportReport";
import ReviewResultCard from "../components/reports/ReviewResultCard";
import SourceEvidence from "../components/reports/SourceEvidence";

import Surface, { SectionHeader } from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.message ||
  "Something went wrong.";

const unwrap = (response) => response?.data ?? response;

// FIX: Upgraded to catch all backend variations
const normalizeFlag = (flag) => {
  const value = String(flag || "").trim().toUpperCase().replace(/[\s_]+/g, "");

  if (value.includes("CRITICAL") || value.includes("SEVERE")) {
    return "CRITICAL";
  }
  if (value.includes("BORDERLINE") || value.includes("MILD") || value.includes("MODERATE")) {
    return "BORDERLINE";
  }
  if (
    value.includes("ABNORMAL") || 
    value.includes("HIGH") || 
    value.includes("LOW") || 
    value.includes("OUTOFRANGE")
  ) {
    return "ABNORMAL";
  }
  if (value.includes("NORMAL") || value.includes("WITHINRANGE")) {
    return "NORMAL";
  }
  return "UNCLASSIFIED";
};

const getFlagColor = (flag) => {
  const value = normalizeFlag(flag);
  switch (value) {
    case "NORMAL":
      return "success";
    case "CRITICAL":
      return "error";
    case "ABNORMAL":
    case "BORDERLINE":
      return "warning";
    default:
      return "default";
  }
};

const getSummaryData = (response) => {
  const result = unwrap(response);
  return result?.data ?? result;
};

/* ---------- page ---------- */

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [results, setResults] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [selectedTest, setSelectedTest] = useState(null);
  const [testExplanation, setTestExplanation] = useState(null);
  const [explainingTest, setExplainingTest] = useState(false);

  const [reviewingTest, setReviewingTest] = useState(null);
  const [reviewDraft, setReviewDraft] = useState(null);
  const [reviewNotice, setReviewNotice] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  /* ---------- data loading ---------- */

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [reportResponse, resultsResponse] = await Promise.all([
        getReportById(id),
        getReportResults(id),
      ]);

      setReport(unwrap(reportResponse));

      const resultData = unwrap(resultsResponse);
      setResults(
        Array.isArray(resultData)
          ? resultData
          : Array.isArray(resultData?.content)
            ? resultData.content
            : []
      );

      try {
        const textResponse = await getExtractedText(id);
        const textData = unwrap(textResponse);
        setExtractedText(
          typeof textData === "string"
            ? textData
            : textData?.extractedText || textData?.text || ""
        );
      } catch {
        setExtractedText("");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  /* ---------- actions ---------- */

  const handleExtract = async () => {
    try {
      setExtracting(true);
      setActionMessage("");

      await extractReportResults(id);
      await loadReport();

      setActionMessage("Test result extraction completed.");
    } catch (err) {
      setActionMessage(getErrorMessage(err));
    } finally {
      setExtracting(false);
    }
  };

  const handleSummary = async () => {
    try {
      setSummarizing(true);
      setActionMessage("");

      const response = await generateReportSummary(id);
      setSummary(getSummaryData(response));

      setActionMessage("AI summary generated successfully.");
    } catch (err) {
      setActionMessage(getErrorMessage(err));
    } finally {
      setSummarizing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const blob = await downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = report?.originalFilename || "medical-report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionMessage(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleExport = async (format) => {
    if (format === "pdf") {
      await handleDownload();
      return;
    }

    if (format === "excel") {
      const headers = [
        "Test Name",
        "Numeric Value",
        "Text Value",
        "Unit",
        "Reference Range",
        "Result Flag",
      ];

      const escapeCSV = (value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

      const rows = results.map((item) => [
        item.testName,
        item.numericValue,
        item.textValue,
        item.unit,
        item.referenceRange,
        item.resultFlag,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(","))
        .join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "medical-report-results.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    }
  };

  const handleExplainTest = async (test) => {
    try {
      setSelectedTest(test);
      setTestExplanation(null);
      setExplainingTest(true);

      const response = await explainTestResult(id, test);
      const result = response?.data ?? response;

      setTestExplanation(result);
    } catch (err) {
      setTestExplanation({ error: getErrorMessage(err) });
    } finally {
      setExplainingTest(false);
    }
  };

  const handleCloseExplanation = () => {
    if (explainingTest) return;
    setSelectedTest(null);
    setTestExplanation(null);
  };

  const handleOpenReview = (test) => {
    setReviewingTest(test);
    setReviewDraft({
      testName: test.testName ?? "",
      numericValue: test.numericValue ?? "",
      textValue: test.textValue ?? "",
      unit: test.unit ?? "",
      referenceRange: test.referenceRange ?? "",
    });
    setReviewNotice("");
  };

  const handleApplyReviewDraft = async () => {
    if (!reviewingTest || !reviewDraft || savingReview) return;

    const testName = reviewDraft.testName.trim();
    const rawNumericValue = String(reviewDraft.numericValue ?? "").trim();
    const textValue = String(reviewDraft.textValue ?? "").trim();

    if (!testName) {
      setReviewNotice("Test name is required.");
      return;
    }

    if (!rawNumericValue && !textValue) {
      setReviewNotice("Enter either a numeric value or a text value.");
      return;
    }

    const numericValue = rawNumericValue ? Number(rawNumericValue) : null;

    if (rawNumericValue && !Number.isFinite(numericValue)) {
      setReviewNotice("Numeric value must be a valid number.");
      return;
    }

    if (rawNumericValue && textValue) {
      setReviewNotice(
        "Enter either a numeric value or a text value, not both."
      );
      return;
    }

    const correction = {
      testName,
      numericValue,
      textValue: textValue || null,
      unit: reviewDraft.unit.trim() || null,
      referenceRange: reviewDraft.referenceRange.trim() || null,
    };

    try {
      setSavingReview(true);
      setReviewNotice("");

      const response = await saveTestResultCorrection(
        id,
        reviewingTest.id,
        correction
      );
      const savedResult =
        response?.data?.data ?? response?.data ?? response;

      setResults((current) =>
        current.map((item) =>
          item.id === reviewingTest.id
            ? {
                ...item,
                ...(savedResult && typeof savedResult === "object"
                  ? savedResult
                  : {}),
                ...correction,
                manuallyReviewed: true,
                reviewedAt:
                  savedResult?.reviewedAt ??
                  savedResult?.reviewed_at ??
                  new Date().toISOString(),
              }
            : item
        )
      );

      setReviewingTest(null);
      setReviewDraft(null);
      setReviewNotice("Correction saved successfully.");
      setActionMessage("Test result correction saved successfully.");
    } catch (err) {
      setReviewNotice(getErrorMessage(err));
    } finally {
      setSavingReview(false);
    }
  };

  const handleCloseReview = () => {
    if (savingReview) return;
    setReviewingTest(null);
    setReviewDraft(null);
  };

  /* ---------- derived counts ---------- */

  const normalCount = results.filter(
    (item) => normalizeFlag(item.resultFlag) === "NORMAL"
  ).length;

  const abnormalCount = results.filter(
    (item) => normalizeFlag(item.resultFlag) === "ABNORMAL"
  ).length;

  const borderlineCount = results.filter(
    (item) => normalizeFlag(item.resultFlag) === "BORDERLINE"
  ).length;

  const criticalCount = results.filter(
    (item) => normalizeFlag(item.resultFlag) === "CRITICAL"
  ).length;

  const unclassifiedCount = results.filter(
    (item) => normalizeFlag(item.resultFlag) === "UNCLASSIFIED"
  ).length;

  /* ---------- loading / error states ---------- */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress size={28} sx={{ color: tokens.teal }} />
        <Typography color="text.secondary">
          Loading medical report…
        </Typography>
      </Box>
    );
  }

  if (error && !report) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button
          sx={{ mt: 2, color: tokens.navy }}
          onClick={() => navigate("/reports")}
        >
          Back to my reports
        </Button>
      </Box>
    );
  }

  if (!report) return null;

  const statCards = [
    {
      label: "Tests extracted",
      value: results.length,
      icon: <FlaskConical size={18} />,
      color: tokens.info,
      tint: tokens.infoTint,
    },
    {
      label: "Normal",
      value: normalCount,
      icon: <CheckCircle size={18} />,
      color: tokens.normal,
      tint: tokens.normalTint,
    },
    {
      label: "Borderline",
      value: borderlineCount,
      icon: <Info size={18} />,
      color: tokens.borderline,
      tint: tokens.borderlineTint,
    },
    {
      label: "Abnormal",
      value: abnormalCount,
      icon: <AlertTriangle size={18} />,
      color: tokens.abnormal,
      tint: tokens.abnormalTint,
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: <AlertTriangle size={18} />,
      color: tokens.critical,
      tint: tokens.criticalTint,
    },
    {
      label: "Unclassified",
      value: unclassifiedCount,
      icon: <Activity size={18} />,
      color: tokens.inkSoft,
      tint: tokens.bgSubtle,
    },
  ];

  /* ---------- main render ---------- */

  return (
    <Box
      className="page-reveal"
      sx={{ width: "100%", maxWidth: tokens.contentMax, mx: "auto" }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/reports")}
            sx={{
              mb: 1,
              color: tokens.inkMuted,
              "&:hover": { bgcolor: tokens.bgSubtle },
            }}
          >
            Back to my reports
          </Button>

          <Typography variant="h4" color={tokens.navy}>
            Report analysis
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Review extracted information and AI-generated insights.
          </Typography>
        </Box>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ alignSelf: { xs: "flex-start", sm: "flex-end" }, pb: 0.5 }}
        >
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ClipboardList size={16} />}
            onClick={() => navigate(`/reports/${id}/review`)}
          >
            Review extracted values
          </Button>

          <ExportReport onExport={handleExport} disabled={downloading} />

          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={loadReport}
            disabled={loading}
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": { borderColor: tokens.teal, color: tokens.teal },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Action message */}
      {actionMessage && (
        <Alert
          severity={
            actionMessage.toLowerCase().includes("success") ||
            actionMessage.toLowerCase().includes("completed")
              ? "success"
              : "info"
          }
          sx={{ mb: 2.5 }}
          onClose={() => setActionMessage("")}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Report identity */}
      <Surface padding={2.5} sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: tokens.infoTint,
                color: tokens.info,
                display: "grid",
                placeItems: "center",
              }}
            >
              <FileText size={22} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={600}
                color={tokens.navy}
                noWrap
                title={report.originalFilename}
              >
                {report.originalFilename || "Medical report"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {report.fileType || "PDF"} ·{" "}
                {report.fileSizeBytes
                  ? `${(report.fileSizeBytes / 1024).toFixed(1)} KB`
                  : "File size unavailable"}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={report.processingStatus || "UPLOADED"}
            variant="outlined"
          />
        </Stack>
      </Surface>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((item, idx) => (
          <Grid item xs={6} sm={4} md={2} key={item.label}>
            <Box
              className="stagger-item"
              style={{ "--i": idx }}
              sx={{ height: "100%" }}
            >
              <Surface padding={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {item.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: item.tint,
                      color: item.color,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: tokens.navy }}
                >
                  {item.value}
                </Typography>
              </Surface>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Processing actions */}
      <Surface sx={{ mb: 3 }}>
        <SectionHeader
          title="Report processing"
          subtitle="Extract structured test results and generate AI insights from your uploaded report."
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={
              extracting ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <ClipboardList size={16} />
              )
            }
            onClick={handleExtract}
            disabled={extracting}
          >
            {extracting ? "Extracting…" : "Extract test results"}
          </Button>

          <Button
            variant="outlined"
            startIcon={
              summarizing ? (
                <CircularProgress size={15} />
              ) : (
                <Sparkles size={16} />
              )
            }
            onClick={handleSummary}
            disabled={
              summarizing || !extractedText || extractedText.length < 20
            }
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": { borderColor: tokens.teal, color: tokens.teal },
            }}
          >
            {summarizing ? "Generating…" : "Generate AI summary"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Bot size={16} />}
            onClick={() => navigate(`/reports/${id}/chat`)}
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": { borderColor: tokens.teal, color: tokens.teal },
            }}
          >
            Ask AI about this report
          </Button>
        </Stack>

        {!extractedText && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Extracted report text is not currently available. Generate the
            text through your backend extraction workflow before requesting
            an AI summary.
          </Alert>
        )}
      </Surface>

      {/* Test results */}
      <Surface sx={{ mb: 3 }}>
        {/* Header — chip below subtitle */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 0.5 }}
          >
            <Typography variant="h6" fontWeight={600} color={tokens.navy}>
              Extracted test results
            </Typography>

            {results.length > 0 && (
              <Chip
                size="small"
                icon={<ClipboardList size={13} />}
                label={`${results.length} extracted`}
                variant="outlined"
                sx={{ borderColor: tokens.border, color: tokens.inkSoft }}
              />
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Review extracted values and request AI explanations.
          </Typography>
        </Box>

        {reviewNotice && (
          <Alert
            severity={
              reviewNotice.toLowerCase().includes("success")
                ? "success"
                : "error"
            }
            sx={{ mb: 2 }}
            onClose={() => setReviewNotice("")}
          >
            {reviewNotice}
          </Alert>
        )}

        {results.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
            <FlaskConical size={38} color={tokens.inkFaint} />
            <Typography fontWeight={600} sx={{ mt: 1.5 }}>
              No test results available
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Click Extract Test Results to process this report.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleExtract}
              disabled={extracting}
              sx={{ mt: 2 }}
            >
              {extracting ? "Extracting…" : "Extract now"}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {results.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Box
                  className="stagger-item"
                  style={{ "--i": idx }}
                  sx={{ height: "100%" }}
                >
                  <ReviewResultCard
                    result={{ ...item, confidence: undefined }}
                    onReview={handleOpenReview}
                    onExplain={handleExplainTest}
                  />

                  {item.confidence !== undefined &&
                    item.confidence !== null && (
                      <Box sx={{ mt: 1 }}>
                        <ConfidenceIndicator confidence={item.confidence} />
                      </Box>
                    )}
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Surface>

      {/* ---------- Review dialog ---------- */}

      <Dialog
        open={Boolean(reviewingTest)}
        onClose={handleCloseReview}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: tokens.tealTint,
                color: tokens.teal,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Edit3 size={17} />
            </Box>
            <Typography fontWeight={600} color={tokens.navy}>
              Review extracted result
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {reviewDraft && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                Review the extracted values and save your correction. Saved
                changes are stored on the server and marked as manually
                reviewed.
              </Alert>

              {reviewNotice && (
                <Alert
                  severity={
                    reviewNotice.toLowerCase().includes("success")
                      ? "success"
                      : "error"
                  }
                  onClose={() => setReviewNotice("")}
                >
                  {reviewNotice}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Test name"
                value={reviewDraft.testName}
                onChange={(event) =>
                  setReviewDraft((draft) => ({
                    ...draft,
                    testName: event.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                label="Numeric value"
                value={reviewDraft.numericValue}
                onChange={(event) =>
                  setReviewDraft((draft) => ({
                    ...draft,
                    numericValue: event.target.value,
                    textValue: "",
                  }))
                }
                helperText="Enter a number if this result is numeric."
              />

              <TextField
                fullWidth
                label="Text value"
                value={reviewDraft.textValue}
                onChange={(event) =>
                  setReviewDraft((draft) => ({
                    ...draft,
                    textValue: event.target.value,
                    numericValue: "",
                  }))
                }
                helperText="Use for results such as Positive, Negative or Not Detected."
              />

              <TextField
                fullWidth
                label="Unit"
                value={reviewDraft.unit}
                onChange={(event) =>
                  setReviewDraft((draft) => ({
                    ...draft,
                    unit: event.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                label="Reference range"
                value={reviewDraft.referenceRange}
                onChange={(event) =>
                  setReviewDraft((draft) => ({
                    ...draft,
                    referenceRange: event.target.value,
                  }))
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseReview}
            disabled={savingReview}
            sx={{ color: tokens.inkMuted }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={
              savingReview ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save size={15} />
              )
            }
            onClick={handleApplyReviewDraft}
            disabled={savingReview || !reviewDraft?.testName?.trim()}
          >
            {savingReview ? "Saving…" : "Save correction"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Explanation dialog ---------- */}

      <Dialog
        open={Boolean(selectedTest)}
        onClose={handleCloseExplanation}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: tokens.tealTint,
                color: tokens.teal,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Sparkles size={17} />
            </Box>
            <Typography fontWeight={600} color={tokens.navy}>
              AI test explanation
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTest && (
            <Box>
              <Typography fontWeight={600} color={tokens.navy}>
                {selectedTest.testName || "Medical test"}
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mt: 2,
                  bgcolor: tokens.bg,
                  borderColor: tokens.border,
                  borderRadius: 1.5,
                }}
              >
                <Typography color="text.secondary" variant="caption">
                  Test result
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color={tokens.navy}
                >
                  {selectedTest.numericValue ??
                    selectedTest.textValue ??
                    "—"}{" "}
                  {selectedTest.unit || ""}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Reference range:{" "}
                  {selectedTest.referenceRange || "Not available"}
                </Typography>
                <Chip
                  sx={{ mt: 1.5 }}
                  size="small"
                  label={selectedTest.resultFlag || "UNCLASSIFIED"}
                  color={getFlagColor(selectedTest.resultFlag)}
                  variant="outlined"
                />
              </Paper>

              <Divider sx={{ my: 2 }} />

              {explainingTest ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <CircularProgress size={26} sx={{ color: tokens.teal }} />
                  <Typography sx={{ mt: 1.5 }} color="text.secondary">
                    Generating your test explanation…
                  </Typography>
                </Box>
              ) : testExplanation?.error ? (
                <Alert severity="error">{testExplanation.error}</Alert>
              ) : testExplanation ? (
                <Box>
                  <Typography
                    fontWeight={600}
                    color={tokens.navy}
                    sx={{ mb: 1 }}
                  >
                    What does this result mean?
                  </Typography>
                  <Typography
                    sx={{ lineHeight: 1.75 }}
                    color={tokens.ink}
                  >
                    {testExplanation.explanation ||
                      testExplanation.ai_explanation ||
                      "No explanation was returned by the AI service."}
                  </Typography>

                  {Array.isArray(testExplanation.possible_factors) &&
                    testExplanation.possible_factors.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography fontWeight={600} color={tokens.navy}>
                          Possible factors
                        </Typography>
                        <Box component="ul" sx={{ pl: 3, mt: 0.5 }}>
                          {testExplanation.possible_factors.map(
                            (factor, index) => (
                              <li key={index}>
                                <Typography
                                  sx={{ lineHeight: 1.7 }}
                                  color={tokens.ink}
                                >
                                  {factor}
                                </Typography>
                              </li>
                            )
                          )}
                        </Box>
                      </Box>
                    )}

                  <Alert
                    severity="warning"
                    sx={{
                      mt: 3,
                      bgcolor: tokens.borderlineTint,
                      color: tokens.ink,
                      "& .MuiAlert-icon": { color: tokens.borderline },
                    }}
                  >
                    <Typography variant="body2">
                      {testExplanation.disclaimer ||
                        "This explanation is for educational purposes only. It is not a diagnosis or treatment recommendation. Consult a qualified healthcare professional."}
                    </Typography>
                  </Alert>
                </Box>
              ) : null}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseExplanation}
            disabled={explainingTest}
            sx={{ color: tokens.inkMuted }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- AI summary ---------- */}

      {summary && (
        <Surface sx={{ mb: 3 }}>
          <SectionHeader
            title="AI medical report summary"
            subtitle="Educational summary based on the extracted report data."
            action={
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: tokens.tealTint,
                  color: tokens.teal,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Sparkles size={17} />
              </Box>
            }
          />

          <Typography
            sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
            color={tokens.ink}
          >
            {summary.summary || "No summary text returned."}
          </Typography>

          {[
            ["Important findings", summary.important_findings],
            ["Abnormal results", summary.abnormal_results],
            ["Normal results", summary.normal_results],
            ["Limitations", summary.limitations],
          ].map(([heading, items]) =>
            Array.isArray(items) && items.length > 0 ? (
              <Box key={heading} sx={{ mt: 2.5 }}>
                <Typography fontWeight={600} color={tokens.navy}>
                  {heading}
                </Typography>
                <Box component="ul" sx={{ mt: 0.5, pl: 3 }}>
                  {items.map((item, index) => (
                    <li key={index}>
                      <Typography color={tokens.ink}>
                        {String(item)}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            ) : null
          )}
        </Surface>
      )}

      {/* Source evidence */}
      {extractedText && (
        <Box sx={{ mb: 3 }}>
          <SourceEvidence
            sources={[{ id: "report-source", text: extractedText }]}
          />
        </Box>
      )}

      {/* Disclaimer */}
      <Alert
        severity="warning"
        sx={{
          mb: 3,
          bgcolor: tokens.borderlineTint,
          color: tokens.ink,
          "& .MuiAlert-icon": { color: tokens.borderline },
        }}
      >
        <Typography variant="body2">
          MediLens provides educational information only. It does not diagnose
          medical conditions or recommend treatment. Always consult a qualified
          healthcare professional about your results.
        </Typography>
      </Alert>
    </Box>
  );
}
