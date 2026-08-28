import { useEffect, useRef, useState } from "react";
import client from "../api/client";

export default function Chat() {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    async function init() {
      const meRes = await client.get("/auth/me");
      setUserId(meRes.data.id);
      const contactsRes = await client.get("/chat/contacts");
      setContacts(contactsRes.data);
    }
    init();
  }, []);

  async function openChat(contact) {
    setActiveContact(contact);
    const res = await client.get(`/chat/history/${contact.id}`);
    setMessages(res.data);

    const token = localStorage.getItem("token");
    const wsUrl = import.meta.env.VITE_API_URL
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    ws.current?.close();
    ws.current = new WebSocket(`${wsUrl}/ws/chat?token=${token}`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
  }

  function sendMessage() {
    if (!input.trim() || !ws.current || !activeContact) return;
    ws.current.send(JSON.stringify({ recipient_id: activeContact.id, content: input }));
    setInput("");
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px", display: "flex", gap: 24, height: "calc(100vh - 80px)" }}>
      <div style={styles.contactList}>
        <h2 style={styles.title}>Messages</h2>
        {contacts.length === 0 && (
          <p style={styles.muted}>No patients have booked with you yet.</p>
        )}
        {contacts.map((c) => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            style={{
              ...styles.contactRow,
              ...(activeContact?.id === c.id ? styles.contactRowActive : {}),
            }}
          >
            {c.fullname}
          </div>
        ))}
      </div>

      <div style={styles.chatPanel}>
        {!activeContact ? (
          <p style={styles.muted}>Select a patient to view messages.</p>
        ) : (
          <>
            <h3 style={{ marginTop: 0 }}>{activeContact.fullname}</h3>
            <div style={styles.messageList}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    ...styles.bubble,
                    ...(m.sender_id === userId ? styles.bubbleSent : styles.bubbleReceived),
                  }}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div style={styles.inputRow}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a reply..."
                style={styles.input}
              />
              <button onClick={sendMessage} style={styles.sendButton}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  muted: { color: "#6B7280", fontSize: 14 },
  contactList: { width: 260, borderRight: "1px solid #E5E7EB", paddingRight: 16, overflowY: "auto" },
  contactRow: { padding: "12px 10px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 },
  contactRowActive: { background: "#F5F1E8" },
  chatPanel: { flex: 1, display: "flex", flexDirection: "column" },
  messageList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" },
  bubble: { borderRadius: 12, padding: "10px 14px", maxWidth: "60%", fontSize: 14 },
  bubbleSent: { alignSelf: "flex-end", background: "#2563EB", color: "#FFFFFF" },
  bubbleReceived: { alignSelf: "flex-start", background: "#F3F4F6", color: "#111111" },
  inputRow: { display: "flex", gap: 8, marginTop: 12 },
  input: { flex: 1, padding: 12, border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 14 },
  sendButton: { border: "none", background: "#2563EB", color: "#FFFFFF", fontWeight: 600, padding: "0 20px", borderRadius: 6, cursor: "pointer" },
};