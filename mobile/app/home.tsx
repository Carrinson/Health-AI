import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();
  const firstName = "there"; // wire to real user data once auth is connected

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.eyebrow}>Good morning</Text>
        <Text style={styles.title}>{firstName}</Text>
      </View>

      <Pressable
        onPress={() => router.push("/checker")}
        style={({ pressed }) => [styles.heroCard, pressed && styles.heroCardPressed]}
      >
        <Text style={styles.heroEyebrow}>Start here</Text>
        <Text style={styles.heroTitle}>Symptom checker</Text>
        <Text style={styles.heroSubtitle}>
          Answer a few questions to get an urgency level.
        </Text>
      </Pressable>

      <Pressable style={styles.shortcutCard} onPress={() => router.push("/chat")}>
        <Text style={styles.shortcutText}>Messages</Text>
      </Pressable>


      <View style={styles.shortcuts}>
        <Text style={styles.sectionLabel}>Shortcuts</Text>
        <View style={styles.grid}>
          <Pressable style={styles.shortcutCard} onPress={() => router.push("/records")}>
            <Text style={styles.shortcutText}>Medical records</Text>
          </Pressable>
          <Pressable style={styles.shortcutCard} onPress={() => router.push("/appointments")}>
            <Text style={styles.shortcutText}>Book an appointment</Text>
          </Pressable>
          <Pressable style={styles.shortcutCard} onPress={() => router.push("/upload")}>
            <Text style={styles.shortcutText}>Upload a document</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          HealthAI provides guidance only, not a diagnosis. Always consult a
          qualified clinician.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 24 },
  eyebrow: { fontSize: 12, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#6B7280" },
  title: { fontSize: 36, fontWeight: "700", letterSpacing: -0.5, marginTop: 4 },
  heroCard: { backgroundColor: "#111111", borderRadius: 8, padding: 20, gap: 8 },
  heroCardPressed: { backgroundColor: "#1F2937" },
  heroEyebrow: { fontSize: 12, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#9CA3AF" },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: "#D1D5DB", lineHeight: 20 },
  shortcuts: { gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#6B7280" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  shortcutCard: {
    flexBasis: "47%", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8,
    padding: 16, minHeight: 72, backgroundColor: "#FFFFFF",
  },
  shortcutText: { fontSize: 15, fontWeight: "600" },
  disclaimerBox: { backgroundColor: "#F5F1E8", borderRadius: 6, padding: 16, marginTop: "auto" },
  disclaimerText: { fontSize: 13, lineHeight: 20, color: "#6B7280" },
});