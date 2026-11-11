import { Box, Typography } from "@mui/material";
import { tokens } from "/theme";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function WelcomeSection({ name = "" }) {
  const firstName =
    typeof name === "string" && name.trim()
      ? name.trim().split(/\s+/)[0]
      : "there";

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        color={tokens.navy}
        gutterBottom
        sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}
      >
        {getGreeting()}, {firstName} <span role="img" aria-label="wave">👋</span>
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Here's an overview of your medical reports and activity.
      </Typography>
    </Box>
  );
}