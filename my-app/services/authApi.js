// services/authApi.js
import API_BASE_URL from "./config";

export async function sendOtp(mobile) {
  try {
    const res = await fetch(`${API_BASE_URL}/send-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    return await res.json();
  } catch (e) {
    console.error("sendOtp error:", e);
    return { success: false, message: "Network error" };
  }
}

export async function verifyOtp({ mobile, otp, sessionId }) {
  try {
    const res = await fetch(`${API_BASE_URL}/verify-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp, session_id: sessionId }),
    });
    return await res.json();
  } catch (e) {
    console.error("verifyOtp error:", e);
    return { success: false, message: "Network error" };
  }
}
