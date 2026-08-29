import { useEffect, useState } from "react";
import client from "../api/client";

const ROLE_OPTIONS = ["patient", "doctor", "hospital_admin", "platform_admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    try {
      const res = await client.get("/admin/users");
      setUsers(res.data);
    } catch {
      setError("Failed to load users — admin access required");
    }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(userId, newRole) {
    try {
      await client.patch(`/admin/users/${userId}/role`, { role: newRole });
      load();
    } catch {
      setError("Failed to update role");
    }
  }

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>{users.length} total accounts</p>
      <h1 style={styles.title}>All users</h1>

      <div style={styles.filterRow}>
        {["all", "patient", "doctor", "hospital_admin", "platform_admin"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={styles.tableBox}>
        <div style={{ ...styles.row, ...styles.headerRow }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Change role</span>
        </div>
        {filtered.map((u) => (
          <div key={u.id} style={styles.row}>
            <span style={{ fontWeight: 600 }}>{u.fullname}</span>
            <span style={{ color: "#6B7280", fontSize: 13 }}>{u.email}</span>
            <span style={styles.roleBadge}>{u.role}</span>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value)}
              style={styles.select}
            >
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>No users in this category.</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 20px" },
  filterRow: { display: "flex", gap: 8, marginBottom: 20 },
  filterBtn: { border: "1px solid #D1D5DB", background: "#FFFFFF", borderRadius: 999, padding: "6px 14px", fontSize: 13, cursor: "pointer", textTransform: "capitalize" },
  filterBtnActive: { background: "#111111", color: "#FFFFFF", borderColor: "#111111" },
  tableBox: { border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 1.2fr", gap: 12, padding: "13px 16px", borderBottom: "1px solid #F3F4F6", alignItems: "center" },
  headerRow: { background: "#FAFAFA", fontSize: 12, fontWeight: 500, textTransform: "uppercase", color: "#6B7280" },
  roleBadge: { fontSize: 12, fontFamily: "monospace", color: "#6B7280" },
  select: { padding: 6, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 },
};