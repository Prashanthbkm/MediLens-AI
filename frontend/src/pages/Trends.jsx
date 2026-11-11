import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getReports, getReportResults } from "../services/reportService";
import Surface, { SectionHeader } from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const unwrapArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const candidates = [
    value.data,
    value.results,
    value.content,
    value.items,
    value.data?.results,
    value.data?.content,
  ];

  return candidates.find(Array.isArray) || [];
};

const getNumericValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeFlag = (flag) => {
  const value = String(flag || "").trim().toUpperCase();
  const validFlags = [
    "NORMAL",
    "LOW",
    "HIGH",
    "ABNORMAL",
    "BORDERLINE",
    "CRITICAL",
  ];
  return validFlags.includes(value) ? value : "UNCLASSIFIED";
};

const getFlagColor = (flag) => {
  const value = normalizeFlag(flag);
  switch (value) {
    case "NORMAL":
      return "success";
    case "CRITICAL":
      return "error";
    case "LOW":
    case "HIGH":
    case "ABNORMAL":
    case "BORDERLINE":
      return "warning";
    default:
      return "default";
  }
};

/* Blueprint §15: "No reference interval → mark not assessed" */
const hasValidReference = (range) => {
  const value = String(range || "").trim();
  if (!value) return false;
  if (/^(not (provided|available)|n\/a|—|--|unknown)$/i.test(value)) return false;
  return true;
};

/* ---------- page ---------- */

