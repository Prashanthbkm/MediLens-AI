import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import ReportHistory from "./pages/ReportHistory";
import ReportDetails from "./pages/ReportDetails";
import ProcessingView from "./pages/ProcessingView";
import ExtractionReview from "./pages/ExtractionReview";
import ReportChat from "./pages/ReportChat";
import UploadReport from "./pages/UploadReport";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Upload Report */}
              <Route path="/upload" element={<UploadReport />} />

              {/* Processing Queue (From Sidebar) */}
              <Route path="/processing" element={<ProcessingView />} />

              {/* Processing View (Specific Report) */}
              <Route path="/reports/:id/processing" element={<ProcessingView />} />

              {/* Trends */}
              <Route path="/trends" element={<Trends />} />

              {/* Report History */}
              <Route path="/reports" element={<ReportHistory />} />

              {/* Report Details / Analysis Results */}
              <Route path="/reports/:id" element={<ReportDetails />} />

              {/* Extraction Review */}
              <Route path="/reports/:id/review" element={<ExtractionReview />} />

              {/* AI Chat (From Sidebar - no specific report selected yet) */}
              <Route path="/chat" element={<ReportChat />} />

              {/* AI Chat (From inside a specific report) */}
              <Route path="/reports/:id/chat" element={<ReportChat />} />

              {/* Settings and Privacy */}
              <Route path="/settings" element={<Settings />} />

            </Route>
          </Route>

          {/* Unknown URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;