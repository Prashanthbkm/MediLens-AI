import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  MenuItem,
} from "@mui/material";

import {
  ArrowLeft,
  Bot,
  FileText,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { indexReport, askReportQuestion } from "../services/aiService";
import { getReports } from "../services/reportService";
import Surface from "../components/common/Surface";
import { tokens } from "/theme";

/* ---------- helpers ---------- */

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.response?.data?.detail ||
  error.message ||
  "Something went wrong. Please try again.";

const unwrap = (response) => response?.data ?? response;

const suggestions = [
  "Summarize my medical report.",
  "Which results are outside their reference ranges?",
  "Explain my Hemoglobin result.",
  "What questions should I ask my doctor?",
];

/* ---------- Markdown renderer ---------- */

function MarkdownAnswer({ content }) {
  return (
    <Box
      sx={{
        minWidth: 0,
        overflowWrap: "anywhere",
        "& p": {
          m: 0,
          mb: 1.25,
          lineHeight: 1.75,
          fontSize: "0.875rem",
          color: tokens.ink,
        },
        "& p:last-child": { mb: 0 },
        "& h1, & h2, & h3, & h4": {
          color: tokens.navy,
          fontWeight: 700,
          lineHeight: 1.35,
          mt: 2,
          mb: 1,
        },
        "& h1": { fontSize: "1.2rem" },
        "& h2": { fontSize: "1.05rem" },
        "& h3, & h4": { fontSize: "0.95rem" },
        "& ul, & ol": { pl: 3, mt: 0.5, mb: 1.5 },
        "& li": { mb: 0.5, fontSize: "0.875rem", lineHeight: 1.7 },
        "& blockquote": {
          m: 0,
          mb: 1.5,
          pl: 2,
          borderLeft: `3px solid ${tokens.teal}`,
          color: tokens.inkMuted,
        },
        "& a": { color: tokens.tealDark, textDecoration: "underline" },
        "& hr": {
          border: 0,
          borderTop: `1px solid ${tokens.border}`,
          my: 2,
        },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.82rem",
          bgcolor: tokens.surface,
        },
        "& th, & td": {
          border: `1px solid ${tokens.border}`,
          p: 1,
          textAlign: "left",
          verticalAlign: "top",
        },
        "& th": {
          bgcolor: tokens.bgSubtle,
          fontWeight: 600,
          color: tokens.navy,
        },
        "& pre": {
          overflowX: "auto",
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: tokens.navyDeep,
          color: "#F8FAFC",
          fontSize: "0.8rem",
        },
        "& :not(pre) > code": {
          px: 0.6,
          py: 0.2,
          borderRadius: 0.75,
          bgcolor: tokens.bgSubtle,
          color: tokens.navyDeep,
          fontSize: "0.82em",
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <Box sx={{ width: "100%", overflowX: "auto", mb: 1.5 }}>
              <table>{children}</table>
            </Box>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </Box>
  );
}

/* ---------- main page ---------- */

export default function ReportChat() {
  const { id } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const indexingRequestRef = useRef({ reportId: null, promise: null });

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [indexing, setIndexing] = useState(true);
  const [sending, setSending] = useState(false);
  const [indexError, setIndexError] = useState("");
  const [chatError, setChatError] = useState("");
  const [indexed, setIndexed] = useState(false);

  // IF NO ID: Fetch reports so user can select one
  useEffect(() => {
    if (!id) {
      const fetchList = async () => {
        try {
          setLoadingReports(true);
          const res = await getReports();
          setReports(Array.isArray(res) ? res : []);
        } catch (err) {
          console.error("Failed to fetch reports for chat", err);
        } finally {
          setLoadingReports(false);
        }
      };
      fetchList();
    }
  }, [id]);

  // IF ID EXISTS: Auto-index the report
  useEffect(() => {
    if (!id) return;

    let active = true;

    const prepareReport = async () => {
      try {
        setIndexing(true);
        setIndexError("");

        let request;
        if (
          indexingRequestRef.current.reportId === id &&
          indexingRequestRef.current.promise
        ) {
          request = indexingRequestRef.current.promise;
        } else {
          request = indexReport(id);
          indexingRequestRef.current = { reportId: id, promise: request };
        }

        await request;
        if (active) setIndexed(true);
      } catch (error) {
        if (active) setIndexError(getErrorMessage(error));
      } finally {
        if (active) setIndexing(false);
      }
    };

    prepareReport();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  const handleSend = async (value = question) => {
    if (!id) return;
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 1000 || sending) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");
    setSending(true);
    setChatError("");

    try {
      const response = await askReportQuestion(id, trimmed);
      const result = unwrap(response);
      const data = result?.data ?? result;
      const answer = data?.answer;

      if (!answer) {
        throw new Error("The AI service did not return an answer.");
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: answer,
        context: Array.isArray(data?.supporting_context)
          ? data.supporting_context
          : [],
        disclaimer: data?.disclaimer || "",
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      setChatError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleReindex = async () => {
    if (!id) return;
    try {
      setIndexing(true);
      setIndexError("");
      setIndexed(false);

      const request = indexReport(id);
      indexingRequestRef.current = { reportId: id, promise: request };

      await request;
      setIndexed(true);
    } catch (error) {
      setIndexError(getErrorMessage(error));
    } finally {
      setIndexing(false);
    }
  };

  const inputDisabled = indexing || !indexed || sending;

  /* ---------- RENDER: Select Report Screen (If no ID) ---------- */
  if (!id) {
    return (
      <Box className="page-reveal" sx={{ maxWidth: 800, mx: "auto", width: "100%", pt: 4 }}>
        <Surface padding={4} sx={{ textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", p: 2, borderRadius: 3, bgcolor: tokens.tealTint, color: tokens.teal, mb: 2 }}>
            <Bot size={40} />
          </Box>
          <Typography variant="h4" color={tokens.navy} fontWeight={700} gutterBottom>
            MediLens AI Assistant
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
            Select one of your uploaded medical reports below to start a secure, educational conversation about its contents.
          </Typography>

          {loadingReports ? (
            <CircularProgress size={24} sx={{ color: tokens.teal }} />
          ) : reports.length === 0 ? (
            <Alert severity="info" sx={{ justifyContent: "center" }}>
              You haven't uploaded any reports yet. <br/><br/>
              <Button variant="contained" color="secondary" onClick={() => navigate("/upload")}>Upload a report</Button>
            </Alert>
          ) : (
            <TextField
              select
              fullWidth
              label="Select a medical report"
              defaultValue=""
              onChange={(e) => navigate(`/reports/${e.target.value}/chat`)}
              sx={{ maxWidth: 400, mx: "auto", textAlign: "left" }}
            >
              {reports.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.originalFilename || `Report #${r.id}`} ({new Date(r.uploadedAt).toLocaleDateString()})
                </MenuItem>
              ))}
            </TextField>
          )}
        </Surface>
      </Box>
    );
  }

  /* ---------- RENDER: Chat Screen (If ID exists) ---------- */
  return (
    <Box
      className="page-reveal"
      sx={{ maxWidth: 1050, mx: "auto", width: "100%" }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/reports/${id}`)}
            sx={{
              mb: 1,
              color: tokens.inkMuted,
              "&:hover": { bgcolor: tokens.bgSubtle },
            }}
          >
            Back to report
          </Button>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: tokens.teal,
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Bot size={22} />
            </Box>

            <Box>
              <Typography variant="h4" color={tokens.navy}>
                MediLens AI assistant
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Ask questions about your uploaded medical report.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate("/chat")}
            sx={{ borderColor: tokens.border, color: tokens.navy, "&:hover": { borderColor: tokens.teal, color: tokens.teal } }}
          >
            Switch Report
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={handleReindex}
            disabled={indexing || sending}
            sx={{
              borderColor: tokens.border,
              color: tokens.navy,
              "&:hover": { borderColor: tokens.teal, color: tokens.teal },
            }}
          >
            Re-index report
          </Button>
        </Stack>
      </Stack>

      {/* Indexing states */}
      {indexing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={16} sx={{ color: tokens.info }} />
            <Typography variant="body2">
              Preparing your report for AI questions…
            </Typography>
          </Stack>
        </Alert>
      )}

      {!indexing && indexed && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Report indexed. You can now ask questions about this report.
        </Alert>
      )}

      {indexError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Stack spacing={1}>
            <Typography variant="body2">{indexError}</Typography>
            <Button
              size="small"
              onClick={handleReindex}
              disabled={indexing}
              sx={{ alignSelf: "flex-start" }}
            >
              Retry indexing
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Chat card */}
      <Surface padding={0} contentSx={{ p: 0 }} sx={{ overflow: "hidden" }}>
        {/* Chat header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            bgcolor: tokens.bg,
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <FileText size={18} color={tokens.teal} />
            <Box>
              <Typography fontWeight={600} variant="body2" color={tokens.navy}>
                Report conversation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Report ID: {id}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            minHeight: 400,
            maxHeight: 550,
            overflowY: "auto",
            p: { xs: 2, sm: 3 },
            bgcolor: tokens.surface,
          }}
        >
          {/* Welcome */}
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{ mb: 3 }}
          >
            <Avatar
              sx={{
                bgcolor: tokens.teal,
                width: 34,
                height: 34,
              }}
            >
              <Bot size={18} />
            </Avatar>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: "85%",
                bgcolor: tokens.bgSubtle,
                borderRadius: 2,
                borderTopLeftRadius: 4,
              }}
            >
              <Typography
                fontWeight={600}
                variant="body2"
                color={tokens.navy}
                sx={{ mb: 0.5 }}
              >
                Hello — I'm your MediLens assistant
              </Typography>

              <Typography
                variant="body2"
                color={tokens.ink}
                sx={{ lineHeight: 1.75 }}
              >
                I can help explain the information in this uploaded report,
                describe laboratory terminology, and help you prepare
                questions for your healthcare professional.
              </Typography>
            </Paper>
          </Stack>

          {/* Conversation */}
          {messages.map((message) => (
            <Stack
              key={message.id}
              direction="row"
              justifyContent={
                message.role === "user" ? "flex-end" : "flex-start"
              }
              spacing={1.25}
              sx={{ mb: 3 }}
            >
              {message.role === "assistant" && (
                <Avatar
                  sx={{
                    bgcolor: tokens.teal,
                    width: 34,
                    height: 34,
                  }}
                >
                  <Bot size={18} />
                </Avatar>
              )}

              <Box sx={{ maxWidth: "85%", minWidth: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      message.role === "user"
                        ? tokens.infoTint
                        : tokens.bgSubtle,
                    borderTopLeftRadius:
                      message.role === "assistant" ? 4 : 2,
                    borderTopRightRadius:
                      message.role === "user" ? 4 : 2,
                  }}
                >
                  {message.role === "assistant" ? (
                    <MarkdownAnswer content={message.content} />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}
                    >
                      {message.content}
                    </Typography>
                  )}
                </Paper>

                {/* Supporting context */}
                {message.context?.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      Supporting report context
                    </Typography>

                    {message.context.map((item, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          mt: 1,
                          borderRadius: 1.5,
                          borderColor: tokens.border,
                          bgcolor: tokens.surface,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Context {index + 1}
                          {item.similarity != null
                            ? ` · Similarity: ${Number(
                                item.similarity
                              ).toFixed(2)}`
                            : ""}
                        </Typography>

                        <Typography
                          variant="body2"
                          color={tokens.ink}
                          sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                        >
                          {item.text}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}

                {message.disclaimer && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {message.disclaimer}
                  </Alert>
                )}
              </Box>

              {message.role === "user" && (
                <Avatar
                  sx={{
                    bgcolor: tokens.navy,
                    width: 34,
                    height: 34,
                  }}
                >
                  <UserRound size={17} />
                </Avatar>
              )}
            </Stack>
          ))}

          {/* AI thinking */}
          {sending && (
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: tokens.teal,
                  width: 34,
                  height: 34,
                }}
              >
                <Bot size={18} />
              </Avatar>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: tokens.bgSubtle,
                  borderRadius: 2,
                  borderTopLeftRadius: 4,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={14} sx={{ color: tokens.teal }} />
                  <Typography variant="body2" color="text.secondary">
                    MediLens is preparing an answer…
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Suggested questions */}
        {messages.length === 0 && (
          <Box sx={{ p: 2.5, bgcolor: tokens.bg }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Sparkles size={16} color={tokens.teal} />
              <Typography fontWeight={600} variant="body2" color={tokens.navy}>
                Suggested questions
              </Typography>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {suggestions.map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  variant="outlined"
                  onClick={() => setQuestion(suggestion)}
                  disabled={inputDisabled}
                  sx={{
                    cursor: "pointer",
                    bgcolor: tokens.surface,
                    borderColor: tokens.border,
                    "&:hover": {
                      borderColor: tokens.teal,
                      bgcolor: tokens.surface,
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Input */}
        <Box sx={{ p: 2.5 }}>
          {chatError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {chatError}
            </Alert>
          )}

          <Stack direction="row" spacing={1.25} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask a question about your medical report…"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={inputDisabled}
              helperText={`${question.length}/1000 characters`}
              FormHelperTextProps={{
                sx: { fontSize: "0.7rem", color: tokens.inkSoft, ml: 0.5 },
              }}
            />

            <IconButton
              onClick={() => handleSend()}
              disabled={
                inputDisabled ||
                question.trim().length < 3 ||
                question.length > 1000
              }
              sx={{
                bgcolor: tokens.teal,
                color: "#FFFFFF",
                width: 44,
                height: 44,
                borderRadius: 2,
                "&:hover": { bgcolor: tokens.tealDark },
                "&.Mui-disabled": {
                  bgcolor: tokens.bgSubtle,
                  color: tokens.inkFaint,
                },
              }}
            >
              <Send size={19} />
            </IconButton>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.5 }}
          >
            MediLens provides educational information, not medical diagnosis or
            treatment advice.
          </Typography>
        </Box>
      </Surface>

      {/* Safety banner */}
      <Alert
        severity="warning"
        sx={{
          mt: 2,
          bgcolor: tokens.borderlineTint,
          color: tokens.ink,
          "& .MuiAlert-icon": { color: tokens.borderline },
        }}
      >
        <Typography variant="body2">
          Do not use AI responses as a substitute for professional medical
          advice. Consult a qualified healthcare professional about medical
          concerns.
        </Typography>
      </Alert>
    </Box>
  );
}