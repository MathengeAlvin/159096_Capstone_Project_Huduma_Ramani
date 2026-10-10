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
        {/* Avatar matching Screenshot 142428 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color="#475467" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.settlementTag}>
            <Ionicons name="location-outline" size={12} color="#000000" />
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

        {/* Action Buttons matching wireframe */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onEditInterests}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onLogout}
            activeOpacity={0.8}
          >
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
    backgroundColor: "#FFFFFF",
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
    borderWidth: 1.5,
    borderColor: "#000000",
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    color: "#667085",
    marginTop: 4,
    fontFamily: "monospace",
  },
  settlementTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 12,
    gap: 4,
    backgroundColor: "#FFFFFF",
  },
  settlementTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E7EC",
    marginVertical: 20,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  interestPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  noInterestsText: {
    fontSize: 12,
    color: "#667085",
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  outlineButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.3,
  },
});
