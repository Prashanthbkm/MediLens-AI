import {
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
} from "@mui/material";

import {
  FileSearch,
  Quote,
  FileText,
} from "lucide-react";

import Surface from "../common/Surface";
import { tokens } from "/theme";

export default function SourceEvidence({ sources = [] }) {
  const hasSources = Array.isArray(sources) && sources.length > 0;

  // ---- Empty state ----
  if (!hasSources) {
    return (
      <Surface>
        <Stack direction="row" spacing={1} alignItems="center">
          <FileSearch size={19} color={tokens.inkSoft} />
          <Typography fontWeight={600} color={tokens.navy}>
            Source evidence
          </Typography>
        </Stack>

        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ mt: 1.5 }}
        >
          No source evidence is available for this result.
        </Typography>
      </Surface>
    );
  }

  // ---- Populated state ----
  return (
    <Surface>
      <Stack direction="row" alignItems="center" spacing={1}>
        <FileSearch size={19} color={tokens.info} />

        <Typography variant="h6" fontWeight={600} color={tokens.navy}>
          Source evidence
        </Typography>

        <Chip
          label={`${sources.length} source${sources.length === 1 ? "" : "s"}`}
          size="small"
          color="info"
          variant="outlined"
        />
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 2 }}
      >
        Supporting information extracted from your medical report.
      </Typography>

      <Stack spacing={2}>
        {sources.map((source, index) => {
          const evidenceText =
            typeof source === "string"
              ? source
              : source?.text || source?.content || "";

          const page = source?.page;

          return (
            <Box key={source?.id || index}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <FileText size={16} color={tokens.inkSoft} />

                <Typography variant="body2" fontWeight={600} color={tokens.ink}>
                  Source {index + 1}
                </Typography>

                {page !== undefined && page !== null && (
                  <Chip
                    label={`Page ${page}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  backgroundColor: tokens.bg,
                  borderLeft: `3px solid ${tokens.info}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <Quote
                    size={16}
                    color={tokens.info}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: tokens.fontBody,
                      lineHeight: 1.6,
                    }}
                  >
                    {evidenceText || "No evidence text available."}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Surface>
  );
}