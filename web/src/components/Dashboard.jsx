import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Patient appointments" },
  { path: "/patients", label: "Patient management" },
  { path: "/appointments", label: "Appointments" },
  { path: "/analytics", label: "Analytics" },
  { path: "/monitoring", label: "AI monitoring" },
  { path: "/model-test", label: "Model test tool" },
];

export default function DashboardLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <p style={styles.staffName}>Staff Console</p>
          <p style={styles.staffRole}>HealthAI</p>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} style={styles.signOut}>Sign out</button>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh" },
  sidebar: { width: 232, borderRight: "1px solid #E5E7EB", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 },
  sidebarHeader: { padding: "0 8px" },
  staffName: { fontSize: 15, fontWeight: 700, margin: "0 0 2px" },
  staffRole: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  nav: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: { textDecoration: "none", color: "#6B7280", fontSize: 14, fontWeight: 500, padding: "11px 12px", borderRadius: 6 },
  navItemActive: { background: "#F5F1E8", color: "#111111", fontWeight: 600 },
  signOut: { marginTop: "auto", textAlign: "left", border: "none", background: "none", color: "#6B7280", fontSize: 14, fontWeight: 500, padding: "11px 12px", cursor: "pointer" },
  main: { flex: 1, minWidth: 0 },
};