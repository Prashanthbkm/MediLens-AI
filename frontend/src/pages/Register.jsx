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
  Divider,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { HeartPulse } from "lucide-react";

import Surface from "../components/common/Surface";
import { useAuth } from "../context/AuthContext";
import { tokens } from "/theme";

// Custom Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
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
              <Typography variant="body2" fontWeight={600} color={tokens.ink} sx={{ mb: 0.75 }}>
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

              <Typography variant="body2" fontWeight={600} color={tokens.ink} sx={{ mb: 0.75 }}>
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

              <Typography variant="body2" fontWeight={600} color={tokens.ink} sx={{ mb: 0.75 }}>
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
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                FormHelperTextProps={{
                  sx: { fontSize: "0.7rem", color: tokens.inkSoft, ml: 0.5 },
                }}
              />

              <Typography variant="body2" fontWeight={600} color={tokens.ink} sx={{ mb: 0.75 }}>
                Confirm password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Google Register Button - Moved to Bottom */}
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleGoogleRegister}
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1.2, 
                borderColor: tokens.border,
                color: tokens.navy,
                bgcolor: "#FFFFFF",
                "&:hover": { borderColor: tokens.teal, bgcolor: tokens.bg }
              }}
            >
              Sign up with Google
            </Button>

            <Typography textAlign="center" sx={{ mt: 3 }} variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Box
                component={RouterLink}
                to="/login"
                sx={{ color: tokens.teal, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                Sign in
              </Box>
            </Typography>
          </Box>
        </Surface>

        <Typography textAlign="center" color="text.secondary" variant="caption" sx={{ display: "block", mt: 3, lineHeight: 1.6 }}>
          By creating an account you agree to use MediLens for educational purposes only. MediLens does not provide medical diagnoses or replace professional medical advice.
        </Typography>
      </Container>
    </Box>
  );
}