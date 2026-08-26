import { useState } from "react";
import client from "../api/client";

// A small curated subset of your 132-column dataset — showing all 132 as
// checkboxes would be unusable. This is a deliberate UX scoping decision,
// worth mentioning in your report: pick the most common/recognizable
// symptoms rather than exposing the full feature space.
const COMMON_SYMPTOMS = [
  "itching", "skin_rash", "chest_pain", "breathlessness", "sweating",
  "headache", "high_fever", "cough", "fatigue", "vomiting",
  "joint_pain", "nausea", "dizziness", "stomach_pain",
];

export default function SymptomChecker() {
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(symptom) {
    setSelected((prev) => ({ ...prev, [symptom]: prev[symptom] ? 0 : 1 }));
  }

  async function handleSubmit() {
    const symptoms = Object.fromEntries(
      Object.entries(selected).filter(([, v]) => v === 1)
    );
    if (Object.keys(symptoms).length === 0) {
      setError("Select at least one symptom");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await client.post("/predict/triage", { symptoms });
      setResult(res.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const urgencyColor = {
    emergency: "#dc2626",
    see_a_doctor: "#d97706",
    insufficient_info: "#6b7280",
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <h1>Symptom Checker</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {COMMON_SYMPTOMS.map((s) => (
          <label
            key={s}
            style={{
              padding: "6px 12px", borderRadius: 20, border: "1px solid #ccc",
              cursor: "pointer",
              background: selected[s] ? "#2563eb" : "#fff",
              color: selected[s] ? "#fff" : "#000",
            }}
          >
            <input
              type="checkbox" checked={!!selected[s]}
              onChange={() => toggle(s)}
              style={{ display: "none" }}
            />
            {s.replaceAll("_", " ")}
          </label>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Checking..." : "Check Symptoms"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
          <div
            style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 20,
              color: "#fff", background: urgencyColor[result.urgency] || "#333",
              marginBottom: 12, fontWeight: 600, fontSize: 13, textTransform: "uppercase",
            }}
          >
            {result.urgency.replaceAll("_", " ")}
          </div>

          {result.red_flags.length > 0 && (
            <div style={{ background: "#fef2f2", padding: 12, borderRadius: 6, marginBottom: 12 }}>
              {result.red_flags.map((f, i) => (
                <p key={i} style={{ margin: 0, color: "#991b1b" }}>{f.message}</p>
              ))}
            </div>
          )}

          <h3>Possible conditions</h3>
          <ul>
            {result.predictions.map((p) => (
              <li key={p.condition}>
                {p.condition} — {(p.probability * 100).toFixed(1)}%
              </li>
            ))}
          </ul>

          <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}