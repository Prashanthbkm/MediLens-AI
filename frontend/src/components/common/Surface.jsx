import { Card, CardContent, Box, Typography, Stack } from "@mui/material";
import { tokens } from "/theme";

export default function Surface({
  children,
  padding = 2.5,
  sx,
  contentSx,
  ...rest
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${tokens.border}`,
        ...sx,
      }}
      {...rest}
    >
      <CardContent
        sx={{
          p: padding,
          flexGrow: 1,
          "&:last-child": { pb: padding },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function SectionHeader({ title, subtitle, action, sx }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 2, ...sx }}
    >
      <Box>
        <Typography variant="h6" fontWeight={600} color={tokens.navy}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}