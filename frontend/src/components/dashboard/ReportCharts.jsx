import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Skeleton,
  useTheme,
} from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import Surface from "../common/Surface";
import { tokens } from "/theme";

const RESULT_COLORS = {
  Normal: tokens.normal,
  Abnormal: tokens.abnormal,
  Unclassified: tokens.inkFaint,
};

const STATUS_COLORS = {
  Completed: tokens.normal,
  Processing: tokens.info,
  Pending: tokens.borderline,
  Failed: tokens.abnormal,
};

const TooltipBox = ({ title, subtitle }) => (
  <Box
    sx={{
      bgcolor: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 1.5,
      p: 1.25,
      boxShadow: "0 4px 16px rgba(23,50,77,0.08)",
    }}
  >
    <Typography variant="body2" fontWeight={600} color={tokens.navy}>
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {subtitle}
    </Typography>
  </Box>
);

const ResultTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <TooltipBox
      title={item.name}
      subtitle={`${item.value} result${item.value === 1 ? "" : "s"}`}
    />
  );
};

const ActivityTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox
      title={label}
      subtitle={`${payload[0].value} report${payload[0].value === 1 ? "" : "s"}`}
    />
  );
};

function ChartEmptyState({ message }) {
  return (
    <Box
      sx={{
        height: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box>
        <Typography fontWeight={600} color="text.secondary">
          No chart data available
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ReportCharts({
  stats = {},
  reports = [],
  loading = false,
}) {
  const theme = useTheme();

  const resultData = useMemo(
    () => [
      { name: "Normal", value: Number(stats.normalResults) || 0 },
      { name: "Abnormal", value: Number(stats.abnormalResults) || 0 },
      {
        name: "Unclassified",
        value: Number(stats.unclassifiedResults) || 0,
      },
    ],
    [
      stats.normalResults,
      stats.abnormalResults,
      stats.unclassifiedResults,
    ]
  );

  const totalResults = resultData.reduce((s, i) => s + i.value, 0);

  const activityData = useMemo(() => {
    const counts = { Completed: 0, Processing: 0, Pending: 0, Failed: 0 };

    reports.forEach((report) => {
      const status = String(report.processingStatus || "").toUpperCase();
      if (["COMPLETED", "PROCESSED"].includes(status)) counts.Completed++;
      else if (status === "PROCESSING") counts.Processing++;
      else if (status === "FAILED") counts.Failed++;
      else counts.Pending++;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const totalReports = activityData.reduce((s, i) => s + i.value, 0);

  if (loading) {
    return (
      <Stack spacing={2.5} direction={{ xs: "column", lg: "row" }}>
        {[1, 2].map((i) => (
          <Box key={i} flex={1}>
            <Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(2, minmax(0, 1fr))",
        },
        gap: 2.5,
        width: "100%",
      }}
    >
      {/* Result Distribution */}
      <Surface>
        <Typography variant="h6" fontWeight={600} color={tokens.navy}>
          Result distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Classification of extracted test results
        </Typography>

        {totalResults === 0 ? (
          <ChartEmptyState message="Extract results from a report to see the distribution." />
        ) : (
          <>
            <Box sx={{ height: 250, mt: 1, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultData.filter((i) => i.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={500}
                  >
                    {resultData
                      .filter((i) => i.value > 0)
                      .map((item) => (
                        <Cell key={item.name} fill={RESULT_COLORS[item.name]} />
                      ))}
                  </Pie>
                  <Tooltip content={<ResultTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <Box
                sx={{
                  position: "absolute",
                  top: "44%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography variant="h5" fontWeight={700} color={tokens.navy}>
                  {totalResults}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total results
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" justifyContent="space-around" spacing={1} sx={{ mt: 1 }}>
              {resultData.map((item) => (
                <Box key={item.name} textAlign="center">
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: RESULT_COLORS[item.name] }}
                  >
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Surface>

      {/* Report Activity */}
      <Surface>
        <Typography variant="h6" fontWeight={600} color={tokens.navy}>
          Report activity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Processing status of recent reports
        </Typography>

        {totalReports === 0 ? (
          <ChartEmptyState message="Upload reports to see processing activity." />
        ) : (
          <>
            <Box sx={{ height: 280, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.palette.divider}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: tokens.inkMuted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: tokens.inkMuted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ActivityTooltip />}
                    cursor={{ fill: tokens.bg }}
                  />
                  <Bar
                    dataKey="value"
                    name="Reports"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={55}
                    animationDuration={500}
                  >
                    {activityData.map((item) => (
                      <Cell key={item.name} fill={STATUS_COLORS[item.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center" }}
            >
              {totalReports} recent report{totalReports === 1 ? "" : "s"} represented
            </Typography>
          </>
        )}
      </Surface>
    </Box>
  );
}