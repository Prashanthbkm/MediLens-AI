import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { tokens } from "/theme";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Wait until the saved login session is checked
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.bg,
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={26} sx={{ color: tokens.teal }} />
          <Typography color="text.secondary" variant="body2">
            Loading MediLens…
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow authenticated users to access the page
  return <Outlet />;
}