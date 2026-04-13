import { Routes, Route, Navigate } from "react-router-dom";
import { getRole } from "./auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layout/AdminLayout";
import { Billing } from "./pages/Billing";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { HistoryDetail } from "./pages/HistoryDetail";
import { Inquiry } from "./pages/Inquiry";
import { InquiryDetail } from "./pages/InquiryDetail";
import { Login } from "./pages/Login";
import { TuringLab } from "./pages/TuringLab";
import { Usage } from "./pages/Usage";

function IndexRedirect() {
  const role = getRole();
  const to = role === "admin" ? "/inquiry" : "/dashboard";
  return <Navigate to={to} replace />;
}

function ClientOnlyRoute({ children }: { children: React.ReactNode }) {
  const role = getRole();
  if (role === "admin") return <Navigate to="/inquiry" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<IndexRedirect />} />
          <Route
            path="dashboard"
            element={
              <ClientOnlyRoute>
                <Dashboard />
              </ClientOnlyRoute>
            }
          />
          <Route
            path="usage"
            element={
              <ClientOnlyRoute>
                <Usage />
              </ClientOnlyRoute>
            }
          />
          <Route
            path="billing"
            element={
              <ClientOnlyRoute>
                <Billing />
              </ClientOnlyRoute>
            }
          />
          <Route
            path="history"
            element={
              <ClientOnlyRoute>
                <History />
              </ClientOnlyRoute>
            }
          />
          <Route
            path="history/:jobId"
            element={
              <ClientOnlyRoute>
                <HistoryDetail />
              </ClientOnlyRoute>
            }
          />
          <Route path="inquiry" element={<Inquiry />} />
          <Route path="inquiry/:id" element={<InquiryDetail />} />
          <Route path="turing" element={<TuringLab />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
