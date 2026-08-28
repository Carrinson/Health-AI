import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const WS_URL = API_URL.replace("https://", "wss://").replace("http://", "ws://");

export default function Chat() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const ws = useRef<WebSocket | null>(null);

  async function authHeader() {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    async function init() {
      const headers = await authHeader();
      const meRes = await axios.get(`${API_URL}/auth/me`, { headers });
      setUserId(meRes.data.id);

      const contactsRes = await axios.get(`${API_URL}/chat/contacts`, { headers });
      setContacts(contactsRes.data);
    }
    init();
  }, []);

  async function openChat(contact: any) {
    setActiveContact(contact);
    const headers = await authHeader();
    const res = await axios.get(`${API_URL}/chat/history/${contact.id}`, { headers });
    setMessages(res.data);

    const token = await AsyncStorage.getItem("token");
    ws.current?.close();
    ws.current = new WebSocket(`${WS_URL}/ws/chat?token=${token}`);
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

  if (!activeContact) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>
        {contacts.length === 0 && (
          <Text style={styles.muted}>
            You can message a doctor once you have an appointment with them.
          </Text>
        )}
        {contacts.map((c) => (
          <Pressable key={c.id} style={styles.contactRow} onPress={() => openChat(c)}>
            <Text style={styles.contactName}>{c.fullname}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setActiveContact(null)}>
        <Text style={styles.backLink}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>{activeContact.fullname}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender_id === userId ? styles.bubbleSent : styles.bubbleReceived,
            ]}
          >
            <Text style={item.sender_id === userId ? styles.bubbleTextSent : styles.bubbleText}>
              {item.content}
            </Text>
          </View>
        )}
        style={{ flex: 1 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message"
          style={styles.input}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  muted: { color: "#6B7280", fontSize: 14 },
  contactRow: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
  contactName: { fontSize: 15, fontWeight: "600" },
  backLink: { color: "#2563EB", fontSize: 14 },
  bubble: { borderRadius: 12, padding: 12, marginVertical: 4, maxWidth: "80%" },
  bubbleSent: { backgroundColor: "#2563EB", alignSelf: "flex-end" },
  bubbleReceived: { backgroundColor: "#F3F4F6", alignSelf: "flex-start" },
  bubbleText: { color: "#111111" },
  bubbleTextSent: { color: "#FFFFFF" },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 12 },
  sendButton: { backgroundColor: "#2563EB", borderRadius: 6, paddingHorizontal: 16, justifyContent: "center" },
  sendButtonText: { color: "#FFFFFF", fontWeight: "600" },
});