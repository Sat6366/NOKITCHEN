import React, { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import AppHeader from "@/components/common/AppHeader";
import AlreadyUser from "@/components/login/AlreadyUser";
import SocialLogins from "@/components/login/SocialLogins";
import ImageCarousel from "@/components/common/ImageCarousel";
import Footer from "@/components/common/Footer";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const API_BASE = "http://192.168.0.10:8000/api";

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  panNumber: string;
  aadharNumber: string;
  location: string;
}

interface FileDataType {
  panFile: string | null;
  aadharFile: string | null;
  selfieFile: string | null;
}

// ✅ Memoized Input to prevent re-render
const Input = memo(
  ({
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
  }: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: any;
  }) => {
    return (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor="#9ca3af"
      />
    );
  }
);

// ✅ Memoized FileAttach Button
const FileAttach = memo(({ label, file, onPick }: any) => {
  return (
    <TouchableOpacity style={styles.attachBtn} onPress={onPick}>
      <Ionicons name="attach-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
      <Text style={styles.attachText}>{file ? file.split("/").pop() : label}</Text>
    </TouchableOpacity>
  );
});

export default function SignupForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    panNumber: "",
    aadharNumber: "",
    location: "",
  });

  const [files, setFiles] = useState<FileDataType>({
    panFile: null,
    aadharFile: null,
    selfieFile: null,
  });

  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Fetch stores
  useEffect(() => {
    axios
      .get(`${API_BASE}/store-locations/`)
      .then((res) => setStores(res.data))
      .catch((err) => console.error(err?.response?.data || err.message));
  }, []);

  // ✅ Use useCallback to prevent unnecessary re-renders
  const updateField = useCallback((key: keyof FormDataType, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const pickFile = useCallback(async (key: keyof FileDataType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setFiles((prev) => ({ ...prev, [key]: result.assets[0].uri }));
    }
  }, []);

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.mobile || !form.aadharNumber || !selectedStore) {
      Alert.alert("Error", "Please fill all required fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Alert.alert("Error", "Invalid email format");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      Alert.alert("Error", "Enter a valid 10-digit mobile");
      return false;
    }
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)) {
      Alert.alert("Error", "Invalid PAN format (ABCDE1234F)");
      return false;
    }
    if (!/^\d{12}$/.test(form.aadharNumber)) {
      Alert.alert("Error", "Aadhar must be 12 digits");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    const fd = new FormData();
    fd.append("first_name", form.firstName);
    fd.append("last_name", form.lastName);
    fd.append("email", form.email);
    fd.append("mobile", form.mobile);
    fd.append("pan_number", form.panNumber);
    fd.append("aadhar_number", form.aadharNumber);
    fd.append("location", form.location);
    fd.append("selected_store", selectedStore!);

    Object.entries(files).forEach(([key, uri]) => {
      if (uri) {
        fd.append(key, {
          uri,
          type: "image/jpeg",
          name: `${key}.jpg`,
        } as any);
      }
    });

    try {
      const res = await axios.post(`${API_BASE}/delivery-partners/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const code = res.data?.agent_code ? `\nAgent Code: ${res.data.agent_code}` : "";
      Alert.alert("Success", `Registered successfully!${code}`);
      router.replace("/login");
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      Alert.alert("Error", "Registration failed. Try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.card}>
          <ImageCarousel />
        </View>

        <Text style={styles.title}>Delivery Partner Signup</Text>
        <Text style={styles.subtitle}>Fill your details carefully</Text>

        <View style={styles.card}>
          <View style={styles.form}>
            <Input placeholder="First Name" value={form.firstName} onChangeText={(t) => updateField("firstName", t)} />
            <Input placeholder="Last Name" value={form.lastName} onChangeText={(t) => updateField("lastName", t)} />
            <Input placeholder="Email" value={form.email} onChangeText={(t) => updateField("email", t)} keyboardType="email-address" />
            <Input placeholder="Mobile Number" value={form.mobile} onChangeText={(t) => updateField("mobile", t)} keyboardType="phone-pad" />
            <Input placeholder="PAN Number" value={form.panNumber} onChangeText={(t) => updateField("panNumber", t)} />
            <FileAttach label="Attach PAN" file={files.panFile} onPick={() => pickFile("panFile")} />
            <Input placeholder="Aadhar Number" value={form.aadharNumber} onChangeText={(t) => updateField("aadharNumber", t)} keyboardType="numeric" />
            <FileAttach label="Attach Aadhar" file={files.aadharFile} onPick={() => pickFile("aadharFile")} />
            <Input placeholder="Location (optional)" value={form.location} onChangeText={(t) => updateField("location", t)} />
            <FileAttach label="Attach Selfie" file={files.selfieFile} onPick={() => pickFile("selfieFile")} />

            <Text style={styles.label}>Select Store Location</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedStore} onValueChange={(val) => setSelectedStore(val)} mode="dropdown" style={{ height: 44 }}>
                <Picker.Item label="-- Select Store --" value={null} />
                {stores.map((s) => (
                  <Picker.Item key={s.id} label={`${s.name}${s.city ? ` (${s.city})` : ""}`} value={String(s.id)} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleSignup} activeOpacity={0.9} style={styles.signupWrapper}>
          <LinearGradient colors={["#f97316", "#FAA403"]} style={styles.signupBtn}>
            <Text style={styles.signupText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <AlreadyUser />
        <SocialLogins />
       
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    padding: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", textAlign: "center", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 14, textAlign: "center" },
  form: { gap: 10 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, height: 44, fontSize: 14, color: "#111827", backgroundColor: "#fff" },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "600", color: "#374151" },
  attachBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 36, borderRadius: 20, backgroundColor: "#FAA403", marginTop: 6, alignSelf: "flex-start" },
  attachText: { fontSize: 13, color: "#fff", fontWeight: "500" },
  signupWrapper: { marginTop: 20, alignItems: "center" },
  signupBtn: { width: "80%", borderRadius: 28, paddingVertical: 14, alignItems: "center", justifyContent: "center", shadowColor: "#f97316", shadowOpacity: 0.25, shadowOffset: { width: 0, height: 5 }, shadowRadius: 8, elevation: 3 },
  signupText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  pickerWrapper: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, backgroundColor: "#fff" },
});
