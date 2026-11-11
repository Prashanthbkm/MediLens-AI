import { createTheme } from "@mui/material/styles";

/* ================================================================
   MediLens AI — Clinical Design Tokens
   Enterprise healthcare palette. Navy + Teal + clinical neutrals.
   No purple, no neon, no cyberpunk. Calm and trustworthy.
   ================================================================ */

export const tokens = {
  // Brand
  navy: "#17324D",
  navyDeep: "#0F2338",
  teal: "#168C86",
  tealDark: "#0F6F6A",
  tealTint: "#E6F2F1",

  // Surfaces
  surface: "#FFFFFF",
  bg: "#F4F7F8",
  bgSubtle: "#EAF2F7",
  sage: "#E5F0EA",

  // Text
  ink: "#243447",
  inkMuted: "#425466",
  inkSoft: "#718096",
  inkFaint: "#A0AEC0",

  // Borders
  border: "#DCE4E8",
  borderStrong: "#C7D2D9",

  // Medical status
  normal: "#38845B",
  borderline: "#C58A32",
  abnormal: "#C65B54",
  critical: "#A93232",
  info: "#3979A8",

  // Tinted surfaces for status
  normalTint: "#E7F2EC",
  borderlineTint: "#F7EFE2",
  abnormalTint: "#F6E7E6",
  criticalTint: "#F3DEDE",
  infoTint: "#E6EFF5",

  // Fonts
  fontBody: '"Inter", "Roboto", "Source Sans 3", system-ui, -apple-system, sans-serif',
  fontDisplay: '"Fraunces", "Inter", serif', // landing hero only
  fontMono: '"JetBrains Mono", "SF Mono", Menlo, monospace',

  // Motion (ms) — calm, restrained per enterprise healthcare UX
  motionFast: 140,
  motionBase: 180,
  motionSlow: 240,

  // Layout
  sidebarWidth: 260,
  contentMax: 1400,
};

/* ---------- Global CSS baseline (injected once) ---------- */
const GLOBAL_CSS = `
  :root {
    color-scheme: light;
  }
  html, body, #root {
    height: 100%;
  }
  body {
    background-color: ${tokens.bg};
    color: ${tokens.ink};
    font-family: ${tokens.fontBody};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "cv02","cv03","cv04","cv11";
  }
  /* Consistent focus ring for a11y */
  :focus-visible {
    outline: 2px solid ${tokens.teal};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.navy, contrastText: "#FFFFFF" },
    secondary: { main: tokens.teal, contrastText: "#FFFFFF" },
    background: { default: tokens.bg, paper: tokens.surface },
    text: {
      primary: tokens.ink,
      secondary: tokens.inkMuted,
      disabled: tokens.inkFaint,
    },
    divider: tokens.border,
    success: { main: tokens.normal, contrastText: "#FFFFFF" },
    warning: { main: tokens.borderline, contrastText: "#FFFFFF" },
    error: { main: tokens.abnormal, contrastText: "#FFFFFF" },
    info: { main: tokens.info, contrastText: "#FFFFFF" },
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily: tokens.fontBody,
    h1: { fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 },
    h2: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 },
    h4: { fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25 },
    h5: { fontWeight: 600, letterSpacing: "-0.005em" },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body1: { fontSize: "0.9375rem", lineHeight: 1.65 },
    body2: { fontSize: "0.875rem", lineHeight: 1.55 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: GLOBAL_CSS,
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          transition: `background-color ${tokens.motionFast}ms ease, border-color ${tokens.motionFast}ms ease, color ${tokens.motionFast}ms ease, box-shadow ${tokens.motionFast}ms ease`,
        },
        containedSecondary: {
          "&:hover": { backgroundColor: tokens.tealDark },
        },
        sizeSmall: { minHeight: 34 },
        sizeMedium: { minHeight: 40 },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: `background-color ${tokens.motionFast}ms ease, color ${tokens.motionFast}ms ease`,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          boxShadow: "0 1px 2px rgba(23,50,77,0.04)",
          borderRadius: 12,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: tokens.border },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
        },
        sizeSmall: { height: 24 },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: tokens.bg,
            fontWeight: 600,
            color: tokens.inkSoft,
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderBottom: `1px solid ${tokens.border}`,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.border}`,
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: `background-color ${tokens.motionFast}ms ease`,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.border },
      },
    },

    MuiTextField: {
      defaultProps: { size: "small" },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: tokens.surface,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.borderStrong,
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.navy,
          fontSize: "0.75rem",
          padding: "6px 10px",
          borderRadius: 6,
        },
        arrow: { color: tokens.navy },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${tokens.border}`,
          boxShadow: "0 8px 24px rgba(23,50,77,0.10)",
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: tokens.bgSubtle },
      },
    },
  },
});

export default theme;