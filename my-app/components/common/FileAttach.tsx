import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FileAttachProps {
  label: string;
  file: string | null;
  onPick: () => void;
}

const FileAttach = ({ label, file, onPick }: FileAttachProps) => {
  return (
    <TouchableOpacity style={styles.attachBtn} onPress={onPick}>
      <Ionicons name="attach-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
      <Text style={styles.attachText}>{file ? file.split("/").pop() : label}</Text>
    </TouchableOpacity>
  );
};

export default memo(FileAttach);

const styles = StyleSheet.create({
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#FAA403",
    marginTop: 6,
    alignSelf: "flex-start",
  },
  attachText: { fontSize: 13, color: "#fff", fontWeight: "500" },
});