export default function Trends() {
  const [records, setRecords] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [failedReports, setFailedReports] = useState(0);

  const loadTrends = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const reportsResponse = await getReports();
      const reports = unwrapArray(reportsResponse);

      if (reports.length === 0) {
        setRecords([]);
        setSelectedMetric("");
        setFailedReports(0);
        return;
      }

      let failures = 0;

      const reportResults = await Promise.all(
        reports.map(async (report) => {
          try {
            const response = await getReportResults(report.id);
            const results = unwrapArray(response);

            return results.map((result) => ({
              ...result,
              reportId: report.id,
              reportName: report.originalFilename || "Medical report",
              reportDate: report.uploadedAt,
            }));
          } catch (err) {
            console.error(
              `Unable to load results for report ${report.id}:`,
              err
            );
            failures += 1;
            return [];
          }
        })
      );

      setRecords(reportResults.flat());
      setFailedReports(failures);
    } catch (err) {
      console.error("Unable to load health trends:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to load your health trends."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrends();
  }, [loadTrends]);

  /* Group by test name + unit (blueprint §8: never mix incompatible units) */
  const metrics = useMemo(() => {
    const grouped = new Map();

    records.forEach((record) => {
      const testName = String(record.testName || "").trim();
      const unit = String(record.unit || "").trim();
      const numericValue = getNumericValue(record.numericValue);

      if (!testName || numericValue === null) return;

      const key = `${testName.toLowerCase()}::${unit.toLowerCase()}`;

      if (!grouped.has(key)) {
        grouped.set(key, { key, testName, unit, points: [] });
      }

      const dateValue = record.createdAt || record.reportDate;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return;

      grouped.get(key).points.push({
        value: numericValue,
        date: date.toISOString(),
        dateLabel: formatDate(date),
        flag: normalizeFlag(record.resultFlag),
        reportName: record.reportName,
        reportId: record.reportId,
        referenceRange: record.referenceRange,
        manuallyReviewed: Boolean(record.manuallyReviewed),
        notAssessed: !hasValidReference(record.referenceRange),
      });
    });

    return Array.from(grouped.values())
      .map((metric) => ({
        ...metric,
        points: metric.points.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      }))
      .filter((metric) => metric.points.length > 0)
      .sort((a, b) => a.testName.localeCompare(b.testName));
  }, [records]);

  useEffect(() => {
    if (!metrics.length) {
      setSelectedMetric("");
      return;
    }
    if (!metrics.some((m) => m.key === selectedMetric)) {
      setSelectedMetric(metrics[0].key);
    }
  }, [metrics, selectedMetric]);

  const activeMetric = metrics.find((m) => m.key === selectedMetric);
  const points = activeMetric?.points || [];
  const latest = points.length ? points[points.length - 1] : null;
  const previous = points.length > 1 ? points[points.length - 2] : null;

  const change =
    latest && previous ? latest.value - previous.value : null;

  const abnormalCount = points.filter((p) =>
    ["LOW", "HIGH", "ABNORMAL"].includes(normalizeFlag(p.flag))
  ).length;

  const normalCount = points.filter(
    (p) => normalizeFlag(p.flag) === "NORMAL"
  ).length;

  const borderlineCount = points.filter(
    (p) => normalizeFlag(p.flag) === "BORDERLINE"
  ).length;

  const criticalCount = points.filter(
    (p) => normalizeFlag(p.flag) === "CRITICAL"
  ).length;

  const notAssessedCount = points.filter((p) => p.notAssessed).length;

  const unclassifiedCount = points.filter(
    (p) => normalizeFlag(p.flag) === "UNCLASSIFIED" && !p.notAssessed
  ).length;

  const chartData = points.map((point, index) => ({
    ...point,
    label: `${formatDate(point.date)} #${index + 1}`,
  }));

  const totalNumericResults = records.filter(
    (record) => getNumericValue(record.numericValue) !== null
  ).length;

  /* Stats grid definition (blueprint-honest labels) */
  const stats = [
    {
      label: "Tracked tests",
      value: metrics.length,
      icon: <Activity size={18} />,
      color: tokens.teal,
      tint: tokens.tealTint,
      subtitle: "Distinct test + unit groups",
    },
    {
      label: "Numeric results",
      value: totalNumericResults,
      icon: <FileText size={18} />,
      color: tokens.info,
      tint: tokens.infoTint,
      subtitle: "Across all reports",
    },
    {
      label: "Normal",
      value: normalCount,
      icon: <TrendingUp size={18} />,
      color: tokens.normal,
      tint: tokens.normalTint,
      subtitle: "Selected test",
    },
    {
      label: "With abnormal flags",
      value: abnormalCount,
      icon: <TrendingDown size={18} />,
      color: tokens.abnormal,
      tint: tokens.abnormalTint,
      subtitle: "Not a diagnosis",
    },
    {
      label: "Borderline",
      value: borderlineCount,
      icon: <Activity size={18} />,
      color: tokens.borderline,
      tint: tokens.borderlineTint,
      subtitle: "Selected test",
    },
    {
      label: "Critical flags",
      value: criticalCount,
      icon: <AlertCircle size={18} />,
      color: tokens.critical,
      tint: tokens.criticalTint,
      subtitle: "Selected test",
    },
    {
      label: "Not assessed",
      value: notAssessedCount,
      icon: <Minus size={18} />,
      color: tokens.inkSoft,
      tint: tokens.bgSubtle,
      subtitle: "Missing reference range",
    },
    {
      label: "Unclassified",
      value: unclassifiedCount,
      icon: <Activity size={18} />,
      color: tokens.inkFaint,
      tint: tokens.bgSubtle,
      subtitle: "Selected test",
    },
  ];

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
            Health trends
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Explore changes in your medical test results over time.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            refreshing ? (
              <CircularProgress size={15} color="inherit" />
            ) : (
              <RefreshCw size={16} />
            )
          }
          disabled={loading || refreshing}
          onClick={() => loadTrends(true)}
          sx={{
            borderColor: tokens.border,
            color: tokens.navy,
            "&:hover": { borderColor: tokens.teal, color: tokens.teal },
          }}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      {failedReports > 0 && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          Results could not be loaded for {failedReports} report
          {failedReports === 1 ? "" : "s"}. The trends below may be
          incomplete.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <CircularProgress size={26} sx={{ color: tokens.teal }} />
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            Loading your medical test history…
          </Typography>
        </Box>
      ) : records.length === 0 ? (
        <Surface sx={{ textAlign: "center", py: 6 }}>
          <Activity size={42} color={tokens.teal} />
          <Typography fontWeight={600} color={tokens.navy} sx={{ mt: 2 }}>
            No test history available
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Upload a medical report and extract its test results to start
            tracking your health trends.
          </Typography>
        </Surface>
      ) : metrics.length === 0 ? (
        <Alert severity="info">
          Your reports have been loaded, but there are no numeric test results
          available for trend charts yet.
        </Alert>
      ) : (
        <>
          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {stats.map((item, idx) => (
              <Grid item xs={6} sm={4} md={3} key={item.label}>
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
                          width: 26,
                          height: 26,
                          borderRadius: 1,
                          bgcolor: item.tint,
                          color: item.color,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
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
                    <Typography variant="caption" color="text.secondary">
                      {item.subtitle}
                    </Typography>
                  </Surface>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Test selector */}
          <Surface sx={{ mb: 3 }}>
            <SectionHeader
              title="Test history"
              subtitle="Select a test to explore its recorded values."
            />

            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
            >
              <InputLabel id="trend-test-label">Select test</InputLabel>
              <Select
                labelId="trend-test-label"
                value={selectedMetric}
                label="Select test"
                onChange={(event) => setSelectedMetric(event.target.value)}
              >
                {metrics.map((metric) => (
                  <MenuItem key={metric.key} value={metric.key}>
                    {metric.testName}
                    {metric.unit ? ` (${metric.unit})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Surface>

          {/* Latest / previous / change */}
          {activeMetric && latest && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Surface padding={2.5}>
                  <Typography variant="body2" color="text.secondary">
                    Latest value
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={tokens.navy}
                    sx={{ mt: 0.5 }}
                  >
                    {latest.value} {activeMetric.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(latest.date)}
                  </Typography>
                </Surface>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Surface padding={2.5}>
                  <Typography variant="body2" color="text.secondary">
                    Previous value
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={tokens.navy}
                    sx={{ mt: 0.5 }}
                  >
                    {previous
                      ? `${previous.value} ${activeMetric.unit}`
                      : "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {previous
                      ? formatDate(previous.date)
                      : "No earlier record"}
                  </Typography>
                </Surface>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Surface padding={2.5}>
                  <Typography variant="body2" color="text.secondary">
                    Change from previous
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 0.5 }}
                  >
                    {change === null ? (
                      <Minus size={22} color={tokens.inkSoft} />
                    ) : change > 0 ? (
                      <TrendingUp size={22} color={tokens.borderline} />
                    ) : change < 0 ? (
                      <TrendingDown size={22} color={tokens.info} />
                    ) : (
                      <Minus size={22} color={tokens.inkSoft} />
                    )}
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color={tokens.navy}
                    >
                      {change === null
                        ? "—"
                        : `${change > 0 ? "+" : ""}${Number(
                            change.toFixed(3)
                          )}`}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Descriptive difference only
                  </Typography>
                </Surface>
              </Grid>
            </Grid>
          )}

          {/* Chart */}
          <Surface sx={{ mb: 3 }}>
            <SectionHeader
              title={activeMetric ? `${activeMetric.testName} trend` : "Trend"}
              subtitle={`Recorded numeric values across your uploaded reports${
                activeMetric?.unit ? ` (${activeMetric.unit})` : ""
              }.`}
            />

            {chartData.length === 1 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Only one recorded value is available for this test. Upload
                another report containing this test to compare its values
                over time.
              </Alert>
            ) : null}

            <Box sx={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 5, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={tokens.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: tokens.inkSoft }}
                    angle={-20}
                    textAnchor="end"
                    height={65}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: tokens.inkSoft }}
                    domain={["auto", "auto"]}
                    width={65}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.dateLabel || ""
                    }
                    formatter={(value) => [
                      `${value}${
                        activeMetric?.unit ? ` ${activeMetric.unit}` : ""
                      }`,
                      "Recorded value",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={tokens.teal}
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload, index } = props;
                      // Blueprint §15: not-assessed points get an open circle
                      if (payload.notAssessed) {
                        return (
                          <circle
                            key={`dot-${index}`}
                            cx={cx}
                            cy={cy}
                            r={4.5}
                            fill={tokens.surface}
                            stroke={tokens.teal}
                            strokeWidth={2}
                          />
                        );
                      }
                      return (
                        <circle
                          key={`dot-${index}`}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={tokens.teal}
                          stroke={tokens.surface}
                          strokeWidth={1.5}
                        />
                      );
                    }}
                    activeDot={{ r: 7, fill: tokens.teal }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: tokens.teal,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Reference range present
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: `2px solid ${tokens.teal}`,
                    bgcolor: tokens.surface,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Not assessed (missing reference range)
                </Typography>
              </Stack>
            </Stack>
          </Surface>

          {/* History list */}
          <Surface sx={{ mb: 3 }}>
            <SectionHeader
              title="Recorded result history"
              subtitle="Each value shown is the recorded result from a specific report."
            />

            <Stack spacing={1.25}>
              {points
                .slice()
                .reverse()
                .map((point, index) => (
                  <Box
                    key={`${point.reportId}-${point.date}-${index}`}
                    className="stagger-item"
                    style={{ "--i": index }}
                    sx={{
                      p: 1.75,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 1.5,
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
                          color={tokens.ink}
                        >
                          {point.value} {activeMetric.unit}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {point.reportName} · {formatDate(point.date)}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        {point.manuallyReviewed && (
                          <Chip
                            size="small"
                            label="Reviewed"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {point.notAssessed ? (
                          <Chip
                            size="small"
                            label="Not assessed"
                            variant="outlined"
                            sx={{
                              borderColor: tokens.border,
                              color: tokens.inkSoft,
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label={point.flag}
                            color={getFlagColor(point.flag)}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
            </Stack>
          </Surface>

          <Alert
            severity="info"
            icon={false}
            sx={{ bgcolor: tokens.infoTint, color: tokens.ink }}
          >
            <Typography variant="body2">
              These charts display recorded laboratory values and their
              supplied result flags. A change in a value does not by itself
              indicate whether your health is improving or worsening. Values
              marked <strong>not assessed</strong> lack a usable reference range
              in the original report. Consult a qualified healthcare
              professional for interpretation.
            </Typography>
          </Alert>
        </>
      )}
    </Box>
  );
}