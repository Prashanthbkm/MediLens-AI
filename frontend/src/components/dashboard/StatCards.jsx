import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Surface from "../common/Surface";
import { tokens } from "/theme";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = tokens.info,
  subtitle,
}) {
  const safeColor = color || tokens.info;

  return (
    <Surface
      padding={2.5}
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
        border: `1px solid ${tokens.border}`,
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(safeColor, 0.4),
          boxShadow: "0 8px 24px rgba(23,50,77,0.08)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>

        <Box
          sx={{
            width: 42,
            height: 42,
            minWidth: 42,
            borderRadius: 2,
            backgroundColor: alpha(safeColor, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icon && <Icon sx={{ color: safeColor, fontSize: 22 }} />}
        </Box>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: tokens.navy,
          lineHeight: 1.2,
          mb: 0.75,
          overflowWrap: "anywhere",
        }}
      >
        {value ?? 0}
      </Typography>

      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "35%",
          height: 3,
          backgroundColor: safeColor,
          borderRadius: "0 4px 0 0",
        }}
      />
    </Surface>
  );
}