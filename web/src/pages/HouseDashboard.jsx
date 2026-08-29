import { useEffect, useState } from "react";
import client from "../api/client";

export default function HospitalDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/monitoring/hospital-overview")
      .then((res) => setData(res.data))
      .catch(() => setError("You don't have access to this view, or it failed to load"));
  }, []);

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Organisation overview</p>
      <h1 style={styles.title}>Hospital dashboard</h1>

      <div style={styles.statGrid}>
        <Stat label="Patients" value={data.total_patients} />
        <Stat label="Doctors" value={data.total_doctors} />
        <Stat label="Records" value={data.total_records} />
        <Stat label="Appointments" value={data.total_appointments} />
      </div>

      <h2 style={styles.sectionTitle}>Staff directory</h2>
      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Doctor</span>
          <span>Appointments handled</span>
        </div>
        {data.doctors.map((d) => (
          <div key={d.id} style={styles.row}>
            <span style={{ fontWeight: 600 }}>{d.fullname}</span>
            <span style={{ fontFamily: "monospace" }}>{d.appointment_count}</span>
          </div>
        ))}
        {data.doctors.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>No doctors registered yet.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statValue}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 32px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 },
  statCard: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  statValue: { fontSize: 28, fontWeight: 700, margin: "0 0 4px" },
  statLabel: { fontSize: 12, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginTop: 24, marginBottom: 12 },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "13px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
};