import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

import { Link } from "react-router-dom";

import ModelTestTool from "./pages/ModelTestTool";
import Monitoring from "./pages/Monitoring";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientManagement from "./pages/PatientManagement";



function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <Link to="/model-test-tool">Go to Model Test Tool</Link>
      <Link to="/monitoring">Go to Monitoring</Link>
      <Link to="/doctordashboard">Go to Doctors Dashboard</Link>
      <Link to="/patientmanagement">Go to Patient Management</Link>
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
            path="/model-test-tool"
            element={
              <ProtectedRoute>
                <ModelTestTool />
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
          
          <Route
            path="/patientmanagement"
            element={
              <ProtectedRoute>
                <PatientManagement />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}