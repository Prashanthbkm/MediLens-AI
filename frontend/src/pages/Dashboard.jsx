import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  UploadCloud,
  RefreshCw,
  Activity,
  MessageSquare,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

import { getReports } from "../services/reportService";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { tokens } from "/theme";

import Surface, { SectionHeader } from "../components/common/Surface";
import ReportCharts from "../components/dashboard/ReportCharts";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import RecentActivity from "../components/dashboard/RecentActivity";
import ReportTable from "../components/dashboard/ReportTable";
import FeedbackDialog from "../components/common/FeedbackDialog";

/* ---------- constants + helpers ---------- */

const COLORS = {
  processed: tokens.normal,
  review: tokens.borderline,
  failed: tokens.abnormal,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getReportStatus = (status) => {
  const value = String(status || "").toUpperCase();

  if (value.includes("FAIL") || value.includes("ERROR")) {
    return {
      label: status || "Failed",
      category: "failed",
      color: "error",
      icon: AlertTriangle,
    };
  }

  if (
    value.includes("EXTRACT") ||
    value.includes("COMPLETE") ||
    value.includes("PROCESSED") ||
    value.includes("SUCCESS")
  ) {
    return {
      label: status,
      category: "processed",
      color: "success",
      icon: CheckCircle2,
    };
  }

  if (
    value.includes("REVIEW") ||
    value.includes("UPLOADED") ||
    value.includes("PENDING")
  ) {
    return {
      label: status || "Needs review",
      category: "review",
      color: "warning",
      icon: AlertTriangle,
    };
  }

  if (value.includes("PROCESS")) {
    return {
      label: status,
      category: "processing",
      color: "info",
      icon: Clock3,
    };
  }

  return {
    label: status || "Unknown",
    category: "other",
    color: "default",
    icon: FileText,
  };
};

/* ---------- presentational ---------- */

function StatusChip({ status }) {
  const config = getReportStatus(status);
  const Icon = config.icon;

  return (
    <Chip
      size="small"
      icon={<Icon size={13} />}
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  tint,
  loading,
}) {
  return (
    <Surface padding={2.25}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
          >
            {title}
          </Typography>

          {loading ? (
            <Skeleton width={70} height={42} sx={{ mt: 0.5 }} />
          ) : (
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mt: 0.5, color: tokens.navy }}
            >
              {value.toLocaleString("en-IN")}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color,
            backgroundColor: tint,
          }}
        >
          <Icon size={20} />
        </Box>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1 }}
      >
        {subtitle}
      </Typography>
    </Surface>
  );
}

