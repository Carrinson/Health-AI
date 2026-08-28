import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

import { Link } from "react-router-dom";

import SymptomChecker from "./pages/SymptomChecker";
import Monitoring from "./pages/Monitoring";
import DoctorDashboard from "./pages/DoctorDashboard";



function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <Link to="/symptom-checker">Go to Symptom Checker</Link>
      <Link to="/monitoring">Go to Monitoring</Link>
      <Link to="/doctordashboard">Go to Doctors Dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom-checker"
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <Monitoring />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctordashboard"
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}