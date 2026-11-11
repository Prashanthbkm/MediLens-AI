import React from "react";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { tokens } from "/theme";

const DashboardFilters = ({
  searchValue = "",
  onSearchChange,
  statusValue = "ALL",
  onStatusChange,
  onReset,
}) => {
  const handleReset = () => {
    onSearchChange?.("");
    onStatusChange?.("ALL");
    onReset?.();
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: tokens.surface,
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        border: `1px solid ${tokens.border}`,
        borderRadius: 2.5,
        bgcolor: tokens.surface,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search reports by name or status…"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, ...fieldSx }}
        />

        <TextField
          select
          size="small"
          value={statusValue}
          onChange={(event) => onStatusChange?.(event.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 200 }, ...fieldSx }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="ALL">All reports</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="PROCESSING">Processing</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
        </TextField>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            whiteSpace: "nowrap",
            minHeight: 40,
            borderColor: tokens.border,
            color: tokens.inkMuted,
            "&:hover": {
              borderColor: tokens.inkFaint,
              bgcolor: "transparent",
            },
          }}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
};

export default DashboardFilters;