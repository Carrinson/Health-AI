import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Assistant() {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", text: "Ask me a general health question. I'm not a substitute for the Symptom Checker or a doctor." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const question = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/assistant/ask`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.answer,
          escalated: res.data.escalated,
          sources: res.data.sources,
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
              item.escalated && styles.bubbleEscalated,
            ]}
          >
            {item.escalated && <Text style={styles.escalatedLabel}>URGENT — a doctor has been notified</Text>}
            <Text style={item.role === "user" ? styles.textUser : styles.textAssistant}>{item.text}</Text>
            {item.sources && (
              <Text style={styles.sourcesText}>Based on: {item.sources.join(", ")}</Text>
            )}
          </View>
        )}
      />

      {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask a health question..."
          style={styles.input}
        />
        <Pressable style={styles.sendButton} onPress={send}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  bubble: { borderRadius: 12, padding: 12, marginVertical: 4, maxWidth: "85%" },
  bubbleUser: { backgroundColor: "#2563EB", alignSelf: "flex-end" },
  bubbleAssistant: { backgroundColor: "#F3F4F6", alignSelf: "flex-start" },
  bubbleEscalated: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#DC2626" },
  escalatedLabel: { fontSize: 11, fontWeight: "700", color: "#991B1B", marginBottom: 4, textTransform: "uppercase" },
  textUser: { color: "#FFFFFF" },
  textAssistant: { color: "#111111" },
  sourcesText: { fontSize: 11, color: "#6B7280", marginTop: 6 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 12 },
  sendButton: { backgroundColor: "#2563EB", borderRadius: 6, paddingHorizontal: 16, justifyContent: "center" },
  sendButtonText: { color: "#FFFFFF", fontWeight: "600" },
});