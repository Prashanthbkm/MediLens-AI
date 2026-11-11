import { NavLink } from "react-router-dom";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  TrendingUp,
  Settings,
  HeartPulse,
  Bot,
  Clock, // Added Clock
} from "lucide-react";

import { tokens } from "/theme";

export const DRAWER_WIDTH = 260;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Report", path: "/upload", icon: UploadCloud },
  { label: "Processing", path: "/processing", icon: Clock }, // Added Processing
  { label: "My Reports", path: "/reports", icon: FileText },
  { label: "Ask AI", path: "/chat", icon: Bot },
  { label: "Trends", path: "/trends", icon: TrendingUp },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isDesktop, open, onClose }) {
  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop || open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isDesktop ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          border: "none",
          backgroundColor: tokens.navy,
          color: "#FFFFFF",
          backgroundImage: `radial-gradient(circle at 20% 0%, rgba(22,140,134,0.10), transparent 55%)`,
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 3,
            py: 2.75,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: tokens.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(22,140,134,0.35)",
            }}
          >
            <HeartPulse size={24} color="#FFFFFF" />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ color: "#FFFFFF", fontWeight: 700, lineHeight: 1.2 }}
            >
              MediLens
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              Healthcare Intelligence
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

        {/* Section label */}
        <Box sx={{ px: 2, pt: 3 }}>
          <Typography
            variant="overline"
            sx={{
              color: "rgba(255,255,255,0.45)",
              px: 1.5,
              letterSpacing: 1.5,
              fontSize: 11,
            }}
          >
            Workspace
          </Typography>
        </Box>

        {/* Navigation */}
        <List sx={{ px: 1.5, pt: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === "/dashboard" || item.path === "/reports" || item.path === "/chat" || item.path === "/processing"}
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 46,
                  px: 1.5,
                  color: "rgba(255,255,255,0.72)",
                  transition:
                    "background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",

                  "&.active": {
                    backgroundColor: "rgba(22,140,134,0.16)",
                    color: "#FFFFFF",
                    boxShadow: `inset 3px 0 0 ${tokens.teal}`,
                    "& .MuiListItemIcon-root": { color: tokens.teal },
                  },

                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.07)",
                    color: "#FFFFFF",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 38,
                    transition: "color 0.15s ease",
                  }}
                >
                  <Icon size={19} />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* Info card */}
        <Box
          sx={{
            mx: 2,
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <HeartPulse size={20} color={tokens.teal} />

          <Typography
            sx={{ mt: 1, color: "#FFFFFF", fontWeight: 600 }}
            variant="body2"
          >
            Your health, simplified
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.5,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.55,
            }}
          >
            Understand your medical reports with MediLens AI.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

        {/* Disclaimer */}
        <Box sx={{ p: 2.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.6,
              fontSize: 11,
            }}
          >
            Educational use only. Not a substitute for professional medical
            advice.
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}