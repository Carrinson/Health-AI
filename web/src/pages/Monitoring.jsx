import { useEffect, useState } from "react";
import client from "../api/client";

const URGENCY_STYLE = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

export default function Monitoring() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          client.get("/monitoring/stats"),
          client.get("/monitoring/recent"),
        ]);
        setStats(statsRes.data);
        setRecent(recentRes.data);
      } catch {
        setError("Failed to load monitoring data");
      }
    }
    load();
  }, []);

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;
  if (!stats) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Reads from prediction_audit_log</p>
      <h1 style={styles.title}>AI monitoring</h1>

      <div style={styles.statGrid}>
        <StatCard label="Total predictions" value={stats.total_predictions} />
        <StatCard label="Red-flag count" value={stats.red_flag_count} />
        <StatCard label="Red-flag rate" value={`${(stats.red_flag_rate * 100).toFixed(1)}%`} />
      </div>

      <h2 style={styles.sectionTitle}>Predictions by model</h2>
      <div style={styles.tableBox}>
        {stats.by_model.map((m) => (
          <div key={m.model} style={styles.row}>
            <span>{m.model}</span>
            <span style={{ fontFamily: "monospace" }}>{m.count}</span>
          </div>
        ))}
      </div>

      <h2 style={styles.sectionTitle}>Recent predictions</h2>
      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Timestamp</span>
          <span>Endpoint</span>
          <span>Urgency</span>
        </div>
        {recent.map((r) => {
          const style = URGENCY_STYLE[r.urgency] || { bg: "#6B7280", label: r.urgency || "—" };
          return (
            <div key={r.id} style={styles.row}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#6B7280" }}>
                {new Date(r.created_at).toLocaleString()}
              </span>
              <span>{r.endpoint}</span>
              <span>
                {r.urgency && (
                  <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 32px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 },
  statCard: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  statLabel: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: "0 0 8px" },
  statValue: { fontSize: 32, fontWeight: 700, letterSpacing: -0.5, margin: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12 },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, padding: "12px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  badge: { color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 999 },
};