import { useState } from "react";
import client from "../api/client";

export default function AdminCreateDoctor() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/admin/doctors", { fullname, email, password });
      setSuccess(true);
      setFullname(""); setEmail(""); setPassword("");
    } catch {
      setError("Failed to create doctor — email may already be in use");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Staff onboarding</p>
      <h1 style={styles.title}>Add a doctor</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input placeholder="Full name" value={fullname} onChange={(e) => setFullname(e.target.value)} style={styles.input} />
        <input placeholder="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <input placeholder="Temporary password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />

        {error && <p style={{ color: "#DC2626", fontSize: 13 }}>{error}</p>}
        {success && <p style={{ color: "#16A34A", fontSize: 13 }}>Doctor account created.</p>}

        <button type="submit" style={styles.button}>Create doctor account</button>
      </form>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 30, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 24px" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: 12, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 15 },
  button: { border: "none", background: "#2563EB", color: "#FFFFFF", fontWeight: 600, padding: 14, borderRadius: 6, cursor: "pointer" },
};