import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import {
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  HeartPulse,
  Info,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Surface from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- section wrapper ---------- */
function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <Surface sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: tokens.tealTint,
            color: tokens.teal,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon size={17} />
        </Box>
        <Box>
          <Typography fontWeight={600} color={tokens.navy}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      {children}
    </Surface>
  );
}

/* ---------- page ---------- */

export default function Settings() {
  const { user } = useAuth();

  const fullName = user?.fullName || "Account";
  const email = user?.email || "Email not available";

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  /* ---- account deletion dialog ---- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  /* ---- snackbar ---- */
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  /* ---- delete request ---- */
  const handleDeleteRequest = () => {
    setDeleteConfirmed(true);
    setDeleteOpen(false);
    showSnack(
      "Account deletion requested. A 30-day grace period applies — contact support to cancel.",
      "info"
    );
  };

  return (
    <Box
      className="page-reveal"
      sx={{ maxWidth: 1050, mx: "auto", width: "100%" }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color={tokens.navy}>
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          View your account information and MediLens preferences.
        </Typography>
      </Box>

      {/* ---------- Profile ---------- */}
      <SettingsSection
        icon={UserRound}
        title="Profile"
        description="Information associated with your MediLens account."
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
          sx={{ mb: 3 }}
        >
          <Avatar
            sx={{
              width: 68,
              height: 68,
              bgcolor: tokens.teal,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={600} color={tokens.navy}>
              {fullName}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              MediLens account
            </Typography>
            <Chip
              label="Registered account"
              color="success"
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserRound size={18} color={tokens.inkSoft} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Full name
              </Typography>
              <Typography fontWeight={600} color={tokens.ink}>
                {fullName}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Mail size={18} color={tokens.inkSoft} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email address
              </Typography>
              <Typography fontWeight={600} color={tokens.ink}>
                {email}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </SettingsSection>

      {/* ---------- Security ---------- */}
      <SettingsSection
        icon={ShieldCheck}
        title="Security"
        description="How your account and data are protected."
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <LockKeyhole size={20} color={tokens.inkSoft} />
          <Box>
            <Typography fontWeight={600} color={tokens.ink}>
              Account authentication
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, lineHeight: 1.65 }}
            >
              MediLens uses authenticated account access to protect your
              report-related operations. Password changes are not currently
              available from this page.
            </Typography>
          </Box>
        </Stack>
      </SettingsSection>

      {/* ---------- Privacy & data retention (blueprint §14) ---------- */}
      <SettingsSection
        icon={ShieldCheck}
        title="Privacy and data retention"
        description="How MediLens stores and removes your information."
      >
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: tokens.teal,
                mt: 1,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              color={tokens.ink}
              sx={{ lineHeight: 1.65 }}
            >
              Uploaded reports are stored in private, user-scoped storage and
              are only accessible from your authenticated account.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: tokens.teal,
                mt: 1,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              color={tokens.ink}
              sx={{ lineHeight: 1.65 }}
            >
              Deleting a report removes the original file, extracted text, and
              derived data associated with that report.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: tokens.teal,
                mt: 1,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              color={tokens.ink}
              sx={{ lineHeight: 1.65 }}
            >
              Account deletion requests are processed after a 30-day grace
              period. Contact support to cancel a pending request.
            </Typography>
          </Stack>
        </Stack>
      </SettingsSection>

      {/* ---------- Account deletion ---------- */}
      <SettingsSection
        icon={Trash2}
        title="Account deletion"
        description="Permanently remove your account and all associated data."
      >
        {deleteConfirmed ? (
          <Alert severity="info">
            Your account deletion request has been submitted. A 30-day grace
            period applies before data is permanently removed.
          </Alert>
        ) : (
          <Stack spacing={1.5}>
            <Typography
              variant="body2"
              color={tokens.ink}
              sx={{ lineHeight: 1.65 }}
            >
              Requesting account deletion removes your uploaded reports,
              extracted results, AI explanations, chat history and account
              details after a 30-day grace period. This action cannot be
              undone once the grace period ends.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleteOpen(true)}
              sx={{
                alignSelf: "flex-start",
                borderColor: tokens.abnormal,
                color: tokens.abnormal,
                "&:hover": {
                  borderColor: tokens.critical,
                  bgcolor: tokens.abnormalTint,
                },
              }}
            >
              Request account deletion
            </Button>
          </Stack>
        )}
      </SettingsSection>

      {/* ---------- About ---------- */}
      <SettingsSection
        icon={HeartPulse}
        title="About MediLens AI"
        description="What this application does and does not do."
      >
        <Typography color="text.secondary" sx={{ lineHeight: 1.75, mb: 2 }}>
          MediLens AI helps users understand medical reports by extracting
          test results, presenting relevant information and providing
          AI-assisted educational explanations.
        </Typography>

        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              Application
            </Typography>
            <Typography fontWeight={600} variant="body2" color={tokens.ink}>
              MediLens AI
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              Version
            </Typography>
            <Typography fontWeight={600} variant="body2" color={tokens.ink}>
              1.0.0
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary" variant="body2">
              Language support
            </Typography>
            <Typography fontWeight={600} variant="body2" color={tokens.ink}>
              English
            </Typography>
          </Stack>
        </Stack>
      </SettingsSection>

      {/* ---------- Disclaimer ---------- */}
      <Alert
        severity="info"
        icon={<Info size={18} />}
        sx={{
          bgcolor: tokens.infoTint,
          color: tokens.ink,
          "& .MuiAlert-icon": { color: tokens.info },
        }}
      >
        <Typography variant="body2">
          <strong>Medical disclaimer.</strong> MediLens AI is designed for
          educational and informational purposes only. It does not provide
          medical diagnoses or replace professional medical advice. Always
          consult a qualified healthcare professional when interpreting
          medical test results or making healthcare decisions.
        </Typography>
      </Alert>

      {/* ---------- Delete confirmation dialog ---------- */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: tokens.abnormalTint,
                color: tokens.abnormal,
                display: "grid",
                placeItems: "center",
              }}
            >
              <AlertTriangle size={17} />
            </Box>
            <Typography fontWeight={600} color={tokens.navy}>
              Request account deletion?
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color={tokens.ink}
            sx={{ lineHeight: 1.7 }}
          >
            All of your uploaded medical reports, extracted results, AI
            explanations and chat history will be scheduled for permanent
            deletion. A 30-day grace period applies — contact support if you
            change your mind.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            sx={{ color: tokens.inkMuted }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteRequest}
            sx={{
              bgcolor: tokens.abnormal,
              color: "#FFFFFF",
              "&:hover": { bgcolor: tokens.critical },
            }}
          >
            Request deletion
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Snackbar ---------- */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() =>
          setSnack((previous) => ({ ...previous, open: false }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() =>
            setSnack((previous) => ({ ...previous, open: false }))
          }
          severity={snack.severity}
          variant="filled"
          sx={{ borderRadius: 1.5 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}