import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import { tokens } from "/theme";

export default function DashboardLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: tokens.bg,
      }}
    >
      <Sidebar
        isDesktop={isDesktop}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar
          user={user}
          showMenuButton={!isDesktop}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet context={{ user }} />
        </Box>
      </Box>
    </Box>
  );
}