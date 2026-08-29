import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientManagement from "./pages/PatientManagement";
import AppointmentManagement from "./pages/AppointmentManagement";
import Analytics from "./pages/Analytics";
import Monitoring from "./pages/Monitoring";
import SymptomChecker from "./pages/SymptomChecker";
import Chat from "./pages/Chat";
import HospitalDashboard from "./pages/HospitalDashboard";
import Reports from "./pages/Reports";
import AdminUsers from "./pages/AdminUsers";
import AdminCreateDoctor from "./pages/AdminCreateDoctor";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function withLayout(Page) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Page />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={withLayout(DoctorDashboard)} />
          <Route path="/patients" element={withLayout(PatientManagement)} />
          <Route path="/appointments" element={withLayout(AppointmentManagement)} />
          <Route path="/analytics" element={withLayout(Analytics)} />
          <Route path="/monitoring" element={withLayout(Monitoring)} />
          <Route path="/chat" element={withLayout(Chat)} />
          <Route path="/hospital" element={withLayout(HospitalDashboard)} />
          <Route path="/reports" element={withLayout(Reports)} />
          <Route path="/model-test" element={withLayout(SymptomChecker)} />
          <Route path="/admin/users" element={withLayout(AdminUsers)} />
          <Route path="/admin/create-doctor" element={withLayout(AdminCreateDoctor)} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}