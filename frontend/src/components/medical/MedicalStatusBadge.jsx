import { Chip } from "@mui/material";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { tokens } from "/theme";

export default function MedicalStatusBadge({
  status,
  size = "small",
}) {
  const value = String(status || "").toUpperCase();

  let config = {
    label: "Unclassified",
    color: "default",
    icon: HelpCircle,
    sx: {},
  };

  if (value.includes("CRITICAL")) {
    config = {
      label: "Critical",
      color: "error",
      icon: AlertCircle,
      // Critical is deeper than Abnormal — distinguish visually, not just by label
      sx: {
        color: tokens.critical,
        borderColor: tokens.critical,
        backgroundColor: tokens.criticalTint,
        "& .MuiChip-icon": { color: tokens.critical },
      },
    };
  } else if (
    value.includes("HIGH") ||
    value.includes("LOW") ||
    value.includes("ABNORMAL")
  ) {
    config = {
      label: value.includes("HIGH")
        ? "High"
        : value.includes("LOW")
          ? "Low"
          : "Abnormal",
      color: "warning",
      icon: AlertTriangle,
      sx: {},
    };
  } else if (value.includes("NORMAL")) {
    config = {
      label: "Normal",
      color: "success",
      icon: CheckCircle2,
      sx: {},
    };
  }

  const Icon = config.icon;

  return (
    <Chip
      size={size}
      icon={<Icon size={14} />}
      label={config.label}
      color={config.color}
      variant="outlined"
      sx={config.sx}
    />
  );
}