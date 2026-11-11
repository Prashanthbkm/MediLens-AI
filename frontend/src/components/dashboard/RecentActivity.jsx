import React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import { 
  FileText, 
  ArrowRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";

import Surface, { SectionHeader } from "../common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusData = (status) => {
  const val = String(status || "").toUpperCase();
  if (val.includes("FAIL") || val.includes("ERROR")) {
    return { color: tokens.abnormal, tint: tokens.abnormalTint, icon: AlertCircle, label: "Failed" };
  }
  if (val.includes("COMPLETE") || val.includes("SUCCESS") || val.includes("PROCESSED")) {
    return { color: tokens.normal, tint: tokens.normalTint, icon: CheckCircle2, label: "Processed" };
  }
  if (val.includes("PROCESS")) {
    return { color: tokens.info, tint: tokens.infoTint, icon: Activity, label: "Processing" };
  }
  return { color: tokens.borderline, tint: tokens.borderlineTint, icon: Clock, label: "Pending" };
};

/* ---------- component ---------- */

const RecentActivity = ({ reports = [], onViewAll, onReportClick }) => {
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
    .slice(0, 5);

  return (
    <Surface>
      <SectionHeader
        title="Recent activity"
        subtitle="A timeline of your latest medical report uploads."
        action={
          <Button
            size="small"
            endIcon={<ArrowRight size={16} />}
            onClick={onViewAll}
            sx={{ textTransform: "none", fontWeight: 600, color: tokens.navy, "&:hover": { color: tokens.teal } }}
          >
            View all reports
          </Button>
        }
      />

      {recentReports.length === 0 ? (
        <Box py={5} textAlign="center" color="text.secondary">
          <FileText size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
          <Typography fontWeight={600}>No recent activity</Typography>
          <Typography variant="body2">
            Upload your first report to see your timeline here.
          </Typography>
        </Box>
      ) : (
        /* The Vertical Timeline Container */
        <Box sx={{ position: "relative", mt: 3, ml: { xs: 1, sm: 2 }, mr: 1 }}>
          
          {/* The continuous vertical line */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              bottom: 20,
              left: 15, // Aligns with the center of the icons
              width: 2,
              bgcolor: tokens.border,
              zIndex: 0,
            }}
          />

          <Stack spacing={3}>
            {recentReports.map((report, idx) => {
              const status = getStatusData(report.processingStatus);
              const StatusIcon = status.icon;

              return (
                <Box
                  key={report.id}
                  className="stagger-item"
                  style={{ "--i": idx }}
                  sx={{ position: "relative", zIndex: 1, display: "flex", gap: 2.5 }}
                >
                  {/* Timeline Node (Icon) */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      borderRadius: "50%",
                      bgcolor: status.tint,
                      color: status.color,
                      display: "grid",
                      placeItems: "center",
                      border: `2px solid ${tokens.surface}`,
                      boxShadow: `0 0 0 2px ${tokens.border}`,
                      mt: 0.5, // Slight offset to align with the card text
                    }}
                  >
                    <StatusIcon size={16} />
                  </Box>

                  {/* The Content Card */}
                  <Paper
                    variant="outlined"
                    onClick={() => onReportClick?.(report)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      p: 2,
                      borderRadius: 2,
                      borderColor: tokens.border,
                      cursor: onReportClick ? "pointer" : "default",
                      transition: "all 0.15s ease",
                      "&:hover": onReportClick
                        ? {
                            borderColor: tokens.tealTint,
                            bgcolor: tokens.bg,
                            transform: "translateX(4px)", // Subtle slide effect on hover
                          }
                        : {},
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          fontWeight={600}
                          variant="body2"
                          color={tokens.navy}
                          noWrap
                          title={report.originalFilename}
                        >
                          {report.originalFilename || "Untitled report"}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                          <Clock size={13} color={tokens.inkSoft} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(report.uploadedAt)}
                          </Typography>
                        </Stack>
                      </Box>

                      <Chip
                        size="small"
                        label={status.label}
                        sx={{
                          bgcolor: status.tint,
                          color: status.color,
                          fontWeight: 600,
                          border: "none",
                        }}
                      />
                    </Stack>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Surface>
  );
};

export default RecentActivity;