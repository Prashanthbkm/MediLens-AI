import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Skeleton,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import ColumnSelector from "./ColumnSelector";
import Surface from "../common/Surface";
import { tokens } from "/theme";

const ALL_COLUMNS = [
  { key: "name", label: "Report name" },
  { key: "date", label: "Uploaded date" },
  { key: "type", label: "File type" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

const getStatus = (status) => {
  const value = String(status || "").toUpperCase();

  if (value.includes("FAIL") || value.includes("ERROR"))
    return { label: status || "Failed", color: "error" };
  if (
    value.includes("COMPLETE") ||
    value.includes("PROCESSED") ||
    value.includes("SUCCESS") ||
    value.includes("EXTRACT")
  )
    return { label: status, color: "success" };
  if (value.includes("PROCESS"))
    return { label: status, color: "info" };
  if (
    value.includes("PENDING") ||
    value.includes("UPLOAD") ||
    value.includes("REVIEW")
  )
    return { label: status || "Pending", color: "warning" };

  return { label: status || "Unknown", color: "default" };
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ReportTable({
  reports = [],
  loading = false,
  onReportClick,
}) {
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.map((c) => c.key)
  );

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((report) => {
      const filename = String(report.originalFilename || "").toLowerCase();
      const status = String(report.processingStatus || "").toLowerCase();
      return filename.includes(query) || status.includes(query);
    });
  }, [reports, search]);

  const isVisible = (key) => visibleColumns.includes(key);

  return (
    <Surface
      padding={0}
      contentSx={{ p: 0 }}
      sx={{ overflow: "hidden" }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ p: 2.5, pb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color={tokens.navy}>
            Report records
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Manage and view your uploaded medical reports
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search reports…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              minWidth: { xs: 0, sm: 220 },
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <ColumnSelector
            columns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
        </Stack>
      </Stack>

      {/* Body */}
      {loading ? (
        <Box sx={{ p: 2.5, pt: 0 }}>
          <Stack spacing={1.25}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} />
            ))}
          </Stack>
        </Box>
      ) : filteredReports.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 7, color: "text.secondary" }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography fontWeight={600}>
            {search ? "No matching reports" : "No reports available"}
          </Typography>
          <Typography variant="body2">
            {search
              ? "Try searching with another filename or status."
              : "Your uploaded reports will appear here."}
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {isVisible("name") && <TableCell>Report name</TableCell>}
                {isVisible("date") && <TableCell>Uploaded date</TableCell>}
                {isVisible("type") && <TableCell>File type</TableCell>}
                {isVisible("status") && <TableCell>Status</TableCell>}
                {isVisible("action") && (
                  <TableCell align="right">Action</TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredReports.map((report) => {
                const status = getStatus(report.processingStatus);

                return (
                  <TableRow
                    key={report.id}
                    hover
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    {isVisible("name") && (
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <DescriptionOutlinedIcon
                            sx={{ color: tokens.info, fontSize: 18 }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: tokens.navy,
                            }}
                            title={report.originalFilename}
                          >
                            {report.originalFilename || "Medical Report"}
                          </Typography>
                        </Stack>
                      </TableCell>
                    )}

                    {isVisible("date") && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(report.uploadedAt)}
                        </Typography>
                      </TableCell>
                    )}

                    {isVisible("type") && (
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {report.fileType ||
                            report.originalFilename?.split(".").pop()?.toUpperCase() ||
                            "—"}
                        </Typography>
                      </TableCell>
                    )}

                    {isVisible("status") && (
                      <TableCell>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          variant="outlined"
                        />
                      </TableCell>
                    )}

                    {isVisible("action") && (
                      <TableCell align="right">
                        <Tooltip title="View report details">
                          <span>
                            <IconButton
                              size="small"
                              disabled={!report.id || !onReportClick}
                              onClick={() => onReportClick?.(report)}
                              sx={{
                                color: tokens.navy,
                                "&:hover": { bgcolor: tokens.bg },
                              }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && filteredReports.length > 0 && (
        <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${tokens.border}` }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredReports.length} of {reports.length} reports
          </Typography>
        </Box>
      )}
    </Surface>
  );
}