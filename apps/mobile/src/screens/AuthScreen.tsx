import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResidentUser } from "../types";
import { INITIAL_USER } from "../data/mockServices";
import { GlovoTheme } from "../theme";

interface AuthScreenProps {
  onAuthSuccess: (user: ResidentUser, isNewUser: boolean) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("Wanjiku Kamau");
  const [email, setEmail] = useState("wanjiku@kibera.org");
  const [password, setPassword] = useState("password123");
  const [settlement, setSettlement] = useState<"Kibera" | "Mathare">("Kibera");

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) return;

    const user: ResidentUser = {
      id: isSignUp ? `res-${Date.now().toString().slice(-4)}` : INITIAL_USER.id,
      name: isSignUp ? name : INITIAL_USER.name,
      email: email.trim(),
      settlement,
      interests: isSignUp ? [] : INITIAL_USER.interests,
    };

    onAuthSuccess(user, isSignUp);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Glovo Yellow Brand Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="map" size={32} color={GlovoTheme.colors.textDark} />
            </View>
            <Text style={styles.brandTitle}>Huduma Ramani</Text>
            <Text style={styles.brandSubtitle}>Informal Settlement Community Directory</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {isSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={GlovoTheme.colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>YOUR SETTLEMENT</Text>
                  <View style={styles.settlementToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.settlementOption,
                        settlement === "Kibera" && styles.selectedSettlementOption,
                      ]}
                      onPress={() => setSettlement("Kibera")}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.settlementText,
                          settlement === "Kibera" && styles.selectedSettlementText,
                        ]}
                      >
                        📍 Kibera
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.settlementOption,
                        settlement === "Mathare" && styles.selectedSettlementOption,
                      ]}
                      onPress={() => setSettlement("Mathare")}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.settlementText,
                          settlement === "Mathare" && styles.selectedSettlementText,
                        ]}
                      >
                        📍 Mathare
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={GlovoTheme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={GlovoTheme.colors.textMuted}
                secureTextEntry
              />
            </View>

            {/* Primary Submit Button (Glovo Yellow) */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Create Resident Account" : "Log In to Directory"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Mode Link */}
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? "Already have an account? Log In"
                  : "New resident? Create an Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...GlovoTheme.shadows.glowYellow,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    borderRadius: GlovoTheme.borderRadius.md,
    paddingHorizontal: 16,
    fontSize: 14,
    color: GlovoTheme.colors.textDark,
    backgroundColor: GlovoTheme.colors.background,
    fontWeight: "600",
  },
  settlementToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  settlementOption: {
    flex: 1,
    height: 44,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GlovoTheme.colors.background,
  },
  selectedSettlementOption: {
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderColor: GlovoTheme.colors.primary,
  },
  settlementText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  selectedSettlementText: {
    color: GlovoTheme.colors.textDark,
  },
  submitButton: {
    height: 52,
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderRadius: GlovoTheme.borderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    ...GlovoTheme.shadows.glowYellow,
  },
  submitButtonText: {
    color: GlovoTheme.colors.textDark,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78350F", // Warm amber brown
  },
});
