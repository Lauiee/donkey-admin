import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layout/AdminLayout";
import { Billing } from "./pages/Billing";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { HistoryDetail } from "./pages/HistoryDetail";
import { Login } from "./pages/Login";
import { Usage } from "./pages/Usage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usage" element={<Usage />} />
          <Route path="billing" element={<Billing />} />
          <Route path="history" element={<History />} />
          <Route path="history/:jobId" element={<HistoryDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
