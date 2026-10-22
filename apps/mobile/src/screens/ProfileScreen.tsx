import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResidentUser } from "../types";
import { GlovoTheme } from "../theme";

interface ProfileScreenProps {
  user: ResidentUser;
  onEditInterests: () => void;
  onLogout: () => void;
}

export function ProfileScreen({
  user,
  onEditInterests,
  onLogout,
}: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar matching Glovo style */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={GlovoTheme.colors.textDark} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.settlementTag}>
            <Ionicons name="location-sharp" size={13} color={GlovoTheme.colors.textDark} />
            <Text style={styles.settlementTagText}>{user.settlement} Resident</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Interests Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>YOUR INTERESTS</Text>
          <View style={styles.interestsWrap}>
            {user.interests.length > 0 ? (
              user.interests.map((interest, idx) => (
                <View key={idx} style={styles.interestPill}>
                  <Text style={styles.interestPillText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noInterestsText}>
                No interests selected. Tap &apos;Edit Profile&apos; below to personalize.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Action Buttons matching Glovo UI */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onEditInterests}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={18} color={GlovoTheme.colors.textDark} />
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={GlovoTheme.colors.danger} />
            <Text style={styles.outlineButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: GlovoTheme.colors.primary,
    backgroundColor: GlovoTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...GlovoTheme.shadows.soft,
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 4,
    fontFamily: "monospace",
  },
  settlementTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    borderRadius: GlovoTheme.borderRadius.pill,
    gap: 4,
    backgroundColor: GlovoTheme.colors.primarySoft,
  },
  settlementTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: GlovoTheme.colors.borderLight,
    marginVertical: 20,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  interestPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  noInterestsText: {
    fontSize: 13,
    color: GlovoTheme.colors.textMuted,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    height: 50,
    borderRadius: GlovoTheme.borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GlovoTheme.colors.primary,
    gap: 8,
    ...GlovoTheme.shadows.glowYellow,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.3,
  },
  outlineButton: {
    height: 50,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderLight,
    borderRadius: GlovoTheme.borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GlovoTheme.colors.white,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: GlovoTheme.colors.danger,
    letterSpacing: 0.3,
  },
});
