import React, { useState } from "react";
import AppHeader from "@/components/common/AppHeader";
import AlreadyUser from "@/components/login/AlreadyUser";
import SocialLogins from "@/components/login/SocialLogins";
import ImageCarousel from "@/components/common/ImageCarousel";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/common/InputField";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

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
  const [panFile, setPanFile] = useState<string | null>(null);
  const [aadharFile, setAadharFile] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const pickFile = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
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

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const FileAttachButton = ({
    label,
    file,
    onPick,
    color = "#FAA403",
  }: {
    label: string;
    file: string | null;
    onPick: () => void;
    color?: string;
  }) => {
    const scaleAnim = new Animated.Value(1);
    const onPressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();
    };
    const onPressOut = () => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }).start();
    };
    return (
      <AnimatedTouchable
        style={[
          styles.attachBtn,
          { transform: [{ scale: scaleAnim }], backgroundColor: color, borderColor: color },
        ]}
        onPress={onPick}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.85}
      >
        <Ionicons name="attach-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
        <Text style={styles.attachText} numberOfLines={1} ellipsizeMode="tail">
          {file ? file.split("/").pop() : label}
        </Text>
      </AnimatedTouchable>
    );
  };

  const InputWithAttach = ({
    inputProps,
    attachProps,
  }: {
    inputProps: any;
    attachProps?: any;
  }) => (
    <View style={styles.inputWrapper}>
      <InputField {...inputProps} style={[styles.input, inputProps.style]} />
      {attachProps && (
        <View style={styles.attachWrapper}>
          <FileAttachButton {...attachProps} />
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      
      <AppHeader />
       <ImageCarousel />
     
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Delivery Partner Signup</Text>
        <Text style={styles.subtitle}>Fill your details to get started</Text>

        <View style={styles.form}>
          <InputWithAttach
            inputProps={{
              placeholder: "First Name",
              value: firstName,
              onChangeText: setFirstName,
              onFocus: () => setFocusedInput("firstName"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "firstName" ? styles.inputFocused : {},
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "Last Name",
              value: lastName,
              onChangeText: setLastName,
              onFocus: () => setFocusedInput("lastName"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "lastName" ? styles.inputFocused : {},
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "Email",
              keyboardType: "email-address",
              value: email,
              onChangeText: setEmail,
              onFocus: () => setFocusedInput("email"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "email" ? styles.inputFocused : {},
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "Mobile Number",
              keyboardType: "phone-pad",
              value: mobile,
              onChangeText: setMobile,
              onFocus: () => setFocusedInput("mobile"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "mobile" ? styles.inputFocused : {},
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "PAN Number",
              value: panNumber,
              onChangeText: setPanNumber,
              onFocus: () => setFocusedInput("panNumber"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "panNumber" ? styles.inputFocused : {},
            }}
            attachProps={{
              label: "Attach PAN",
              file: panFile,
              onPick: () => pickFile(setPanFile),
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "Aadhar Number",
              value: aadharNumber,
              onChangeText: setAadharNumber,
              onFocus: () => setFocusedInput("aadharNumber"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "aadharNumber" ? styles.inputFocused : {},
            }}
            attachProps={{
              label: "Attach Aadhar",
              file: aadharFile,
              onPick: () => pickFile(setAadharFile),
            }}
          />
          <InputWithAttach
            inputProps={{
              placeholder: "Location",
              value: location,
              onChangeText: setLocation,
              onFocus: () => setFocusedInput("location"),
              onBlur: () => setFocusedInput(null),
              style: focusedInput === "location" ? styles.inputFocused : {},
            }}
            attachProps={{
              label: "Attach Selfie",
              file: selfieFile,
              onPick: () => pickFile(setSelfieFile),
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.signupBtn}
          activeOpacity={0.85}
          onPress={handleSignup}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
        <AlreadyUser />
        <SocialLogins />
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: Math.min(width * 0.065, 24),
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 14),
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 10,
    textAlign: "center",
  },
  form: {
    gap: 4,
  },
  inputWrapper: {
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 1,
  },
  inputFocused: {
    borderColor: "#FAA403",
    shadowOpacity: 0.08,
  },
  attachWrapper: {
    marginTop: 4,
    alignItems: "flex-start",
  },
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#FAA403",
    justifyContent: "center",
    minWidth: 90,
  },
  attachText: {
    fontSize: 12,
    color: "#fff",
  },
  signupBtn: {
    width: "80%",
    alignSelf: "center",
    backgroundColor: "#FAA403",
    borderRadius: 28,
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  signupText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
