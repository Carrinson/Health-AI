import { useEffect, useState } from "react";
import client from "../api/client";

const STATUS_STYLE = {
  requested: { bg: "#D97706", label: "Requested" },
  confirmed: { bg: "#16A34A", label: "Confirmed" },
  cancelled: { bg: "#DC2626", label: "Cancelled" },
  completed: { bg: "#6B7280", label: "Completed" },
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_OPTIONS = [
  { value: 0, label: "Monday" }, { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" }, { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" }, { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [error, setError] = useState("");

  const [day, setDay] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [formError, setFormError] = useState("");

  async function load() {
    try {
      const [apptRes, availRes] = await Promise.all([
        client.get("/appointments"),
        client.get("/availability/mine"),
      ]);
      setAppointments(apptRes.data);
      setAvailability(availRes.data);
    } catch {
      setError("Failed to load appointments");
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      await client.patch(`/appointments/${id}/status`, { status });
      load();
    } catch {
      setError("Failed to update appointment");
    }
  }

  async function addAvailability() {
    setFormError("");
    try {
      await client.post("/availability", {
        day_of_week: day,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        slot_minutes: 30,
      });
      load();
    } catch {
      setFormError("Failed to add — check start time is before end time");
    }
  }

  async function removeAvailability(id) {
    try {
      await client.delete(`/availability/${id}`);
      load();
    } catch {
      setFormError("Failed to remove");
    }
  }

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>Appointment requests</p>
      <h1 style={styles.title}>Appointments</h1>

      <div style={styles.availabilityBox}>
        <p style={styles.availabilityLabel}>Your set hours</p>

        {availability.length === 0 ? (
          <p style={styles.muted}>No availability set yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {availability.map((a) => (
              <span key={a.id} style={styles.availabilityChip}>
                {DAY_NAMES[a.day_of_week]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                <button onClick={() => removeAvailability(a.id)} style={styles.removeChip}>×</button>
              </span>
            ))}
          </div>
        )}

        <div style={styles.availForm}>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} style={styles.select}>
            {DAY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={styles.timeInput}
          />
          <span style={{ color: "#6B7280" }}>to</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={styles.timeInput}
          />
          <button onClick={addAvailability} style={styles.addBtn}>Add</button>
        </div>
        {formError && <p style={{ color: "#DC2626", fontSize: 13, margin: "8px 0 0" }}>{formError}</p>}
      </div>

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
  availabilityBox: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, marginBottom: 24 },
  availabilityLabel: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: "0 0 8px" },
  availabilityChip: { border: "1px solid #D1D5DB", borderRadius: 999, padding: "4px 12px", fontSize: 13, display: "inline-flex", alignItems: "center" },
  removeChip: { border: "none", background: "none", color: "#6B7280", marginLeft: 6, cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 0 },
  muted: { fontSize: 14, color: "#6B7280", margin: 0 },
  availForm: { display: "flex", alignItems: "center", gap: 8 },
  select: { padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 },
  timeInput: { padding: 8, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 },
  addBtn: { border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "0.8fr 1.6fr 1.2fr 1fr 1.2fr", gap: 12, padding: "13px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  badge: { color: "#FFFFFF", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 12px", borderRadius: 999 },
  confirmBtn: { border: "none", background: "#2563EB", color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" },
  cancelBtn: { border: "1px solid #DC2626", background: "#FFFFFF", color: "#DC2626", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" },
};