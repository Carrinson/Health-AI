import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Landing() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthAI Demo</Text>
      <Text style={styles.subtitle}>
        AI-assisted symptom triage — a student project.
      </Text>
      <Text style={styles.disclaimer}>
        For educational and demonstration purposes only. Not medical advice.
        Not for clinical use.
      </Text>
      <Pressable style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555" },
  disclaimer: { fontSize: 12, textAlign: "center", color: "#999", marginTop: 8 },
  button: { backgroundColor: "#2563eb", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, marginTop: 16 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});