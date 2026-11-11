import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Eye,
  Pencil,
} from "lucide-react";

import {
  getReportById,
  getReportResults,
  getExtractedText,
  extractReportResults,
  saveTestResultCorrection,
} from "../services/reportService";

import Surface, { SectionHeader } from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const getFlag = (value) => {
  const flag = String(value || "").trim().toUpperCase();

  if (["NORMAL", "WITHIN_RANGE"].includes(flag)) return "NORMAL";
  if (["LOW", "HIGH", "ABNORMAL"].includes(flag)) return "ABNORMAL";
  if (flag === "BORDERLINE") return "BORDERLINE";
  if (flag === "CRITICAL") return "CRITICAL";

  return "UNCLASSIFIED";
};

const getFlagColor = (flag) => {
  switch (getFlag(flag)) {
    case "NORMAL":
      return "success";
    case "ABNORMAL":
    case "CRITICAL":
      return "error";
    case "BORDERLINE":
      return "warning";
    default:
      return "default";
  }
};

const getFlagTint = (flag) => {
  switch (getFlag(flag)) {
    case "NORMAL":
      return tokens.normalTint;
    case "ABNORMAL":
      return tokens.abnormalTint;
    case "CRITICAL":
      return tokens.criticalTint;
    case "BORDERLINE":
      return tokens.borderlineTint;
    default:
      return tokens.bgSubtle;
  }
};

const getResultName = (item) =>
  item.testName || item.parameterName || item.name || "Unnamed test";

const getResultValue = (item) =>
  item.numericValue ??
  item.textValue ??
  item.resultValue ??
  item.value ??
  item.testValue ??
  "";

const getReferenceRange = (item) =>
  item.referenceRange ||
  item.normalRange ||
  item.referenceInterval ||
  "Not provided";

const getResultUnit = (item) => item.unit || item.units || "";

const getConfidence = (item) => {
  const value = item.confidence;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return String(value);

  return `${Math.round(numericValue <= 1 ? numericValue * 100 : numericValue)}%`;
};

/* ---------- page ---------- */

