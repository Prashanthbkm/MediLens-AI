import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { tokens } from "/theme";

const ColumnSelector = ({
  columns = [],
  visibleColumns = [],
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleToggle = (columnKey) => {
    const updatedColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter((key) => key !== columnKey)
      : [...visibleColumns, columnKey];

    onChange?.(updatedColumns);
  };

  const handleSelectAll = () => onChange?.(columns.map((c) => c.key));
  const handleClearAll = () => onChange?.([]);

  return (
    <>
      <Tooltip title="Choose visible columns">
        <Button
          variant="outlined"
          size="small"
          startIcon={<ViewColumnIcon />}
          onClick={handleOpen}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            minHeight: 40,
            whiteSpace: "nowrap",
          }}
        >
          Columns
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 260,
            maxHeight: 420,
            borderRadius: 2,
            mt: 1,
            border: `1px solid ${tokens.border}`,
          },
        }}
      >
        <Box px={2} py={1.25}>
          <Typography fontWeight={600} variant="subtitle2" color={tokens.navy}>
            Manage columns
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Choose which columns appear in the table
          </Typography>
        </Box>

        <Divider />

        <Box
          px={2}
          py={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button size="small" onClick={handleSelectAll}>
            Select all
          </Button>
          <Button size="small" color="inherit" onClick={handleClearAll}>
            Clear all
          </Button>
        </Box>

        <Divider />

        {columns.map((column) => (
          <MenuItem
            key={column.key}
            dense
            onClick={() => handleToggle(column.key)}
          >
            <FormControlLabel
              sx={{ width: "100%", m: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={visibleColumns.includes(column.key)}
                  onChange={() => handleToggle(column.key)}
                />
              }
              label={
                <Typography variant="body2">{column.label}</Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ColumnSelector;