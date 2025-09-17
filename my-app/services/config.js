// services/config.js
import { Platform } from "react-native";

// ⚠️ Change this to your machine's LAN IP
const LAN_IP = "192.168.0.9";

const API_BASE_URL =
  Platform.OS === "web"
    ? `http://127.0.0.1:8000/api`
    : `http://${LAN_IP}:8000/api`;

export default API_BASE_URL;
