export default function Reports() {
  const baseUrl = import.meta.env.VITE_API_URL;

  function download(path) {
  const token = localStorage.getItem("token");
  fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Export failed — Doctors cant export this file");
      }
      return res.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = path.split("/").pop() + ".csv";
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((err) => alert(err.message));
}

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>CSV exports</p>
      <h1 style={styles.title}>Reports</h1>

      <div style={styles.cardGrid}>
        <ReportCard title="Patients" onClick={() => download("/monitoring/export/patients")} />
        <ReportCard title="Appointments" onClick={() => download("/monitoring/export/appointments")} />
        <ReportCard title="AI audit log" onClick={() => download("/monitoring/export/audit-log")} />
      </div>
    </div>
  );
}

function ReportCard({ title, onClick }) {
  return (
    <div style={styles.card} onClick={onClick}>
      <span style={{ fontWeight: 600 }}>{title}</span>
      <span style={styles.downloadLabel}>Download CSV ↓</span>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 32px" },
  cardGrid: { display: "flex", flexDirection: "column", gap: 12 },
  card: { border: "1px solid #E5E7EB", borderRadius: 8, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  downloadLabel: { fontSize: 13, color: "#2563EB", fontWeight: 600 },
};