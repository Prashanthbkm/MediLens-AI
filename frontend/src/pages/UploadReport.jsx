import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

import { uploadReport } from "../services/reportService";
import Surface from "../components/common/Surface";
import { tokens } from "/theme";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PAGES_NOTE = 50; // enforced server-side

export default function UploadReport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  /* ---------- file validation ---------- */

  const validateFile = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError(
        "Only PDF medical reports are currently supported. Please convert your image or document to PDF."
      );
      setSelectedFile(null);
      setConsent(false);
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      setSelectedFile(null);
      setConsent(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The maximum supported size is 10 MB.`
      );
      setSelectedFile(null);
      setConsent(false);
      return;
    }

    setError("");
    setSelectedFile(file);
    setConsent(false);
    setUploadProgress(0);
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (uploading) return;
    validateFile(event.dataTransfer.files?.[0]);
  };

  /* ---------- upload ---------- */

  const handleUpload = async () => {
    if (!selectedFile || uploading || !consent) return;

    try {
      setUploading(true);
      setError("");
      setUploadProgress(0);

      const response = await uploadReport(selectedFile, setUploadProgress);

      const reportId = response?.reportId ?? response?.id;

      if (!reportId) {
        throw new Error(
          "Report uploaded, but the server did not return a report ID. Please check your report history."
        );
      }

      setUploadProgress(100);

      navigate(`/reports/${reportId}/processing`, { replace: true });
    } catch (err) {
      console.error("Report upload failed:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          "Unable to upload your report. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setConsent(false);
    setError("");
    setUploadProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /* ---------- render ---------- */

  return (
    <Box
      className="page-reveal"
      sx={{ maxWidth: 960, mx: "auto", width: "100%" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color={tokens.navy}>
          Upload medical report
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Upload your report to extract test results and understand your health
          information with MediLens AI.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ---------- Dropzone ---------- */}
      <Box
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          border: `2px dashed ${
            dragging ? tokens.teal : tokens.borderStrong
          }`,
          borderRadius: 3,
          backgroundColor: dragging ? tokens.tealTint : tokens.surface,
          transition: "background-color 150ms ease, border-color 150ms ease",
          cursor: uploading ? "default" : "pointer",
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            mx: "auto",
            mb: 2,
            borderRadius: 2,
            bgcolor: dragging ? tokens.surface : tokens.tealTint,
            color: tokens.teal,
            display: "grid",
            placeItems: "center",
            transition: "background-color 150ms ease",
          }}
        >
          <UploadCloud size={30} />
        </Box>

        <Typography variant="h6" fontWeight={600} color={tokens.navy}>
          {dragging ? "Drop your report here" : "Drag and drop your report"}
        </Typography>

        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          or browse files from your computer
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          disabled={uploading}
          onClick={(event) => {
            event.stopPropagation();
            fileInputRef.current?.click();
          }}
          sx={{ mt: 2.5, px: 3 }}
        >
          Browse files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          onChange={handleFileChange}
        />

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 2, lineHeight: 1.6 }}
        >
          <strong>Supported format:</strong> PDF (image reports coming soon) ·{" "}
          <strong>Max size:</strong> 10 MB · <strong>Max pages:</strong>{" "}
          {MAX_PAGES_NOTE} (enforced by the server)
        </Typography>
      </Box>

      {/* ---------- Selected file ---------- */}
      {selectedFile && (
        <Surface padding={2.5} sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: tokens.infoTint,
                color: tokens.info,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={19} />
            </Box>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                fontWeight={600}
                noWrap
                color={tokens.navy}
                title={selectedFile.name}
              >
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>

            <CheckCircle2 size={19} color={tokens.normal} />

            <Button
              disabled={uploading}
              onClick={clearSelection}
              sx={{
                minWidth: 36,
                color: tokens.abnormal,
                "&:hover": { bgcolor: tokens.abnormalTint },
              }}
            >
              <X size={17} />
            </Button>
          </Stack>
        </Surface>
      )}

      {/* ---------- Consent ---------- */}
      {selectedFile && (
        <Surface padding={2.5} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: tokens.tealTint,
                color: tokens.teal,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={19} />
            </Box>

            <Box>
              <Typography fontWeight={600} color={tokens.navy}>
                Privacy and processing consent
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, lineHeight: 1.65 }}
              >
                Your report contains sensitive health information. By
                continuing, you authorize MediLens AI to upload and process this
                report for text extraction and educational analysis.
              </Typography>
            </Box>
          </Stack>

          <FormControlLabel
            sx={{ mt: 1.5, ml: 0, alignItems: "flex-start" }}
            control={
              <Checkbox
                checked={consent}
                disabled={uploading}
                onChange={(event) => setConsent(event.target.checked)}
                size="small"
                sx={{ pt: 0.25, color: tokens.teal, "&.Mui-checked": { color: tokens.teal } }}
              />
            }
            label={
              <Typography variant="body2" color={tokens.ink}>
                I confirm that I have permission to upload this report and
                consent to its processing.
              </Typography>
            }
          />
        </Surface>
      )}

      {/* ---------- Upload progress ---------- */}
      {uploading && (
        <Surface padding={2.5} sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography fontWeight={600} color={tokens.navy} variant="body2">
              Uploading your report…
            </Typography>
            <Typography fontWeight={600} color={tokens.teal} variant="body2">
              {uploadProgress}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={uploadProgress}
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
            Please keep this page open while your report is uploading.
          </Typography>
        </Surface>
      )}

      {/* ---------- Upload button ---------- */}
      {selectedFile && (
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleUpload}
          disabled={uploading || !consent}
          startIcon={
            uploading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <UploadCloud size={17} />
            )
          }
          sx={{ mt: 3, py: 1.4 }}
        >
          {uploading ? "Uploading report…" : "Upload medical report"}
        </Button>
      )}

      {/* ---------- Info cards ---------- */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
        <Surface padding={2} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: tokens.tealTint,
                color: tokens.teal,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={16} />
            </Box>
            <Box>
              <Typography fontWeight={600} variant="body2" color={tokens.navy}>
                Secure upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reports are scoped to your authenticated account.
              </Typography>
            </Box>
          </Stack>
        </Surface>

        <Surface padding={2} sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: tokens.infoTint,
                color: tokens.info,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={16} />
            </Box>
            <Box>
              <Typography fontWeight={600} variant="body2" color={tokens.navy}>
                Result extraction
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported medical test results are extracted from your PDF.
              </Typography>
            </Box>
          </Stack>
        </Surface>
      </Stack>

      {/* ---------- Disclaimer ---------- */}
      <Alert
        severity="info"
        icon={<AlertTriangle size={16} />}
        sx={{
          mt: 3,
          bgcolor: tokens.infoTint,
          color: tokens.ink,
          "& .MuiAlert-icon": { color: tokens.info },
        }}
      >
        <Typography variant="body2">
          MediLens AI provides educational information only. It does not
          diagnose medical conditions or replace advice from a qualified
          healthcare professional.
        </Typography>
      </Alert>
    </Box>
  );
}