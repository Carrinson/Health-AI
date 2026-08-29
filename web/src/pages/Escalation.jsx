import { useEffect, useState } from "react";
import client from "../api/client";

export default function Escalations() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await client.get("/assistant/escalations");
      setItems(res.data);
    } catch {
      setError("Failed to load escalations");
    }
  }

  useEffect(() => { load(); }, []);

  async function markReviewed(id) {
    await client.patch(`/assistant/escalations/${id}/review`);
    load();
  }

  if (error) return <p style={{ padding: 24, color: "#DC2626" }}>{error}</p>;

  const unreviewed = items.filter((i) => !i.reviewed);
  const reviewed = items.filter((i) => i.reviewed);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
      <p style={styles.eyebrow}>{unreviewed.length} awaiting review</p>
      <h1 style={styles.title}>Assistant escalations</h1>

      {unreviewed.map((item) => (
        <div key={item.id} style={styles.card}>
          <p style={styles.badge}>Unreviewed</p>
          <p style={styles.meta}>{item.patient_name} · {new Date(item.created_at).toLocaleString()}</p>
          <p style={styles.question}>"{item.question}"</p>
          <p style={styles.answer}>{item.answer}</p>
          <p style={styles.topics}>Matched: {item.matched_topics}</p>
          <button onClick={() => markReviewed(item.id)} style={styles.button}>Mark reviewed</button>
        </div>
      ))}

      {unreviewed.length === 0 && <p style={{ color: "#6B7280" }}>No pending escalations.</p>}

      {reviewed.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>Reviewed</h2>
          {reviewed.map((item) => (
            <div key={item.id} style={{ ...styles.card, opacity: 0.6 }}>
              <p style={styles.meta}>Patient #{item.patient_id} · {new Date(item.created_at).toLocaleString()}</p>
              <p style={styles.question}>"{item.question}"</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 36, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 24px" },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 },
  card: { border: "1px solid #DC2626", borderRadius: 8, padding: 20, marginBottom: 16 },
  badge: { display: "inline-block", background: "#DC2626", color: "#FFFFFF", fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, margin: "0 0 8px" },
  meta: { fontSize: 12, color: "#6B7280", margin: "0 0 8px" },
  question: { fontStyle: "italic", margin: "0 0 8px" },
  answer: { fontSize: 14, margin: "0 0 8px" },
  topics: { fontSize: 12, color: "#6B7280", margin: "0 0 12px" },
  button: { border: "none", background: "#111111", color: "#FFFFFF", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
};