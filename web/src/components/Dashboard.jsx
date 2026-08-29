import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ALL_NAV_ITEMS = [
  { path: "/dashboard", label: "Patient appointments", roles: ["doctor", "hospital_admin", "platform_admin"] },
  { path: "/patients", label: "Patient management", roles: ["doctor", "hospital_admin", "platform_admin"] },
  { path: "/appointments", label: "Appointments", roles: ["doctor"] },
  { path: "/analytics", label: "Analytics", roles: ["doctor", "hospital_admin", "platform_admin"] },
  { path: "/monitoring", label: "AI monitoring", roles: ["doctor", "hospital_admin", "platform_admin"] },
  { path: "/chat", label: "Messages", roles: ["doctor"] },
  { path: "/hospital", label: "Hospital dashboard", roles: ["hospital_admin", "platform_admin"] },
  { path: "/reports", label: "Reports", roles: ["hospital_admin", "platform_admin"] },
  { path: "/model-test", label: "Model test tool", roles: ["doctor", "hospital_admin", "platform_admin"] },
  { path: "/admin/users", label: "All users", roles: ["platform_admin"] },
  { path: "/admin/create-doctor", label: "Add a doctor", roles: ["platform_admin"] },
];

export default function DashboardLayout({ children }) {
  const { logout, role } = useAuth();
  const location = useLocation();

  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <p style={styles.staffName}>Staff Console</p>
          <p style={styles.staffRole}>{role?.replace("_", " ") || "HealthAI"}</p>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
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
  staffRole: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0, textTransform: "capitalize" },
  nav: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: { textDecoration: "none", color: "#6B7280", fontSize: 14, fontWeight: 500, padding: "11px 12px", borderRadius: 6 },
  navItemActive: { background: "#F5F1E8", color: "#111111", fontWeight: 600 },
  signOut: { marginTop: "auto", textAlign: "left", border: "none", background: "none", color: "#6B7280", fontSize: 14, fontWeight: 500, padding: "11px 12px", cursor: "pointer" },
  main: { flex: 1, minWidth: 0 },
};