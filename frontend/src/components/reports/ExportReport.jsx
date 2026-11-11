import { useState } from "react";
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import {
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

export default function ExportReport({
  onExport,
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);

  const open = Boolean(anchorEl);

  const handleExport = async (format) => {
    setAnchorEl(null);

    if (!onExport) return;

    try {
      setExporting(true);
      await onExport(format);
    } catch (error) {
      console.error("Report export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={
          exporting ? (
            <CircularProgress size={17} />
          ) : (
            <Download size={17} />
          )
        }
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={disabled || exporting}
      >
        {exporting ? "Exporting..." : "Export Report"}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport("pdf")}>
          <ListItemIcon>
            <FileText size={18} />
          </ListItemIcon>

          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleExport("excel")}>
          <ListItemIcon>
            <FileSpreadsheet size={18} />
          </ListItemIcon>

          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}