import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { HeartPulse } from "lucide-react";

import Surface from "../components/common/Surface";
import { useAuth } from "../context/AuthContext";
import { tokens } from "/theme";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="page-reveal"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 80% 10%, ${tokens.tealTint} 0%, transparent 45%),
                     linear-gradient(135deg, ${tokens.bg} 0%, ${tokens.bgSubtle} 100%)`,
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Brand */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 54,
              height: 54,
              borderRadius: 2.5,
              backgroundColor: tokens.teal,
              color: "#FFFFFF",
              mb: 1.5,
              boxShadow: "0 6px 20px rgba(22,140,134,0.28)",
            }}
          >
            <HeartPulse size={28} />
          </Box>

          <Typography variant="h5" color={tokens.navy} fontWeight={700}>
            MediLens
            <Box component="span" sx={{ color: tokens.teal }}>
              AI
            </Box>
          </Typography>

          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Your medical reports, made easier to understand.
          </Typography>
        </Box>

        {/* Card */}
        <Surface padding={0} contentSx={{ p: 0 }}>
          <Box sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Typography variant="h5" fontWeight={700} color={tokens.navy}>
              Create your account
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
              Join MediLens to organize and understand your medical reports.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={tokens.ink}
                sx={{ mb: 0.75 }}
              >
                Full name
              </Typography>

              <TextField
                fullWidth
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                required
                sx={{ mb: 2.5 }}
              />

              <Typography
                variant="body2"
                fontWeight={600}
                color={tokens.ink}
                sx={{ mb: 0.75 }}
              >
                Email address
              </Typography>

              <TextField
                fullWidth
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                sx={{ mb: 2.5 }}
              />

              <Typography
                variant="body2"
                fontWeight={600}
                color={tokens.ink}
                sx={{ mb: 0.75 }}
              >
                Password
              </Typography>

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                helperText="Minimum 8 characters"
                sx={{ mb: 2.5 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="Toggle password visibility"
                          size="small"
                          sx={{ color: tokens.inkSoft }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                FormHelperTextProps={{
                  sx: { fontSize: "0.7rem", color: tokens.inkSoft, ml: 0.5 },
                }}
              />

              <Typography
                variant="body2"
                fontWeight={600}
                color={tokens.ink}
                sx={{ mb: 0.75 }}
              >
                Confirm password
              </Typography>

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                disabled={loading}
                sx={{ py: 1.35 }}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </Box>

            <Typography
              textAlign="center"
              sx={{ mt: 3 }}
              variant="body2"
              color="text.secondary"
            >
              Already have an account?{" "}
              <Box
                component={RouterLink}
                to="/login"
                sx={{
                  color: tokens.teal,
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Sign in
              </Box>
            </Typography>
          </Box>
        </Surface>

        {/* Privacy note */}
        <Typography
          textAlign="center"
          color="text.secondary"
          variant="caption"
          sx={{ display: "block", mt: 3, lineHeight: 1.6 }}
        >
          By creating an account you agree to use MediLens for educational
          purposes only. MediLens does not provide medical diagnoses or replace
          professional medical advice.
        </Typography>
      </Container>
    </Box>
  );
}