import { useState } from "react";

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  Tooltip,
} from "@mui/material";

import { Menu as MenuIcon, LogOut } from "lucide-react";
import { tokens } from "/theme";

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"
  );
}

export default function Topbar({
  user,
  showMenuButton,
  onMenuClick,
  onLogout,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(8px)",
        color: tokens.ink,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <Toolbar sx={{ minHeight: "68px !important", gap: 2 }}>
        {showMenuButton && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            sx={{ color: tokens.navy }}
          >
            <MenuIcon size={22} />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={500}
          >
            MediLens Workspace
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "right",
            display: { xs: "none", sm: "block" },
            mr: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: tokens.navy,
              lineHeight: 1.3,
            }}
          >
            {user?.fullName || "Account"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email || "Personal Account"}
          </Typography>
        </Box>

        <Tooltip title="Account settings">
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            aria-label="Open account menu"
            sx={{ p: 0.5 }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                backgroundColor: tokens.teal,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {getInitials(user?.fullName)}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              border: `1px solid ${tokens.border}`,
              boxShadow: "0 6px 24px rgba(23,50,77,0.08)",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              color={tokens.navy}
            >
              {user?.fullName || "Account"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || ""}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ py: 1, gap: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <LogOut size={17} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={500}>
              Log out
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}