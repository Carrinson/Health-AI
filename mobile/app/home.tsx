import { View, Text, StyleSheet, ScrollView } from "react-native";

const FEATURES = [
  { name: "Symptom Checker", desc: "AI-assisted symptom triage" },
  { name: "AI Chatbot", desc: "Ask general health questions" },
  { name: "Medical Records", desc: "View your health history" },
  { name: "Appointments", desc: "Book with a doctor" },
];

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.disclaimer}>
        For educational and demonstration purposes only. Not medical advice.
        Not for clinical use.
      </Text>

      {FEATURES.map((f) => (
        <View key={f.name} style={styles.card}>
          <Text style={styles.cardTitle}>{f.name}</Text>
          <Text style={styles.cardDesc}>{f.desc}</Text>
          <Text style={styles.badge}>Coming soon</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  disclaimer: { fontSize: 12, color: "#999", marginBottom: 8 },
  card: {
    borderWidth: 1, borderColor: "#eee", borderRadius: 10,
    padding: 16, backgroundColor: "#fafafa",
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardDesc: { fontSize: 14, color: "#666", marginTop: 4 },
  badge: {
    marginTop: 8, alignSelf: "flex-start", fontSize: 11,
    color: "#888", backgroundColor: "#eee",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
});