import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

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
  CircularProgress,
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Handle token from Google OAuth Redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      setOauthLoading(true);
      loginWithToken(token)
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => setError("Google authentication failed. Please try again."))
        .finally(() => setOauthLoading(false));
    }
  }, [location, loginWithToken, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
            
            {oauthLoading ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress size={24} sx={{ color: tokens.teal, mb: 2 }} />
                <Typography color="text.secondary">Completing Google Sign In...</Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h5" fontWeight={700} color={tokens.navy}>
                  Welcome back
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                  Sign in to access your medical dashboard.
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    sx={{ mb: 3 }}
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
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                {/* Google Login Button - Moved to Bottom */}
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                  sx={{ 
                    py: 1.2, 
                    borderColor: tokens.border,
                    color: tokens.navy,
                    bgcolor: "#FFFFFF",
                    "&:hover": { borderColor: tokens.teal, bgcolor: tokens.bg }
                  }}
                >
                  Sign in with Google
                </Button>

                <Typography textAlign="center" sx={{ mt: 3 }} variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Box
                    component={RouterLink}
                    to="/register"
                    sx={{ color: tokens.teal, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Create account
                  </Box>
                </Typography>
              </>
            )}
          </Box>
        </Surface>

        <Typography textAlign="center" color="text.secondary" variant="caption" sx={{ display: "block", mt: 3 }}>
          MediLens AI · Educational use only. Not a substitute for professional medical advice.
        </Typography>
      </Container>
    </Box>
  );
}