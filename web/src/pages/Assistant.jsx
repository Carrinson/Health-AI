import { useEffect, useState } from "react";
import client from "../api/client";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const question = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const res = await client.post("/assistant/ask", { question });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.answer, escalated: res.data.escalated, sources: res.data.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  async function loadHistory() {
    try {
      const res = await client.get("/assistant/history");
      if (res.data.length === 0) {
        setMessages([{ role: "assistant", text: "Ask a general health question. Answers are grounded in the app's reference corpus." }]);
      } else {
        const flattened = res.data.flatMap((m) => [
          { role: "user", text: m.question },
          { role: "assistant", text: m.answer, escalated: m.escalated, sources: m.sources },
        ]);
        setMessages(flattened);
      }
    } catch {
      setMessages([{ role: "assistant", text: "Ask a general health question." }]);
    }
  }
  loadHistory();
}, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px", display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
      <p style={styles.eyebrow}>RAG-grounded reference</p>
      <h1 style={styles.title}>Assistant</h1>

      <div style={styles.messageList}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant),
              ...(m.escalated ? styles.bubbleEscalated : {}),
            }}
          >
            {m.escalated && <p style={styles.escalatedLabel}>Flagged — logged for review</p>}
            <p style={{ margin: 0 }}>{m.text}</p>
            {m.sources && <p style={styles.sources}>Based on: {m.sources.join(", ")}</p>}
          </div>
        ))}
        {loading && <p style={{ color: "#6B7280", fontSize: 13 }}>Thinking...</p>}
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a health question..."
          style={styles.input}
        />
        <button onClick={send} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", margin: 0 },
  title: { fontSize: 30, fontWeight: 700, letterSpacing: -0.5, margin: "6px 0 20px" },
  messageList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 },
  bubble: { borderRadius: 10, padding: "12px 16px", maxWidth: "75%", fontSize: 14 },
  bubbleUser: { alignSelf: "flex-end", background: "#2563EB", color: "#FFFFFF" },
  bubbleAssistant: { alignSelf: "flex-start", background: "#F3F4F6", color: "#111111" },
  bubbleEscalated: { background: "#FEF2F2", border: "1px solid #DC2626" },
  escalatedLabel: { fontSize: 11, fontWeight: 700, color: "#991B1B", textTransform: "uppercase", margin: "0 0 4px" },
  sources: { fontSize: 11, color: "#6B7280", margin: "6px 0 0" },
  inputRow: { display: "flex", gap: 8, marginTop: 12 },
  input: { flex: 1, padding: 12, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14 },
  sendButton: { border: "none", background: "#2563EB", color: "#FFFFFF", fontWeight: 600, padding: "0 20px", borderRadius: 6, cursor: "pointer" },
};