import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "authData"; // stored JSON from verify-otp response

type PartnerShape = {
  id?: number;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  agent_code?: string;
  selfie?: string | null; // serializer uses 'selfie'
};

type User = {
  id?: number;
  name?: string;
  mobile?: string;
  agent_code?: string;
  profile_image?: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (authResponse: any) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // load persisted auth on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const partner: PartnerShape = parsed.partner || parsed.partner || {};
        const u: User = {
          id: partner.id,
          name: `${partner.first_name || ""} ${partner.last_name || ""}`.trim() || parsed.user?.username || null,
          mobile: partner.mobile,
          agent_code: partner.agent_code,
          profile_image: partner.selfie || null,
        };
        setUser(u);
        setAccessToken(parsed.access || null);
      } catch (e) {
        console.log("AuthProvider: failed to load authData", e);
      }
    })();
  }, []);

  const login = async (authResponse: any) => {
    // authResponse should be the JSON returned by verify-otp (success, access, refresh, partner)
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authResponse));
    } catch (err) {
      console.warn("AuthProvider: failed to persist authResponse", err);
    }

    const partner: PartnerShape = authResponse.partner || authResponse.partner || {};
    const u: User = {
      id: partner.id,
      name: `${partner.first_name || ""} ${partner.last_name || ""}`.trim() || authResponse.user?.username || null,
      mobile: partner.mobile,
      agent_code: partner.agent_code,
      profile_image: partner.selfie || null,
    };

    setUser(u);
    setAccessToken(authResponse.access || null);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (err) {
      console.warn("AuthProvider logout remove error", err);
    }
    setUser(null);
    setAccessToken(null);
  };

  const getAccessToken = async () => {
    if (accessToken) return accessToken;
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.access || null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
