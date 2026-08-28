import { useEffect, useState } from "react";
import client from "../api/client";

const URGENCY_STYLE = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/monitoring/analytics")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load analytics"));
  }, []);

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;
  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <h1 style={styles.title}>Analytics</h1>

      <h2 style={styles.sectionTitle}>Urgency distribution</h2>
      <div style={styles.barContainer}>
        {data.urgency_distribution.map((u) => {
          const style = URGENCY_STYLE[u.urgency] || { bg: "#6B7280", label: u.urgency };
          return (
            <div
              key={u.urgency}
              style={{ width: `${u.percentage}%`, background: style.bg, height: 44 }}
            />
          );
        })}
      </div>
      <div style={styles.legendGrid}>
        {data.urgency_distribution.map((u) => {
          const style = URGENCY_STYLE[u.urgency] || { bg: "#6B7280", label: u.urgency };
          return (
            <div key={u.urgency}>
              <p style={styles.legendValue}>{u.percentage}%</p>
              <p style={styles.legendLabel}>{style.label} · {u.count} predictions</p>
            </div>
          );
        })}
      </div>

      <h2 style={styles.sectionTitle}>Appointments</h2>
      <div style={styles.statGrid}>
        <Stat label="Total" value={data.appointments.total} />
        <Stat label="Confirmed" value={data.appointments.confirmed} />
        <Stat label="Completed" value={data.appointments.completed} />
        <Stat label="Cancelled" value={data.appointments.cancelled} />
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
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginTop: 24, marginBottom: 16 },
  barContainer: { display: "flex", borderRadius: 6, overflow: "hidden", marginBottom: 16 },
  legendGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 },
  legendValue: { fontSize: 24, fontWeight: 700, margin: 0 },
  legendLabel: { fontSize: 13, color: "#6B7280", margin: 0 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  statCard: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  statValue: { fontSize: 28, fontWeight: 700, margin: "0 0 4px" },
  statLabel: { fontSize: 12, textTransform: "uppercase", color: "#6B7280", margin: 0 },
};