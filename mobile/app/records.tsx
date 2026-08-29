 import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CACHE_KEY = "cached_records";

const URGENCY_STYLE: Record<string, { bg: string; label: string }> = {
  emergency: { bg: "#DC2626", label: "Emergency" },
  see_a_doctor: { bg: "#D97706", label: "See a doctor" },
  insufficient_info: { bg: "#6B7280", label: "Needs info" },
};

export default function Records() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    async function load() {
      const net = await NetInfo.fetch();

      if (!net.isConnected) {
        // No connection at all — skip the network call entirely and go
        // straight to whatever was last cached.
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setRecords(JSON.parse(cached));
          setIsOffline(true);
        } else {
          setError("No internet connection and no cached records available.");
        }
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API_URL}/records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data);
        // Cache the fresh data for the next time there's no connection.
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
      } catch {
        // Network claims to be connected but the request still failed
        // (e.g. server briefly down) — fall back to cache here too.
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setRecords(JSON.parse(cached));
          setIsOffline(true);
        } else {
          setError("Failed to load records");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={records}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Records</Text>
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>
                You're offline — showing your last saved records.
              </Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => {
        let content: any = {};
        try {
          content = JSON.parse(item.content);
        } catch {}
        const style = content.urgency ? URGENCY_STYLE[content.urgency] : null;

        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {style && (
                <View style={[styles.badge, { backgroundColor: style.bg }]}>
                  <Text style={styles.badgeText}>{style.label}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.mono}>{item.record_type}</Text>
              <Text style={styles.mono}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 36, fontWeight: "700", letterSpacing: -0.5, marginBottom: 16 },
  offlineBanner: { backgroundColor: "#F5F1E8", borderRadius: 6, padding: 12, marginBottom: 16 },
  offlineText: { fontSize: 13, color: "#6B7280" },
  card: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16, gap: 10, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  badge: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 10 },
  mono: { fontFamily: "monospace", fontSize: 12, color: "#6B7280" },
  error: { color: "#DC2626", padding: 24 },
});