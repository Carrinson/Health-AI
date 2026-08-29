import { useState } from "react";
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Upload() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function pickImage(fromCamera: boolean) {
    setError("");
    setSuccess(false);

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      setError("Permission denied");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleUpload() {
    if (!image) return;
    setUploading(true);
    setError("");

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      // React Native's fetch/FormData needs this specific object shape for
      // a file field — not a real Blob, just something shaped like one.
      formData.append("file", {
        uri: image,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);

      await axios.post(`${API_URL}/uploads/document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setImage(null);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a document</Text>
      <Text style={styles.subtitle}>
        Photograph a lab report or prescription to add it to your records.
      </Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.muted}>No image selected</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => pickImage(true)}>
          <Text style={styles.secondaryButtonText}>Take photo</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => pickImage(false)}>
          <Text style={styles.secondaryButtonText}>Choose from library</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>Uploaded successfully.</Text> : null}

      {image && (
        <Pressable style={styles.primaryButton} onPress={handleUpload} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Upload</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#6B7280" },
  placeholder: { height: 220, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, justifyContent: "center", alignItems: "center", borderStyle: "dashed" },
  preview: { height: 220, borderRadius: 8, resizeMode: "cover" },
  muted: { color: "#6B7280" },
  buttonRow: { flexDirection: "row", gap: 12 },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 12, alignItems: "center" },
  secondaryButtonText: { fontSize: 14, fontWeight: "600" },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 6, padding: 14, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  error: { color: "#DC2626", fontSize: 14 },
  success: { color: "#16A34A", fontSize: 14 },
});