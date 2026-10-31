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
  ActivityIndicator,
  Modal,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlovoTheme } from "../theme";

interface AuthScreenProps {
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    settlement: "Kibera" | "Mathare";
  }) => Promise<{ success: boolean; error?: string }>;
  onLogin: (data: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function AuthScreen({ onRegister, onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(true); // Default to registration so new users can create account and pick interests
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [settlement, setSettlement] = useState<"Kibera" | "Mathare">("Kibera");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }
    if (!trimmedPassword) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    if (isSignUp) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        Alert.alert("Name Required", "Please enter your full name (e.g. Alvin Kariuki).");
        return;
      }

      setIsLoading(true);
      try {
        const res = await onRegister({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          settlement,
        });
        if (!res.success) {
          Alert.alert("Registration Error", res.error || "Could not complete registration.");
        }
      } catch (err: any) {
        Alert.alert("Network Error", "Unable to connect to server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await onLogin({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (!res.success) {
          Alert.alert("Login Failed", res.error || "Invalid email or password. Please verify your credentials or register.");
        }
      } catch (err: any) {
        Alert.alert("Network Error", "Unable to connect to server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
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
            <Text style={styles.formModeTitle}>
              {isSignUp ? "Create a Resident Account" : "Log In to Your Account"}
            </Text>
            <Text style={styles.formModeSubtitle}>
              {isSignUp
                ? "Register to personalize recommendations for health, education, and legal services."
                : "Welcome back! Enter your details to access your saved directory."}
            </Text>

            {isSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Wanjiku Kamau"
                    placeholderTextColor={GlovoTheme.colors.textMuted}
                    editable={!isLoading}
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                placeholder="e.g. resident@example.com"
                placeholderTextColor={GlovoTheme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
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
                editable={!isLoading}
              />
            </View>

            {/* Primary Submit Button (Glovo Yellow) */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && { opacity: 0.85 }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.buttonLoadingRow}>
                  <ActivityIndicator size="small" color={GlovoTheme.colors.textDark} style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Processing Details...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? "Register & Select Interests →" : "Log In to Directory"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode Link */}
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? "Already have an account? Log In"
                  : "New resident? Register to choose your interests"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full-Screen Branded Processing Overlay */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.loadingModalOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconCircle}>
              <ActivityIndicator size="large" color={GlovoTheme.colors.textDark} />
            </View>
            <Text style={styles.loadingTitle}>Processing Your Details</Text>
            <Text style={styles.loadingSubtitle}>
              {isSignUp
                ? "Registering your resident profile & syncing with Cloud Firestore..."
                : "Verifying your credentials and preparing your community directory..."}
            </Text>
            <View style={styles.loadingSecurityTag}>
              <Ionicons name="shield-checkmark" size={14} color={GlovoTheme.colors.secondary} />
              <Text style={styles.loadingSecurityText}>Cloud Firestore Secured</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: GlovoTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...GlovoTheme.shadows.glowYellow,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: GlovoTheme.colors.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    backgroundColor: GlovoTheme.colors.white,
    borderRadius: GlovoTheme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderLight,
    ...GlovoTheme.shadows.soft,
  },
  formModeTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    marginBottom: 4,
  },
  formModeSubtitle: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderLight,
    borderRadius: GlovoTheme.borderRadius.md,
    paddingHorizontal: 16,
    fontSize: 14,
    color: GlovoTheme.colors.textDark,
    backgroundColor: GlovoTheme.colors.white,
    fontWeight: "600",
  },
  settlementToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  settlementOption: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderLight,
    borderRadius: GlovoTheme.borderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GlovoTheme.colors.white,
  },
  selectedSettlementOption: {
    borderColor: GlovoTheme.colors.primary,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  settlementText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textSecondary,
  },
  selectedSettlementText: {
    color: GlovoTheme.colors.textDark,
  },
  submitButton: {
    height: 52,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 14,
    ...GlovoTheme.shadows.glowYellow,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.3,
  },
  buttonLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchModeButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    textDecorationLine: "underline",
  },
  // Modal Loading Processing Overlay
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingCard: {
    width: "100%",
    backgroundColor: GlovoTheme.colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    ...GlovoTheme.shadows.medium,
  },
  loadingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GlovoTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    ...GlovoTheme.shadows.glowYellow,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
  },
  loadingSecurityTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: GlovoTheme.colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  loadingSecurityText: {
    fontSize: 11,
    fontWeight: "800",
    color: GlovoTheme.colors.secondary,
  },
});
