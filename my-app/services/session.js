// services/session.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function saveAuth(token, user) {
  try {
    if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch (e) {
    console.error("saveAuth error:", e);
    return false;
  }
}
export async function getToken() {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export async function getUser() {
  try {
    const v = await AsyncStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
export async function logout() {
  try { await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]); return true; } catch { return false; }
}
export async function isLoggedIn() {
  const t = await getToken(); return !!t;
}
