import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Appointments() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function authHeader() {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }

  async function loadData() {
    try {
      const headers = await authHeader();
      const [docRes, apptRes] = await Promise.all([
        axios.get(`${API_URL}/appointments/doctors`, { headers }),
        axios.get(`${API_URL}/appointments`, { headers }),
      ]);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
    } catch {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

 async function loadSlots(doctorId: number) {
  setSlots([]);
  setSelectedSlot(null);
  try {
    const headers = await authHeader();
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.get(`${API_URL}/availability/${doctorId}/slots?date=${today}`, { headers });
    setSlots(res.data); // show everything, available and booked alike
  } catch {
    setSlots([]);
  }
}

  function selectDoctor(doctorId: number) {
    setSelectedDoctor(doctorId);
    loadSlots(doctorId);
  }

  async function handleBook() {
    if (!selectedDoctor || !selectedSlot || !reason.trim()) {
      setError("Select a doctor, a time, and describe your reason for visiting");
      return;
    }
    setError("");
    setBooking(true);
    try {
      const headers = await authHeader();
      await axios.post(
        `${API_URL}/appointments`,
        { doctor_id: selectedDoctor, scheduled_for: selectedSlot, reason },
        { headers }
      );
      setSuccess(true);
      setReason("");
      setSelectedDoctor(null);
      setSelectedSlot(null);
      setSlots([]);
      loadData();
    } catch {
      setError("Booking failed — that slot may have just been taken");
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book care</Text>

      <Text style={styles.sectionLabel}>Clinician</Text>
      {doctors.map((d) => (
        <Pressable
          key={d.id}
          onPress={() => selectDoctor(d.id)}
          style={[styles.doctorRow, selectedDoctor === d.id && styles.doctorRowSelected]}
        >
          <Text style={selectedDoctor === d.id ? styles.doctorNameSelected : styles.doctorName}>
            {d.fullname}
          </Text>
        </Pressable>
      ))}
      {doctors.length === 0 && <Text style={styles.muted}>No clinicians available yet.</Text>}

      {selectedDoctor && (
        <>
          <Text style={styles.sectionLabel}>Available times today</Text>
          {slots.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {slots.map((s) => (
                <Pressable
                  key={s.start}
                  disabled={!s.available}
                  onPress={() => setSelectedSlot(s.start)}
                  style={[
                    styles.slotChip,
                    selectedSlot === s.start && styles.slotChipSelected,
                    !s.available && styles.slotChipDisabled,
                  ]}
                >
                  <Text
                    style={
                      !s.available
                        ? styles.slotTextDisabled
                        : selectedSlot === s.start
                        ? styles.slotTextSelected
                        : styles.slotText
                    }
                  >
                    {new Date(s.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {slots.length === 0 && (
            <Text style={styles.muted}>No availability set for this doctor today.</Text>
          )}
        </>
      )}

      <Text style={styles.sectionLabel}>Reason for visit</Text>
      <TextInput
        placeholder="e.g. persistent cough for a week"
        value={reason}
        onChangeText={setReason}
        multiline
        style={styles.textInput}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>Appointment requested.</Text> : null}

      <Pressable style={styles.primaryButton} onPress={handleBook} disabled={booking}>
        <Text style={styles.primaryButtonText}>{booking ? "Booking..." : "Request appointment"}</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Your appointments</Text>
      {appointments.map((a) => (
        <View key={a.id} style={styles.apptCard}>
          <Text style={styles.apptDoctor}>{a.reason}</Text>
          <Text style={styles.muted}>{new Date(a.scheduled_for).toLocaleString()} · {a.status}</Text>
        </View>
      ))}
      {appointments.length === 0 && <Text style={styles.muted}>No appointments yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 36, fontWeight: "700", letterSpacing: -0.5 },
  sectionLabel: { fontSize: 12, fontWeight: "500", letterSpacing: 1, textTransform: "uppercase", color: "#6B7280", marginTop: 16 },
  doctorRow: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
  doctorRowSelected: { borderColor: "#111111", backgroundColor: "#FAFAFA" },
  doctorName: { fontSize: 15, fontWeight: "600" },
  doctorNameSelected: { fontSize: 15, fontWeight: "700" },
  slotChip: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  slotChipSelected: { backgroundColor: "#111111", borderColor: "#111111" },
  slotText: { fontSize: 13, fontWeight: "600", color: "#111111" },
  slotTextSelected: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  muted: { fontSize: 14, color: "#6B7280" },
  textInput: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: "top" },
  error: { color: "#DC2626", fontSize: 14 },
  success: { color: "#16A34A", fontSize: 14 },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 6, padding: 15, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  apptCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 8, padding: 16 },
  apptDoctor: { fontSize: 15, fontWeight: "600" },
  slotChipDisabled: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  slotTextDisabled: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
});