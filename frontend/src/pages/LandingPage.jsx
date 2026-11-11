
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";

import {
  Activity,
  ArrowRight,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  MessageCircle,
  UploadCloud,
  HeartPulse,
  CheckCircle2,
  LockKeyhole,
  ChevronRight,
} from "lucide-react";

import { Link as RouterLink } from "react-router-dom";
import Surface from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- content ---------- */

const features = [
  {
    icon: FileText,
    title: "Smart report extraction",
    description: "Upload laboratory reports and organize extracted test names, values, units and reference intervals automatically.",
  },
  {
    icon: Sparkles,
    title: "AI-powered explanations",
    description: "Explore simple educational explanations of medical terminology and laboratory results in plain language.",
  },
  {
    icon: TrendingUp,
    title: "Health trends",
    description: "Compare compatible test results across previous reports and explore changes over time.",
  },
  {
    icon: MessageCircle,
    title: "Report-based AI chat",
    description: "Ask questions about your uploaded report and understand its information conversationally.",
  },
  {
    icon: ShieldCheck,
    title: "User-controlled review",
    description: "Review extracted information and correct uncertain fields while preserving original values.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy-focused design",
    description: "Protected access and user control are important parts of the MediLens experience.",
  },
];

const steps = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload your report",
    description: "Upload a supported PDF laboratory report securely to your account.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Extract and review",
    description: "Review extracted test information and correct any uncertain values.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Understand results",
    description: "Explore educational explanations and supporting source citations.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track your history",
    description: "Organize reports and compare compatible results over time.",
  },
];

/* ---------- small reusable bits ---------- */

function EyebrowChip({ children }) {
  return (
    <Chip
      label={children}
      sx={{
        mb: 2.5,
        bgcolor: tokens.tealTint,
        color: tokens.tealDark,
        fontWeight: 600,
        fontSize: "0.75rem",
        py: 0.5,
        px: 0.5,
      }}
    />
  );
}

function BrandMark() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          bgcolor: tokens.teal,
          color: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 4px 14px rgba(22,140,134,0.28)",
        }}
      >
        <HeartPulse size={24} />
      </Box>
      <Box>
        <Typography fontWeight={700} fontSize={21} color={tokens.navy} lineHeight={1.1}>
          MediLens
          <Box component="span" sx={{ color: tokens.teal }}>
            AI
          </Box>
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Medical report intelligence
        </Typography>
      </Box>
    </Stack>
  );
}

