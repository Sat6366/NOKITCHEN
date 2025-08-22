import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/common/InputField";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function SignupForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [location, setLocation] = useState("");
  const [panCardImage, setPanCardImage] = useState<string | null>(null);
  const [aadharFile, setAadharFile] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const pickImage = async (setter: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const handleSignup = () => {
    if (!firstName || !lastName || !email || !mobile || !aadharNumber) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    Alert.alert("Success", "Delivery Partner registered!");
    router.replace("/home");
  };

  return (
    <ScrollView className="flex-1 bg-white px-6">
      <Text style={styles.title}>Delivery Partner Signup</Text>
      <Text style={styles.subtitle}>Fill your details to get started</Text>

      {/* Inputs */}
      <InputField placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <InputField placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <InputField placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <InputField placeholder="Mobile Number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />

      {/* PAN */}
      <InputField placeholder="PAN Number" value={panNumber} onChangeText={setPanNumber} />
      <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setPanCardImage)}>
        <Text style={styles.uploadText}>
          {panCardImage ? "✅ PAN Card Selected" : "Upload PAN Card"}
        </Text>
      </TouchableOpacity>

      {/* Aadhar */}
      <InputField placeholder="Aadhar Number" value={aadharNumber} onChangeText={setAadharNumber} />
      <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setAadharFile)}>
        <Text style={styles.uploadText}>
          {aadharFile ? "✅ Aadhar File Selected" : "Upload Aadhar"}
        </Text>
      </TouchableOpacity>

      {/* Location + Selfie */}
      <InputField placeholder="Location" value={location} onChangeText={setLocation} />
      <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setSelfie)}>
        <Text style={styles.uploadText}>
          {selfie ? "✅ Selfie Selected" : "Upload Selfie"}
        </Text>
      </TouchableOpacity>

      {/* Signup Button */}
      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: Math.min(width * 0.06, 22),
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 15),
    color: "#6b7280",
    marginTop: 4,   // ✅ tighter spacing
    textAlign: "center",
  },
  uploadBtn: {
    width: width * 0.8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 10,       // ✅ smaller height
    paddingHorizontal: 14,
    marginTop: 10,             // ✅ less space between fields
    backgroundColor: "#f9fafb",
  },
  uploadText: {
    fontSize: Math.min(width * 0.042, 15),
    color: "#374151",
  },
  signupBtn: {
    width: width * 0.75,
    alignSelf: "center",
    backgroundColor: "#faa403",
    borderRadius: 28,
    marginTop: 18,             // ✅ slightly less margin
    paddingVertical: Math.min(width * 0.038, 12),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  signupText: {
    fontSize: Math.min(width * 0.045, 16),
    fontWeight: "600",
    color: "#fff",
  },
});
