import { Box, Typography, Chip, Divider, Stack, Button } from "@mui/material";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";

import Surface from "../common/Surface";
import ConfidenceIndicator from "./ConfidenceIndicator";
import { tokens } from "/theme";

export default function ReviewResultCard({ result = {}, onReview, onExplain }) {
  const {
    testName = "Unknown Test",
    numericValue,
    textValue,
    unit = "",
    referenceRange = "Not available",
    resultFlag = "",
    confidence,
    manuallyReviewed,
  } = result;

  const flag = String(resultFlag || "").toUpperCase();

  const isCritical = flag.includes("CRITICAL");
  const isAbnormal =
    isCritical ||
    flag.includes("HIGH") ||
    flag.includes("LOW") ||
    flag.includes("ABNORMAL");
  const isNormal = flag.includes("NORMAL");

  const statusColor = isCritical
    ? "error"
    : isAbnormal
      ? "warning"
      : isNormal
        ? "success"
        : "default";

  const StatusIcon = isCritical
    ? AlertCircle
    : isAbnormal
      ? AlertTriangle
      : isNormal
        ? CheckCircle2
        : HelpCircle;

  const criticalChipSx = isCritical
    ? {
        color: tokens.critical,
        borderColor: tokens.critical,
        backgroundColor: tokens.criticalTint,
        "& .MuiChip-icon": { color: tokens.critical },
      }
    : undefined;

  const displayValue =
    numericValue !== null && numericValue !== undefined
      ? `${numericValue} ${unit}`.trim()
      : textValue || "Not available";

  const valueColor = isCritical
    ? tokens.critical
    : isAbnormal
      ? tokens.abnormal
      : tokens.navy;

  return (
    <Surface
      padding={2.5}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 250,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            fontWeight={600}
            variant="subtitle1"
            color={tokens.navy}
            noWrap
            title={testName}
          >
            {testName}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Medical test result
          </Typography>
        </Box>

        <Chip
          icon={<StatusIcon size={14} />}
          label={resultFlag || "Unclassified"}
          color={statusColor}
          size="small"
          variant="outlined"
          sx={criticalChipSx}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Value */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Result value
        </Typography>

        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: valueColor,
            lineHeight: 1.2,
            mt: 0.5,
            wordBreak: "break-word",
          }}
        >
          {displayValue}
        </Typography>
      </Box>

      {/* Reference range */}
      <Box sx={{ mb: "auto" }}>
        <Typography variant="caption" color="text.secondary">
          Reference range
        </Typography>

        <Typography
          fontWeight={500}
          variant="body2"
          sx={{ color: tokens.ink, mt: 0.5 }}
        >
          {referenceRange || "—"}
        </Typography>
      </Box>

      {/* Confidence */}
      {confidence !== undefined && confidence !== null && (
        <>
          <Divider sx={{ my: 2 }} />
          <ConfidenceIndicator confidence={confidence} />
        </>
      )}

      {/* Actions Footer */}
      <Divider sx={{ my: 2 }} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        {/* LEFT SIDE: Reviewed Chip or Explain Button */}
        <Box>
          {manuallyReviewed ? (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label="Reviewed"
            />
          ) : (
            onExplain && (
              <Button
                size="small"
                variant="text"
                startIcon={<Info size={14} />}
                onClick={() => onExplain(result)}
                sx={{
                  color: tokens.teal,
                  bgcolor: tokens.tealTint,
                  "&:hover": {
                    bgcolor: "rgba(22,140,134,0.15)",
                  },
                }}
              >
                Explain
              </Button>
            )
          )}
        </Box>

        {/* RIGHT SIDE: Review Button */}
        {onReview && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onReview(result)}
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": {
                borderColor: tokens.teal,
                color: tokens.teal,
                bgcolor: "transparent",
              },
            }}
          >
            Review
          </Button>
        )}
      </Stack>
    </Surface>
  );
}