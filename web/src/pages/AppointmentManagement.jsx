import { useEffect, useState } from "react";
import client from "../api/client";

const STATUS_STYLE = {
  requested: { bg: "#D97706", label: "Requested" },
  confirmed: { bg: "#16A34A", label: "Confirmed" },
  cancelled: { bg: "#DC2626", label: "Cancelled" },
  completed: { bg: "#6B7280", label: "Completed" },
};

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await client.get("/appointments");
      setAppointments(res.data);
    } catch {
      setError("Failed to load appointments");
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      await client.patch(`/appointments/${id}/status`, { status });
      load(); // refresh the list to reflect the change
    } catch {
      setError("Failed to update appointment");
    }
  }

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Appointment requests</p>
      <h1 style={styles.title}>Appointments</h1>

      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Patient</span>
          <span>Reason</span>
          <span>Requested for</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {appointments.map((a) => {
          const style = STATUS_STYLE[a.status] || STATUS_STYLE.requested;
          return (
            <div key={a.id} style={styles.row}>
              <span>Patient #{a.patient_id}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.reason}
              </span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#6B7280" }}>
                {new Date(a.scheduled_for).toLocaleString()}
              </span>
              <span>
                <span style={{ ...styles.badge, background: style.bg }}>{style.label}</span>
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                {a.status === "requested" && (
                  <>
                    <button style={styles.confirmBtn} onClick={() => updateStatus(a.id, "confirmed")}>
                      Confirm
                    </button>
                    <button style={styles.cancelBtn} onClick={() => updateStatus(a.id, "cancelled")}>
                      Decline
                    </button>
                  </>
                )}
                {a.status === "confirmed" && (
                  <button style={styles.confirmBtn} onClick={() => updateStatus(a.id, "completed")}>
                    Mark complete
                  </button>
                )}
              </span>
            </div>
          );
        })}
        {appointments.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
            No appointment requests yet.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 24px" },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "0.8fr 1.6fr 1.2fr 1fr 1.2fr", gap: 12, padding: "13px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  badge: { color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 999 },
  confirmBtn: { border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" },
  cancelBtn: { border: "1px solid #DC2626", background: "#FFFFFF", color: "#DC2626", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" },
};