export default function ExtractionReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [results, setResults] = useState([]);
  const [extractedText, setExtractedText] = useState("");

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState({
    testName: "",
    resultValue: "",
    unit: "",
    referenceRange: "",
  });

  const loadData = useCallback(async () => {
    if (!id) {
      setError("Report ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [reportData, resultData, textData] = await Promise.all([
        getReportById(id),
        getReportResults(id),
        getExtractedText(id).catch(() => null),
      ]);

      setReport(reportData?.data ?? reportData);

      const resultList =
        resultData?.data?.results ??
        resultData?.results ??
        resultData?.data ??
        resultData;

      setResults(Array.isArray(resultList) ? resultList : []);

      const extracted =
        typeof textData === "string"
          ? textData
          : textData?.data?.extractedText ??
            textData?.data?.text ??
            textData?.extractedText ??
            textData?.text ??
            "";

      setExtractedText(typeof extracted === "string" ? extracted : "");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Unable to load extraction review."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExtract = async () => {
    try {
      setExtracting(true);
      setError("");
      setMessage("");

      await extractReportResults(id);
      await loadData();

      setMessage("Test result extraction completed.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Extraction failed. Please try again."
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleStartEdit = (item, index) => {
    setEditingIndex(index);

    setDraft({
      testName: getResultName(item),
      resultValue: String(getResultValue(item)),
      unit: getResultUnit(item),
      referenceRange:
        item.referenceRange ??
        item.normalRange ??
        item.referenceInterval ??
        "",
    });
  };

  const handleApplyDraft = async () => {
    if (editingIndex === null || savingCorrection) return;

    const currentItem = results[editingIndex];

    if (!currentItem?.id) {
      setError(
        "This result does not have a valid ID. Reload the report and try again."
      );
      return;
    }

    const testName = draft.testName.trim();
    const rawValue = draft.resultValue.trim();

    if (!testName) {
      setError("Test name is required.");
      return;
    }

    if (!rawValue) {
      setError("Enter a numeric or text result value.");
      return;
    }

    const parsedNumericValue = Number(rawValue);
    const isNumericValue = Number.isFinite(parsedNumericValue);

    const correction = {
      testName,
      numericValue: isNumericValue ? parsedNumericValue : null,
      textValue: isNumericValue ? null : rawValue,
      unit: draft.unit.trim() || null,
      referenceRange: draft.referenceRange.trim() || null,
    };

    try {
      setSavingCorrection(true);
      setError("");
      setMessage("");

      const savedResult = await saveTestResultCorrection(
        id,
        currentItem.id,
        correction
      );

      const updatedResult = savedResult?.data ?? savedResult;

      setResults((previous) =>
        previous.map((item, index) =>
          index === editingIndex
            ? {
                ...item,
                ...updatedResult,
                manuallyReviewed: true,
                locallyEdited: false,
              }
            : item
        )
      );

      setEditingIndex(null);
      setMessage("Correction saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Unable to save this correction. Please try again."
      );
    } finally {
      setSavingCorrection(false);
    }
  };

  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return results;
    return results.filter((item) =>
      getResultName(item).toLowerCase().includes(query)
    );
  }, [results, searchTerm]);

  const counts = useMemo(() => {
    return results.reduce(
      (total, item) => {
        const flag = getFlag(item.resultFlag || item.flag || item.status);
        total.all += 1;
        if (flag === "NORMAL") total.normal += 1;
        else if (flag === "ABNORMAL") total.abnormal += 1;
        else if (flag === "BORDERLINE") total.borderline += 1;
        else if (flag === "CRITICAL") total.critical += 1;
        else total.unclassified += 1;
        return total;
      },
      {
        all: 0,
        normal: 0,
        abnormal: 0,
        borderline: 0,
        critical: 0,
        unclassified: 0,
      }
    );
  }, [results]);

  const fileName =
    report?.originalFileName ||
    report?.fileName ||
    report?.filename ||
    "Medical report";

  const statusSummary = [
    { label: "Total tests", value: counts.all, color: tokens.navy, tint: tokens.bgSubtle },
    { label: "Normal", value: counts.normal, color: tokens.normal, tint: tokens.normalTint },
    { label: "Borderline", value: counts.borderline, color: tokens.borderline, tint: tokens.borderlineTint },
    { label: "Abnormal", value: counts.abnormal, color: tokens.abnormal, tint: tokens.abnormalTint },
    { label: "Critical", value: counts.critical, color: tokens.critical, tint: tokens.criticalTint },
    { label: "Unclassified", value: counts.unclassified, color: tokens.inkSoft, tint: tokens.bgSubtle },
  ];

  /* ---------- loading ---------- */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={28} sx={{ color: tokens.teal }} />
          <Typography color="text.secondary">
            Loading extraction review…
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* ---------- page ---------- */

  return (
    <Box
      className="page-reveal"
      sx={{ width: "100%", maxWidth: tokens.contentMax, mx: "auto" }}
    >
      <Stack spacing={3}>
        {/* Back */}
        <Box>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/reports/${id}`)}
            sx={{
              mb: 2,
              textTransform: "none",
              color: tokens.inkMuted,
              "&:hover": { bgcolor: tokens.bgSubtle },
            }}
          >
            Back to report
          </Button>

          {/* Header row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" color={tokens.navy}>
                Extraction review
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Review the medical values extracted from your uploaded report.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              startIcon={
                extracting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <RefreshCw size={17} />
                )
              }
              disabled={extracting || savingCorrection}
              onClick={handleExtract}
            >
              {extracting ? "Extracting…" : "Run extraction"}
            </Button>
          </Stack>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {message && (
          <Alert severity="info" onClose={() => setMessage("")}>
            {message}
          </Alert>
        )}

        {/* Report identity card */}
        <Surface>
          <Stack direction="row" spacing={2} alignItems="center">
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

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={600} color={tokens.navy} noWrap>
                {fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Report ID: {id}
              </Typography>
            </Box>

            <Chip
              label={report?.processingStatus || "Status unavailable"}
              color="info"
              variant="outlined"
            />
          </Stack>
        </Surface>

        {/* Status summary KPIs */}
        <Grid container spacing={2}>
          {statusSummary.map((item, idx) => (
            <Grid item xs={6} sm={4} md={2} key={item.label}>
              <Box
                className="stagger-item"
                style={{ "--i": idx }}
                sx={{ height: "100%" }}
              >
                <Surface padding={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {item.label}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ color: item.color === tokens.navy ? tokens.navy : item.color }}
                  >
                    {item.value}
                  </Typography>
                </Surface>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Test values list */}
        <Surface>
          <SectionHeader
            title="Extracted test values"
            subtitle="Check each extracted value against the original report."
            action={
              <TextField
                size="small"
                placeholder="Search test name…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: tokens.inkFaint, mr: 1, display: "flex" }}>
                      <Search size={16} />
                    </Box>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            }
          />

          {filteredResults.length === 0 ? (
            <Alert severity="info">
              {results.length === 0
                ? "No extracted test values are available yet. Run extraction to try again."
                : "No test values match your search."}
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {filteredResults.map((item, rowIdx) => {
                const originalIndex = results.indexOf(item);
                const flag = getFlag(item.resultFlag || item.flag || item.status);
                const isEditing = editingIndex === originalIndex;

                return (
                  <Paper
                    key={item.id ?? `${getResultName(item)}-${originalIndex}`}
                    variant="outlined"
                    className="stagger-item"
                    style={{ "--i": rowIdx }}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: tokens.border,
                      borderLeft: `3px solid ${getFlagTint(flag)}`,
                      transition: "border-color 150ms ease",
                      "&:hover": { borderColor: tokens.borderStrong },
                    }}
                  >
                    {isEditing ? (
                      <Stack spacing={2}>
                        <Typography fontWeight={600} color={tokens.navy}>
                          Edit extracted value
                        </Typography>

                        <TextField
                          label="Test name"
                          fullWidth
                          value={draft.testName}
                          onChange={(event) =>
                            setDraft({ ...draft, testName: event.target.value })
                          }
                        />

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Result value"
                              fullWidth
                              value={draft.resultValue}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  resultValue: event.target.value,
                                })
                              }
                            />
                          </Grid>

                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Unit"
                              fullWidth
                              value={draft.unit}
                              onChange={(event) =>
                                setDraft({ ...draft, unit: event.target.value })
                              }
                            />
                          </Grid>

                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="Reference range"
                              fullWidth
                              value={draft.referenceRange}
                              onChange={(event) =>
                                setDraft({
                                  ...draft,
                                  referenceRange: event.target.value,
                                })
                              }
                            />
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={
                              savingCorrection ? (
                                <CircularProgress size={15} color="inherit" />
                              ) : (
                                <Save size={16} />
                              )
                            }
                            onClick={handleApplyDraft}
                            disabled={savingCorrection}
                          >
                            {savingCorrection ? "Saving…" : "Save correction"}
                          </Button>

                          <Button
                            onClick={() => setEditingIndex(null)}
                            disabled={savingCorrection}
                            sx={{ color: tokens.inkMuted }}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={2}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={600} color={tokens.navy}>
                              {getResultName(item)}
                            </Typography>

                            {item.manuallyReviewed && (
                              <Chip
                                size="small"
                                label="Reviewed"
                                color="success"
                                icon={<CheckCircle2 size={13} />}
                                sx={{ mt: 0.75 }}
                              />
                            )}
                          </Box>

                          <Chip
                            size="small"
                            label={flag.replace("_", " ")}
                            color={getFlagColor(flag)}
                            variant="outlined"
                          />
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              Result value
                            </Typography>
                            <Typography fontWeight={600} sx={{ color: tokens.ink }}>
                              {getResultValue(item) || "Not available"}{" "}
                              {getResultUnit(item)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              Reference range
                            </Typography>
                            <Typography fontWeight={500} sx={{ color: tokens.ink }}>
                              {getReferenceRange(item)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              Confidence
                            </Typography>
                            <Typography fontWeight={500} sx={{ color: tokens.ink }}>
                              {getConfidence(item) ?? "Not provided"}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              Review status
                            </Typography>
                            <Typography fontWeight={500} sx={{ color: tokens.ink }}>
                              {item.manuallyReviewed
                                ? "Saved and reviewed"
                                : "Needs verification"}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box>
                          <Button
                            size="small"
                            startIcon={<Pencil size={15} />}
                            onClick={() => handleStartEdit(item, originalIndex)}
                            sx={{
                              color: tokens.teal,
                              "&:hover": { bgcolor: tokens.tealTint },
                            }}
                          >
                            Review / Edit
                          </Button>
                        </Box>
                      </Stack>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Surface>

        {/* Original extracted text */}
        <Surface>
          <SectionHeader
            title="Original extracted text"
            subtitle="Source text captured from your uploaded document."
            action={
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: tokens.bgSubtle,
                  color: tokens.inkSoft,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Eye size={16} />
              </Box>
            }
          />

          {extractedText ? (
            <Box
              sx={{
                maxHeight: 350,
                overflow: "auto",
                p: 2,
                bgcolor: tokens.bg,
                border: `1px solid ${tokens.border}`,
                borderRadius: 1.5,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                fontFamily: tokens.fontMono,
                fontSize: 12.5,
                lineHeight: 1.7,
                color: tokens.inkMuted,
              }}
            >
              {extractedText}
            </Box>
          ) : (
            <Alert severity="info">
              Extracted source text is not available for this report.
            </Alert>
          )}
        </Surface>

        {/* Disclaimer */}
        <Alert
          severity="warning"
          icon={<ShieldCheck size={18} />}
          sx={{
            bgcolor: tokens.borderlineTint,
            color: tokens.ink,
            "& .MuiAlert-icon": { color: tokens.borderline },
          }}
        >
          <Typography variant="body2">
            Please verify every extracted value against your original
            laboratory report. These values are provided for informational
            purposes and are not a medical diagnosis. Corrections you save
            are stored with this report so they remain available when you
            return.
          </Typography>
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/reports/${id}`)}
          sx={{
            alignSelf: "flex-start",
            borderColor: tokens.border,
            color: tokens.navy,
            "&:hover": { borderColor: tokens.teal, color: tokens.teal },
          }}
        >
          Return to report analysis
        </Button>
      </Stack>
    </Box>
  );
}