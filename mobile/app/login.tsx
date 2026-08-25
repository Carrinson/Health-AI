import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // This shell does NOT call the real API yet — it's here to satisfy the
  // Play closed-testing requirement. It gets replaced with a real
  // login-against-the-backend call once this build is submitted and the
  // 14-day clock is running in the background.
  function handleSignIn() {
    router.push("/home");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb", paddingVertical: 14, borderRadius: 8,
    alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});