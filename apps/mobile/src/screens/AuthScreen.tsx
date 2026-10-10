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
import { ResidentUser } from "../types";
import { INITIAL_USER } from "../data/mockServices";

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
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>Huduma Ramani</Text>
            <Text style={styles.brandSubtitle}>Community Service Directory</Text>
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
                    placeholderTextColor="#98A2B3"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>INFORMAL SETTLEMENT</Text>
                  <View style={styles.settlementToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.settlementOption,
                        settlement === "Kibera" && styles.selectedSettlementOption,
                      ]}
                      onPress={() => setSettlement("Kibera")}
                    >
                      <Text
                        style={[
                          styles.settlementText,
                          settlement === "Kibera" && styles.selectedSettlementText,
                        ]}
                      >
                        Kibera
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.settlementOption,
                        settlement === "Mathare" && styles.selectedSettlementOption,
                      ]}
                      onPress={() => setSettlement("Mathare")}
                    >
                      <Text
                        style={[
                          styles.settlementText,
                          settlement === "Mathare" && styles.selectedSettlementText,
                        ]}
                      >
                        Mathare
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
                placeholderTextColor="#98A2B3"
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
                placeholderTextColor="#98A2B3"
                secureTextEntry
              />
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Sign Up" : "Log In"}
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
                  : "Don't have an account? Sign Up"}
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
    backgroundColor: "#FFFFFF",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 44,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#667085",
    marginTop: 6,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  settlementToggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  settlementOption: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSettlementOption: {
    backgroundColor: "#000000",
  },
  settlementText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  selectedSettlementText: {
    color: "#FFFFFF",
  },
  submitButton: {
    height: 50,
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 2,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    textDecorationLine: "underline",
  },
});
