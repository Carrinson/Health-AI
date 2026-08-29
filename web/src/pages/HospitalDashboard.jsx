import { useEffect, useState } from "react";
import client from "../api/client";

const STATUS_STYLE = {
  requested: { bg: "#D97706", label: "Requested" },
  confirmed: { bg: "#16A34A", label: "Confirmed" },
  cancelled: { bg: "#DC2626", label: "Cancelled" },
  completed: { bg: "#6B7280", label: "Completed" },
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function HospitalDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    client.get("/monitoring/hospital-overview")
      .then((res) => setData(res.data))
      .catch(() => setError("You don't have access to this view, or it failed to load"));
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    client.get(`/monitoring/doctors/${selectedId}`)
      .then((res) => setDetail(res.data))
      .catch(() => setError("Failed to load doctor detail"));
  }, [selectedId]);

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
          <div key={d.id} style={{ ...styles.row, cursor: "pointer" }} onClick={() => setSelectedId(d.id)}>
            <span style={{ fontWeight: 600 }}>{d.fullname}</span>
            <span style={{ fontFamily: "monospace" }}>{d.appointment_count}</span>
          </div>
        ))}
        {data.doctors.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>No doctors registered yet.</div>
        )}
      </div>

      {detail && (
        <div style={styles.detailPanel}>
          <div style={styles.detailHeader}>
            <div>
              <h2 style={{ margin: 0 }}>{detail.fullname}</h2>
              <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: 14 }}>{detail.email}</p>
              <p style={{ margin: "2px 0 0", fontFamily: "monospace", fontSize: 12, color: "#6B7280" }}>
                Doctor #{detail.id} · joined {new Date(detail.created_at).toLocaleDateString()}
              </p>
            </div>
            <button style={styles.closeButton} onClick={() => setSelectedId(null)}>Close</button>
          </div>

          <h3 style={styles.subheading}>Set availability</h3>
          {detail.availability.length === 0 && <p style={{ color: "#6B7280" }}>No availability set.</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {detail.availability.map((a) => (
              <span key={a.id} style={styles.chip}>
                {DAY_NAMES[a.day_of_week]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
              </span>
            ))}
          </div>

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
                <p style={styles.mono}>Patient #{a.patient_id} · {new Date(a.scheduled_for).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
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
  detailPanel: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 24, marginTop: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  closeButton: { border: "1px solid #D1D5DB", background: "#FFFFFF", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
  subheading: { fontSize: 14, textTransform: "uppercase", color: "#6B7280", marginTop: 24, marginBottom: 12 },
  chip: { border: "1px solid #D1D5DB", borderRadius: 999, padding: "4px 12px", fontSize: 13 },
  detailCard: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 14, marginBottom: 10 },
  detailCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#6B7280", marginTop: 6 },
};