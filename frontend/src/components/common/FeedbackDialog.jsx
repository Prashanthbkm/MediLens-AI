import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Rating,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";

import { MessageSquare, Send, X } from "lucide-react";

import useFeedback from "../../hooks/useFeedback";
import { tokens } from "/theme";

export default function FeedbackDialog({ open, onClose }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("GENERAL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { loading, submitFeedback } = useFeedback();

  const resetForm = () => {
    setRating(0);
    setCategory("GENERAL");
    setMessage("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose?.();
  };

  const handleSubmit = async () => {
    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    try {
      await submitFeedback({
        rating,
        category,
        message: message.trim(),
      });

      resetForm();
      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to submit feedback. Please try again."
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2.5 },
      }}
    >
      {/* ---------- Title ---------- */}
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                color: tokens.teal,
                backgroundColor: tokens.tealTint,
              }}
            >
              <MessageSquare size={19} />
            </Box>

            <Box>
              <Typography fontWeight={600} color={tokens.navy}>
                Share your feedback
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Help us improve MediLens AI.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            aria-label="Close feedback dialog"
            sx={{ color: tokens.inkSoft }}
          >
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ---------- Body ---------- */}
      <DialogContent dividers sx={{ borderColor: tokens.border }}>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Rating */}
          <Box>
            <Typography
              fontWeight={600}
              variant="body2"
              color={tokens.ink}
              sx={{ mb: 1 }}
            >
              How would you rate your experience?
            </Typography>

            <Rating
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue || 0);
                setError("");
              }}
              size="large"
              precision={1}
              sx={{
                color: tokens.borderline,
                "& .MuiRating-iconEmpty": { color: tokens.inkFaint },
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {rating === 0
                ? "Select a rating from 1 to 5 stars."
                : `${rating} out of 5 stars`}
            </Typography>
          </Box>

          {/* Category */}
          <FormControl fullWidth size="small">
            <InputLabel id="feedback-category-label">Category</InputLabel>
            <Select
              labelId="feedback-category-label"
              value={category}
              label="Category"
              onChange={(event) => setCategory(event.target.value)}
            >
              <MenuItem value="GENERAL">General feedback</MenuItem>
              <MenuItem value="BUG">Report a bug</MenuItem>
              <MenuItem value="FEATURE">Feature request</MenuItem>
              <MenuItem value="UI_UX">User interface experience</MenuItem>
              <MenuItem value="PERFORMANCE">Performance issue</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          {/* Message */}
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={7}
            label="Your feedback"
            placeholder="Tell us about your experience or suggestions…"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setError("");
            }}
            helperText={`${message.length}/1000 characters`}
            inputProps={{ maxLength: 1000 }}
            FormHelperTextProps={{
              sx: { fontSize: "0.7rem", color: tokens.inkSoft, ml: 0.5 },
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Please avoid including personal medical information or sensitive
            details in your feedback.
          </Typography>
        </Stack>
      </DialogContent>

      {/* ---------- Actions ---------- */}
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: tokens.inkMuted }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={15} color="inherit" />
            ) : (
              <Send size={16} />
            )
          }
        >
          {loading ? "Submitting…" : "Submit feedback"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}