import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Incorrect email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>Clinical console</p>
        <h1 style={styles.title}>Staff sign in</h1>
        <p style={styles.subtitle}>
          Doctor and hospital administrator accounts only. Patient accounts
          cannot access this console.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            <span style={styles.labelText}>Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="k.osei@stmartins.health"
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            <span style={styles.labelText}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "64px 24px", background: "#FFFFFF" },
  card: { width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 24 },
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "8px 0" },
  subtitle: { fontSize: 15, lineHeight: 1.6, color: "#6B7280", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6 },
  labelText: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280" },
  input: { padding: 12, fontSize: 16, border: "1px solid #D1D5DB", borderRadius: 6, outline: "none" },
  error: { color: "#DC2626", fontSize: 14, margin: 0 },
  button: { border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 16, fontWeight: 600, padding: 14, borderRadius: 6, cursor: "pointer" },
};