import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Same curated subset used on web — keep these two lists in sync manually
// for now; a shared constants package is a v2 refactor, not worth it today.
const COMMON_SYMPTOMS = [
  "chest_pain", "breathlessness", "sweating", "headache", "high_fever",
  "cough", "fatigue", "vomiting", "joint_pain", "nausea", "dizziness", "stomach_pain",
];

const API_URL = process.env.EXPO_PUBLIC_API_URL;; // update once deployed

const URGENCY_STYLE: Record<string, { bg: string; label: string }> = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Insufficient information" },
};

export default function SymptomChecker() {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(symptom: string) {
    setSelected((prev) => ({ ...prev, [symptom]: prev[symptom] ? 0 : 1 }));
  }

  async function handleSubmit() {
    const symptoms = Object.fromEntries(Object.entries(selected).filter(([, v]) => v === 1));
    if (Object.keys(symptoms).length === 0) {
      setError("Select at least one symptom");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/predict/triage`,
        { symptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const style = URGENCY_STYLE[result.urgency] || URGENCY_STYLE.insufficient_info;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {result.red_flags.length > 0 && (
          <View style={styles.redFlagPanel}>
            <Text style={styles.redFlagLabel}>Red flag detected</Text>
            {result.red_flags.map((f: any, i: number) => (
              <Text key={i} style={styles.redFlagText}>{f.message}</Text>
            ))}
          </View>
        )}

        <View style={[styles.badge, { backgroundColor: style.bg }]}>
          <Text style={styles.badgeText}>{style.label}</Text>
        </View>

        <Text style={styles.sectionLabel}>Possible conditions</Text>
        {result.predictions.map((p: any) => (
          <Text key={p.condition} style={styles.conditionRow}>
            {p.condition} — {(p.probability * 100).toFixed(1)}%
          </Text>
        ))}

        <Pressable style={styles.primaryButton} onPress={() => setResult(null)}>
          <Text style={styles.primaryButtonText}>Start over</Text>
        </Pressable>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>What are you experiencing?</Text>

      <View style={styles.chipRow}>
        {COMMON_SYMPTOMS.map((s) => (
          <Pressable
            key={s}
            onPress={() => toggle(s)}
            style={[styles.chip, selected[s] ? styles.chipOn : styles.chipOff]}
          >
            <Text style={selected[s] ? styles.chipTextOn : styles.chipTextOff}>
              {s.replaceAll("_", " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Check my symptoms</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, minHeight: 44, justifyContent: "center" },
  chipOn: { backgroundColor: "#111111", borderColor: "#111111" },
  chipOff: { backgroundColor: "#FFFFFF", borderColor: "#D1D5DB" },
  chipTextOn: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
  chipTextOff: { color: "#111111", fontSize: 14, fontWeight: "500" },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 6, paddingVertical: 15, alignItems: "center", marginTop: "auto" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  errorText: { color: "#DC2626", fontSize: 14 },
  redFlagPanel: { backgroundColor: "#FEF2F2", borderRadius: 8, padding: 20 },
  redFlagLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: "#991B1B", marginBottom: 6 },
  redFlagText: { fontSize: 15, fontWeight: "600", color: "#991B1B", lineHeight: 21 },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  sectionLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", marginTop: 8 },
  conditionRow: { fontSize: 15 },
  disclaimerBox: { backgroundColor: "#F5F1E8", borderRadius: 6, padding: 16 },
  disclaimerText: { fontSize: 13, lineHeight: 20, color: "#6B7280" },
});