/* ---------- page ---------- */

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.surface,
        color: tokens.ink,
        fontFamily: tokens.fontBody,
        overflowX: "hidden",
      }}
    >
      {/* ---------- Navbar ---------- */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "saturate(180%) blur(12px)",
          color: tokens.navy,
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 76, justifyContent: "space-between" }}>
            <BrandMark />

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  fontWeight: 600,
                  color: tokens.inkMuted,
                  "&:hover": { bgcolor: tokens.bgSubtle, color: tokens.navy },
                }}
              >
                Login
              </Button>

              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="secondary"
                endIcon={<ArrowRight size={16} />}
                sx={{ px: 3, py: 1 }}
              >
                Get started
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ---------- Hero ---------- */}
      <Box
        sx={{
          position: "relative",
          background: `radial-gradient(circle at 15% 50%, ${tokens.tealTint} 0%, transparent 50%),
                       radial-gradient(circle at 85% 30%, ${tokens.bgSubtle} 0%, transparent 50%),
                       ${tokens.surface}`,
          pt: { xs: 10, md: 16 },
          pb: { xs: 10, md: 16 },
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            
            {/* Left: copy */}
            <Grid item xs={12} md={7}>
              <EyebrowChip>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Sparkles size={14} /> Understand your medical reports better
                </Box>
              </EyebrowChip>

              <Typography
                component="h1"
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: { xs: 42, sm: 54, md: 64 },
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: tokens.navy,
                }}
              >
                Your medical reports,
                <Box
                  component="span"
                  sx={{ color: tokens.teal, display: "block", mt: 1 }}
                >
                  made easier to understand.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 540,
                  color: tokens.inkMuted,
                  fontSize: { xs: 16, md: 18 },
                  lineHeight: 1.75,
                }}
              >
                MediLens AI helps you organize laboratory reports, review
                extracted test results and explore educational explanations
                with AI-assisted insights.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 5 }}
              >
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                >
                  Get started free
                </Button>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    borderColor: tokens.border,
                    color: tokens.navy,
                    "&:hover": { borderColor: tokens.teal, color: tokens.teal, bgcolor: tokens.tealTint },
                  }}
                >
                  Sign in
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                sx={{ mt: 5, flexWrap: "wrap", rowGap: 1.5 }}
              >
                {["Report organization", "AI-assisted explanations", "Source citations"].map(
                  (item) => (
                    <Stack key={item} direction="row" spacing={1} alignItems="center">
                      <CheckCircle2 size={18} color={tokens.teal} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {item}
                      </Typography>
                    </Stack>
                  )
                )}
              </Stack>
            </Grid>

            {/* Right: preview card */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: "relative" }}>
                {/* Decorative background blob */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    width: "100%",
                    height: "100%",
                    bgcolor: tokens.tealTint,
                    borderRadius: 6,
                    transform: "rotate(-3deg)",
                    zIndex: 0,
                  }}
                />
                
                <Surface
                  padding={3.5}
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: 440,
                    mx: "auto",
                    borderRadius: 4,
                    boxShadow: "0 24px 80px rgba(23,50,77,0.12)",
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1.25, bgcolor: tokens.tealTint, color: tokens.teal, borderRadius: 2 }}>
                      <Activity size={22} />
                    </Box>
                    <Box>
                      <Typography fontWeight={700} color={tokens.navy} fontSize={16}>
                        Report overview
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sample interface preview
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography fontWeight={600} variant="body2" color={tokens.ink} sx={{ mb: 2 }}>
                    Extracted test parameters
                  </Typography>

                  {["Hemoglobin", "Glucose", "Vitamin D"].map((name) => (
                    <Box
                      key={name}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        border: `1px solid ${tokens.border}`,
                        borderRadius: 2,
                        bgcolor: tokens.bg,
                        transition: "border-color 0.2s",
                        "&:hover": { borderColor: tokens.tealTint },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={600} variant="body2" color={tokens.navy}>
                          {name}
                        </Typography>
                        <Chip
                          size="small"
                          label="Example"
                          variant="outlined"
                          sx={{ borderColor: tokens.border, color: tokens.inkSoft, height: 20, fontSize: "0.65rem" }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Illustrative data only
                      </Typography>
                    </Box>
                  ))}

                  <Box sx={{ p: 2.5, bgcolor: tokens.tealTint, borderRadius: 2, mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Sparkles size={18} color={tokens.teal} />
                      <Typography fontWeight={600} variant="body2" sx={{ color: tokens.tealDark }}>
                        AI-assisted understanding
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                      Explore report information through educational explanations and supporting sources.
                    </Typography>
                  </Box>
                </Surface>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ---------- Features ---------- */}
      <Box id="features" sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <EyebrowChip>What MediLens offers</EyebrowChip>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: tokens.navy,
                fontSize: { xs: 32, md: 42 },
                letterSpacing: "-0.02em",
              }}
            >
              Everything in one place
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 2, maxWidth: 600, mx: "auto", lineHeight: 1.75, fontSize: 17 }}
            >
              A unified experience for reviewing, understanding and organizing
              laboratory reports.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={feature.title}>
                  <Surface
                    padding={4}
                    className="hover-lift"
                    sx={{
                      height: "100%",
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(23,50,77,0.03)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        bgcolor: tokens.tealTint,
                        color: tokens.teal,
                        display: "grid",
                        placeItems: "center",
                        mb: 3,
                      }}
                    >
                      <Icon size={24} />
                    </Box>

                    <Typography variant="h6" fontWeight={700} color={tokens.navy} fontSize={18}>
                      {feature.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ mt: 1.5, lineHeight: 1.7, fontSize: 14.5 }}
                    >
                      {feature.description}
                    </Typography>
                  </Surface>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ---------- How it works ---------- */}
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: tokens.bg, borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <EyebrowChip>Simple workflow</EyebrowChip>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: tokens.navy,
                fontSize: { xs: 32, md: 42 },
                letterSpacing: "-0.02em",
              }}
            >
              How MediLens works
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17 }}>
              From document upload to understandable information.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="flex-start">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;
              return (
                <Grid item xs={12} sm={6} md={3} key={step.number} sx={{ position: "relative" }}>
                  <Surface
                    padding={3}
                    sx={{
                      height: "100%",
                      bgcolor: tokens.surface,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: 3,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        mx: "auto",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: tokens.tealTint,
                        color: tokens.teal,
                        borderRadius: 3,
                        mb: 2.5,
                      }}
                    >
                      <Icon size={24} />
                    </Box>

                    <Typography
                      fontWeight={700}
                      fontSize={13}
                      sx={{ color: tokens.teal, letterSpacing: 1, mb: 1 }}
                    >
                      STEP {step.number}
                    </Typography>

                    <Typography fontWeight={700} color={tokens.navy} fontSize={17}>
                      {step.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ mt: 1.25, lineHeight: 1.7 }}
                    >
                      {step.description}
                    </Typography>
                  </Surface>

                  {/* Connecting arrow for desktop */}
                  {!isLast && (
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        position: "absolute",
                        top: "40%",
                        right: -24,
                        zIndex: 1,
                        color: tokens.inkFaint,
                      }}
                    >
                      <ChevronRight size={24} />
                    </Box>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ---------- Privacy / Safety ---------- */}
      <Box sx={{ py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <EyebrowChip>Privacy and safety</EyebrowChip>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: tokens.navy,
                  fontSize: { xs: 32, md: 40 },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                Your information deserves careful handling.
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 2.5, lineHeight: 1.8, fontSize: 16 }}
              >
                Medical reports contain sensitive personal information.
                MediLens is designed around protected access, user review
                and clear communication about its educational features.
              </Typography>

              <Stack spacing={2.5} sx={{ mt: 4 }}>
                {[
                  "Protected access to personal report information",
                  "Original extracted values remain distinguishable from corrections",
                  "Visible limitations and uncertainty",
                  "Educational explanations rather than diagnoses",
                ].map((item) => (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: tokens.tealTint,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={16} color={tokens.teal} />
                    </Box>
                    <Typography color={tokens.ink} variant="body2" fontWeight={500} fontSize={15}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 4, md: 5 },
                  bgcolor: tokens.tealTint,
                  border: `1px solid ${tokens.tealTint}`,
                  borderRadius: 4,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative blurred circle */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    bgcolor: "rgba(22,140,134,0.1)",
                    borderRadius: "50%",
                    filter: "blur(20px)",
                  }}
                />

                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: tokens.surface,
                    color: tokens.teal,
                    borderRadius: 3,
                    mb: 3,
                    boxShadow: "0 4px 14px rgba(22,140,134,0.15)",
                  }}
                >
                  <ShieldCheck size={30} />
                </Box>

                <Typography variant="h5" fontWeight={700} color={tokens.navy} fontSize={22}>
                  Understand, don't self-diagnose.
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 2, lineHeight: 1.75, fontSize: 15 }}
                >
                  MediLens AI provides educational information about laboratory
                  reports. It does not diagnose medical conditions, prescribe
                  treatments or replace advice from a qualified healthcare
                  professional.
                </Typography>

                <Divider sx={{ my: 3, borderColor: "rgba(22,140,134,0.18)" }} />

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LockKeyhole size={18} color={tokens.tealDark} />
                  <Typography
                    fontWeight={600}
                    variant="body2"
                    sx={{ color: tokens.tealDark }}
                  >
                    Privacy-conscious product design
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ---------- CTA ---------- */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: `linear-gradient(135deg, ${tokens.navy} 0%, ${tokens.navyDeep} 100%)`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#FFFFFF",
                fontSize: { xs: 32, md: 42 },
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Make your medical reports easier to understand.
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.75)",
                mt: 2.5,
                lineHeight: 1.75,
                fontSize: 17,
              }}
            >
              Organize your reports and explore their information with MediLens AI.
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowRight size={18} />}
              sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1rem" }}
            >
              Create your account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ---------- Footer ---------- */}
      <Box sx={{ bgcolor: tokens.navyDeep, py: 5, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <HeartPulse size={20} color={tokens.teal} />
              <Typography fontWeight={600} color="#FFFFFF" fontSize={16}>
                MediLens AI
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { color: "#FFFFFF" },
                }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { color: "#FFFFFF" },
                }}
              >
                Register
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3.5, borderColor: "rgba(255,255,255,0.1)" }} />

          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontSize: 12 }}
          >
            © {new Date().getFullYear()} MediLens AI. For educational purposes
            only. This application does not provide medical diagnoses or replace
            professional medical advice.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
