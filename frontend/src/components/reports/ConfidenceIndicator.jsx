import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { tokens } from "/theme";

export default function ConfidenceIndicator({
  confidence = 0,
  label = "Extraction confidence",
  showPercentage = true,
}) {
  const score = Math.min(100, Math.max(0, Number(confidence) || 0));

  const getConfidenceLevel = () => {
    if (score >= 80) {
      return {
        text: "High",
        color: "success",
        icon: CheckCircle2,
      };
    }

    if (score >= 50) {
      return {
        text: "Moderate",
        color: "warning",
        icon: AlertTriangle,
      };
    }

    return {
      text: "Low",
      color: "error",
      icon: AlertCircle,
    };
  };

  const level = getConfidenceLevel();
  const Icon = level.icon;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
        gap={1}
      >
        <Typography
          fontWeight={600}
          variant="body2"
          color={tokens.navy}
          noWrap
        >
          {label}
        </Typography>

        <Chip
          icon={<Icon size={13} />}
          label={level.text}
          color={level.color}
          size="small"
          variant="outlined"
        />
      </Box>

      <LinearProgress
        variant="determinate"
        value={score}
        color={level.color}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: tokens.border,
          "& .MuiLinearProgress-bar": {
            borderRadius: 5,
            transition: "transform 400ms cubic-bezier(0.2, 0.7, 0.2, 1)",
          },
        }}
      />

      {showPercentage && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "right", mt: 0.5 }}
        >
          ≈ {score.toFixed(1)}% — model signal, not clinical certainty
        </Typography>
      )}
    </Box>
  );
}