function StatusOverview({ counts, loading }) {
  const chartData = [
    {
      name: "Processed",
      value: counts.processed,
      color: COLORS.processed,
    },
    {
      name: "Needs review",
      value: counts.review,
      color: COLORS.review,
    },
    {
      name: "Failed",
      value: counts.failed,
      color: COLORS.failed,
    },
  ];

  const visibleData = chartData.filter((item) => item.value > 0);
  const hasData = visibleData.length > 0;

  return (
    <Surface>
      <SectionHeader
        title="Processing overview"
        subtitle="Distribution of your report statuses."
      />

      {loading ? (
        <Box sx={{ py: 3 }}>
          <Skeleton
            variant="circular"
            width={150}
            height={150}
            sx={{ mx: "auto" }}
          />
          <Skeleton width="70%" sx={{ mx: "auto", mt: 2 }} />
        </Box>
      ) : !hasData ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Activity size={32} color={tokens.inkFaint} />

          <Typography fontWeight={600} sx={{ mt: 1 }}>
            No report data yet
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Upload a report to see its processing status.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              height: 200,
              position: "relative",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={400}
                >
                  {visibleData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>

                <ChartTooltip
                  formatter={(value, name) => [
                    `${value} report${value === 1 ? "" : "s"}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                color={tokens.navy}
              >
                {counts.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.25} sx={{ mt: 1 }}>
            {chartData.map((item) => (
              <Stack
                key={item.name}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.name}
                  </Typography>
                </Stack>

                <Typography fontWeight={600}>{item.value}</Typography>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Surface>
  );
}

/* ---------- page ---------- */

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("ALL");
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const response = await getReports();
      setReports(Array.isArray(response) ? response : []);

      try {
        const statsResponse = await api.get("/dashboard/stats");
        const statsPayload =
          statsResponse.data?.data ?? statsResponse.data ?? {};
        setDashboardStats(statsPayload);
      } catch (statsError) {
        console.warn("Dashboard statistics unavailable:", statsError);
        setDashboardStats({});
      }
    } catch (err) {
      console.error("Dashboard report loading failed:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load your reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) =>
          new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0)
      ),
    [reports]
  );

  const counts = useMemo(() => {
    const result = {
      total: reports.length,
      processed: 0,
      review: 0,
      failed: 0,
    };

    reports.forEach((report) => {
      const category = getReportStatus(report.processingStatus).category;
      if (category === "processed") result.processed += 1;
      if (category === "review") result.review += 1;
      if (category === "failed") result.failed += 1;
    });

    return result;
  }, [reports]);

  const recentReports = sortedReports.slice(0, 5);

  const filteredReports = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return sortedReports.filter((report) => {
      const filename = String(
        report.originalFilename || ""
      ).toLowerCase();
      const status = String(
        report.processingStatus || ""
      ).toUpperCase();

      const matchesSearch = !search || filename.includes(search);

      const matchesStatus =
        statusValue === "ALL" ||
        (statusValue === "COMPLETED" &&
          (status.includes("COMPLETE") ||
            status.includes("EXTRACT") ||
            status.includes("PROCESSED") ||
            status.includes("SUCCESS"))) ||
        (statusValue === "PROCESSING" && status.includes("PROCESS")) ||
        (statusValue === "FAILED" &&
          (status.includes("FAIL") || status.includes("ERROR"))) ||
        (statusValue === "PENDING" &&
          (status.includes("PENDING") ||
            status.includes("UPLOAD") ||
            status.includes("REVIEW")));

      return matchesSearch && matchesStatus;
    });
  }, [sortedReports, searchValue, statusValue]);

  const attentionReports = sortedReports.filter((report) => {
    const category = getReportStatus(report.processingStatus).category;
    return category === "review" || category === "failed";
  });

  const openReport = (id) => {
    if (id) navigate(`/reports/${id}`);
  };

  const firstName =
    user?.fullName?.trim().split(/\s+/)[0] || "there";

  const summaryCards = [
    {
      title: "Total reports",
      value: counts.total,
      subtitle: "Reports in your account",
      icon: FileText,
      color: tokens.info,
      tint: tokens.infoTint,
    },
    {
      title: "Processed",
      value: counts.processed,
      subtitle: "Successfully extracted",
      icon: CheckCircle2,
      color: tokens.normal,
      tint: tokens.normalTint,
    },
    {
      title: "Needs review",
      value: counts.review,
      subtitle: "Awaiting your review",
      icon: AlertTriangle,
      color: tokens.borderline,
      tint: tokens.borderlineTint,
    },
    {
      title: "Failed",
      value: counts.failed,
      subtitle: "Processing errors",
      icon: Activity,
      color: tokens.abnormal,
      tint: tokens.abnormalTint,
    },
  ];

  return (
    <Box
      className="page-reveal"
      sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}
    >
      {/* ---------- Header ---------- */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" color={tokens.navy}>
            {getGreeting()}, {firstName}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Here's your medical report overview.
          </Typography>
        </Box>

        {/* Small icon-only refresh */}
        <Tooltip title="Refresh report data">
          <span>
            <IconButton
              onClick={() => fetchReports(true)}
              disabled={loading || refreshing}
              aria-label="Refresh report data"
              sx={{
                color: tokens.inkSoft,
                bgcolor: tokens.surface,
                border: `1px solid ${tokens.border}`,
                width: 40,
                height: 40,
                "&:hover": {
                  color: tokens.teal,
                  borderColor: tokens.tealTint,
                  bgcolor: tokens.tealTint,
                },
                "&.Mui-disabled": {
                  bgcolor: tokens.bg,
                  borderColor: tokens.border,
                  color: tokens.inkFaint,
                },
              }}
            >
              {refreshing ? (
                <RefreshCw
                  size={17}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <RefreshCw size={17} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchReports()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ---------- Upload CTA ---------- */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          border: `1px solid ${tokens.tealTint}`,
          borderRadius: 2.5,
          background: `linear-gradient(110deg, ${tokens.tealTint}, #FFFFFF 65%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: tokens.teal,
                backgroundColor: "#FFFFFF",
                border: `1px solid ${tokens.tealTint}`,
              }}
            >
              <UploadCloud size={22} />
            </Box>

            <Box>
              <Typography fontWeight={600} color={tokens.navy}>
                Upload a new medical report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a PDF report to extract and review your test results.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<UploadCloud size={16} />}
            onClick={() => navigate("/upload")}
          >
            Upload Report
          </Button>
        </Stack>
      </Paper>

      {/* ---------- Summary cards ---------- */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <Box
              className="stagger-item"
              style={{ "--i": idx }}
              sx={{ height: "100%" }}
            >
              <SummaryCard
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                color={card.color}
                tint={card.tint}
                loading={loading}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ---------- Attention + donut ---------- */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Surface>
            <SectionHeader
              title="Needs your attention"
              subtitle="Reports waiting for review or with processing errors."
              action={
                <Chip
                  size="small"
                  label={loading ? "…" : attentionReports.length}
                  color={
                    attentionReports.length ? "warning" : "default"
                  }
                  variant="outlined"
                />
              }
            />

            {loading ? (
              <Stack spacing={1.5}>
                <Skeleton height={56} />
                <Skeleton height={56} />
              </Stack>
            ) : attentionReports.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CheckCircle2 size={30} color={tokens.normal} />
                <Typography fontWeight={600} sx={{ mt: 1 }}>
                  You're all caught up
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No reports currently need your attention.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {attentionReports.slice(0, 5).map((report, idx) => {
                  const status = getReportStatus(
                    report.processingStatus
                  );
                  return (
                    <Paper
                      key={report.id}
                      variant="outlined"
                      className="stagger-item"
                      style={{ "--i": idx }}
                      sx={{ p: 1.75, borderRadius: 1.5 }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1.5}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={600} noWrap>
                            {report.originalFilename || "Medical Report"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                          >
                            <StatusChip
                              status={report.processingStatus}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(report.uploadedAt)}
                            </Typography>
                          </Stack>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openReport(report.id)}
                        >
                          {status.category === "failed"
                            ? "View details"
                            : "Review"}
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Surface>
        </Grid>

        <Grid item xs={12} md={4}>
          <StatusOverview counts={counts} loading={loading} />
        </Grid>
      </Grid>

      {/* ---------- Report charts ---------- */}
      <Box sx={{ mb: 3 }}>
        <ReportCharts
          stats={dashboardStats}
          reports={dashboardStats.recentReports || reports}
          loading={loading}
        />
      </Box>

      {/* ---------- Recent activity ---------- */}
      <Box sx={{ mb: 3 }}>
        <RecentActivity
          reports={recentReports}
          onViewAll={() => navigate("/reports")}
          onReportClick={(report) => openReport(report.id)}
        />
      </Box>

      {/* ---------- All reports ---------- */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader
          title="All medical reports"
          subtitle="Search, filter, and view your uploaded reports."
        />

        <DashboardFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          statusValue={statusValue}
          onStatusChange={setStatusValue}
          onReset={() => {
            setSearchValue("");
            setStatusValue("ALL");
          }}
        />

        <Box sx={{ mt: 2 }}>
          <ReportTable
            reports={filteredReports}
            loading={loading}
            onReportClick={(report) => openReport(report.id)}
          />
        </Box>
      </Box>

      {/* ---------- Disclaimer ---------- */}
      <Alert
        severity="info"
        icon={false}
        sx={{ bgcolor: tokens.infoTint, color: tokens.ink, mb: 2 }}
      >
        <Typography variant="body2">
          <strong>MediLens AI</strong> is an educational medical report
          analysis platform. It does not provide medical diagnoses or
          replace professional medical advice. Always consult a
          qualified healthcare professional when interpreting medical
          results.
        </Typography>
      </Alert>

      {/* ---------- Feedback footer ---------- */}
      <Box
        sx={{
          textAlign: "center",
          py: 2.5,
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          Help us improve MediLens AI
        </Typography>

        <Button
          size="small"
          onClick={() => setFeedbackOpen(true)}
          startIcon={<MessageSquare size={14} />}
          sx={{
            color: tokens.inkMuted,
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              color: tokens.teal,
              bgcolor: tokens.tealTint,
            },
          }}
        >
          Share feedback
        </Button>
      </Box>
    </Box>
  );
}