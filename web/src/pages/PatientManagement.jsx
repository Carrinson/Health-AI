import { useEffect, useState } from "react";
import client from "../api/client";

const URGENCY_STYLE = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

const STATUS_STYLE = {
  requested: { bg: "#D97706", label: "Requested" },
  confirmed: { bg: "#16A34A", label: "Confirmed" },
  cancelled: { bg: "#DC2626", label: "Cancelled" },
  completed: { bg: "#6B7280", label: "Completed" },
};

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/monitoring/patients")
      .then((res) => setPatients(res.data))
      .catch(() => setError("Failed to load patients"));
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    client.get(`/monitoring/patients/${selectedId}`)
      .then((res) => setDetail(res.data))
      .catch(() => setError("Failed to load patient detail"));
  }, [selectedId]);

  const filtered = patients.filter(
    (p) =>
      p.fullname.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>{patients.length} registered patients</p>
      <h1 style={styles.title}>Patient management</h1>

      <input
        placeholder="Search name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Name</span>
          <span>Email</span>
          <span>Records</span>
          <span>Last triage</span>
        </div>
        {filtered.map((p) => {
          const style = p.last_urgency ? URGENCY_STYLE[p.last_urgency] : null;
          return (
            <div
              key={p.id}
              style={{ ...styles.row, cursor: "pointer" }}
              onClick={() => setSelectedId(p.id)}
            >
              <span style={{ fontWeight: 600 }}>{p.fullname}</span>
              <span style={{ color: "#6B7280" }}>{p.email}</span>
              <span style={{ fontFamily: "monospace" }}>{p.record_count}</span>
              <span>
                {style ? (
                  <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
                ) : (
                  <span style={{ color: "#6B7280" }}>—</span>
                )}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
            No patients match "{search}".
          </div>
        )}
      </div>

      {detail && (
        <div style={styles.detailPanel}>
          <div style={styles.detailHeader}>
            <div>
              <h2 style={{ margin: 0 }}>{detail.fullname}</h2>
              <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: 14 }}>{detail.email}</p>
              <p style={{ margin: "2px 0 0", fontFamily: "monospace", fontSize: 12, color: "#6B7280" }}>
                Patient #{detail.id} · joined {new Date(detail.created_at).toLocaleDateString()}
              </p>
            </div>
            <button style={styles.closeButton} onClick={() => setSelectedId(null)}>Close</button>
          </div>

          <h3 style={styles.subheading}>Medical records ({detail.records.length})</h3>
          {detail.records.length === 0 && <p style={{ color: "#6B7280" }}>No records yet.</p>}
          {detail.records.map((r) => {
            const style = r.content.urgency ? URGENCY_STYLE[r.content.urgency] : null;
            return (
              <div key={r.id} style={styles.detailCard}>
                <div style={styles.detailCardHeader}>
                  <span style={{ fontWeight: 600 }}>{r.title}</span>
                  {style && (
                    <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
                  )}
                </div>
                {r.content.predictions?.map((p) => (
                  <p key={p.condition} style={{ margin: "4px 0 0", fontSize: 14 }}>
                    {p.condition} — {(p.probability * 100).toFixed(1)}%
                  </p>
                ))}
                <p style={styles.mono}>{r.record_type} · {new Date(r.created_at).toLocaleString()}</p>
              </div>
            );
          })}

          <h3 style={styles.subheading}>Appointments ({detail.appointments.length})</h3>
          {detail.appointments.length === 0 && <p style={{ color: "#6B7280" }}>No appointments yet.</p>}
          {detail.appointments.map((a) => {
            const style = STATUS_STYLE[a.status] || STATUS_STYLE.requested;
            return (
              <div key={a.id} style={styles.detailCard}>
                <div style={styles.detailCardHeader}>
                  <span style={{ fontWeight: 600 }}>{a.reason}</span>
                  <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
                </div>
                <p style={styles.mono}>{new Date(a.scheduled_for).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 24px" },
  search: { width: 300, padding: 11, fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 6, marginBottom: 20 },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "1fr 1.5fr 0.6fr 1fr", gap: 16, padding: "13px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  badge: { color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 999 },
  detailPanel: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, marginTop: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  closeButton: { border: "1px solid #D1D5DB", background: "#FFFFFF", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
  subheading: { fontSize: 14, textTransform: "uppercase", color: "#6B7280", marginTop: 24, marginBottom: 12 },
  detailCard: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 14, marginBottom: 10 },
  detailCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#6B7280", marginTop: 6 },
};