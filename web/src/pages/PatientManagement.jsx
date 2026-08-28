import { useEffect, useState } from "react";
import client from "../api/client";

const URGENCY_STYLE = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/monitoring/patients")
      .then((res) => setPatients(res.data))
      .catch(() => setError("Failed to load patients"));
  }, []);

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
            <div key={p.id} style={styles.row}>
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
};