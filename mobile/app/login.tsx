import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;; // match checker.tsx — same laptop IP

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      if (isRegister) {
        await axios.post(`${API_URL}/auth/register`, { email, password, fullname });
      }

      // OAuth2PasswordRequestForm expects form-encoded data, not JSON —
      // same requirement you already hit on web.
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await axios.post(`${API_URL}/auth/login`, form.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await AsyncStorage.setItem("token", res.data.access_token);
      router.push("/home");
    } catch {
      setError(isRegister ? "Registration failed — email may already be in use" : "Incorrect email or password");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthAI</Text>
      <Text style={styles.subtitle}>Check your symptoms, keep your records, book care.</Text>

      <View style={styles.tabRow}>
        <Pressable onPress={() => setIsRegister(false)}>
          <Text style={!isRegister ? styles.tabActive : styles.tabInactive}>Sign in</Text>
        </Pressable>
        <Pressable onPress={() => setIsRegister(true)}>
          <Text style={isRegister ? styles.tabActive : styles.tabInactive}>Register</Text>
        </Pressable>
      </View>

      {isRegister && (
        <TextInput
          placeholder="Full name" value={fullname} onChangeText={setFullname}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" style={styles.input}
      />
      <TextInput
        placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? "Create account" : "Sign in"}</Text>
      </Pressable>

      <Text style={styles.footnote}>Patients only. Clinical staff use the web console.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 36, fontWeight: "700", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: "#6B7280", marginBottom: 20 },
  tabRow: { flexDirection: "row", gap: 24, marginBottom: 16, borderBottomWidth: 1, borderColor: "#E5E7EB" },
  tabActive: { fontSize: 14, fontWeight: "600", paddingBottom: 10, borderBottomWidth: 2, borderColor: "#111111" },
  tabInactive: { fontSize: 14, fontWeight: "500", color: "#6B7280", paddingBottom: 10 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 12, fontSize: 16 },
  button: { backgroundColor: "#2563EB", borderRadius: 6, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  error: { color: "#DC2626", fontSize: 14 },
  footnote: { fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 16 },
});