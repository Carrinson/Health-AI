import { useEffect, useState } from "react";
import client from "../api/client";

const URGENCY_STYLE = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/monitoring/queue")
      .then((res) => setQueue(res.data))
      .catch(() => setError("Failed to load patient queue"));
  }, []);

  const counts = queue.reduce((acc, q) => {
    acc[q.urgency] = (acc[q.urgency] || 0) + 1;
    return acc;
  }, {});

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Sorted by triage urgency</p>
      <h1 style={styles.title}>Patient appointments</h1>

      <div style={styles.summaryRow}>
        <Summary label="Emergency" value={counts.emergency || 0} color="#DC2626" />
        <Summary label="See a doctor" value={counts.see_a_doctor || 0} color="#D97706" />
        <Summary label="Needs info" value={counts.insufficient_info || 0} color="#6B7280" />
      </div>

      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Patient</span>
          <span>Complaint</span>
          <span>Urgency</span>
          <span>When</span>
        </div>
        {queue.map((q) => {
          const style = URGENCY_STYLE[q.urgency] || { bg: "#6B7280", label: q.urgency };
          return (
            <div
              key={q.record_id}
              style={{ ...styles.row, cursor: "pointer" }}
              onClick={() => setSelected(q)}
            >
              <span>Patient #{q.patient_id}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {q.predictions[0]?.condition || "—"}
              </span>
              <span>
                <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#6B7280" }}>
                {new Date(q.created_at).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={styles.detailPanel}>
          {selected.red_flags.length > 0 && (
            <div style={styles.redFlagBox}>
              <p style={styles.redFlagLabel}>Red flag triggered</p>
              {selected.red_flags.map((f, i) => (
                <p key={i} style={{ margin: 0, fontWeight: 600, color: "#991B1B" }}>{f.message}</p>
              ))}
            </div>
          )}
          <h2 style={{ marginTop: 20 }}>Patient #{selected.patient_id}</h2>
          <p style={{ color: "#6B7280", fontFamily: "monospace", fontSize: 13 }}>{selected.record_id}</p>
          <h3 style={{ marginTop: 20, fontSize: 14, textTransform: "uppercase", color: "#6B7280" }}>
            Model output
          </h3>
          {selected.predictions.map((p) => (
            <p key={p.condition}>{p.condition} — {(p.probability * 100).toFixed(1)}%</p>
          ))}
          <button style={styles.closeButton} onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, textTransform: "uppercase", color: "#6B7280", margin: 0 }}>{label}</p>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 24px" },
  summaryRow: { display: "flex", gap: 32, marginBottom: 32 },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", gap: 16, padding: "14px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  badge: { color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 999 },
  detailPanel: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, marginTop: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  redFlagBox: { background: "#FEF2F2", padding: 16, borderRadius: 6, marginBottom: 12 },
  redFlagLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#991B1B", margin: "0 0 4px" },
  closeButton: { marginTop: 16, border: "1px solid #D1D5DB", background: "#FFFFFF", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
};