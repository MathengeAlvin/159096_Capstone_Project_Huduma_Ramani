import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ResidentUser, MobileApplication, ApplicationStatus } from "../types";
import { GlovoTheme } from "../theme";

interface ProfileScreenProps {
  user: ResidentUser;
  applications?: MobileApplication[];
  onRefreshApplications?: () => void;
  onSelectServiceById?: (serviceId: string) => void;
  onEditInterests: () => void;
  onLogout: () => void;
}

export function ProfileScreen({
  user,
  applications = [],
  onRefreshApplications,
  onSelectServiceById,
  onEditInterests,
  onLogout,
}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) : 0, 24);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "APPROVED ✓",
          bgColor: "#E6F6F3",
          borderColor: "#A3E2D5",
          textColor: "#00A082",
          icon: "checkmark-circle" as const,
        };
      case "REJECTED":
        return {
          label: "DECLINED",
          bgColor: "#FFF1F2",
          borderColor: "#FECDD3",
          textColor: "#E11D48",
          icon: "close-circle" as const,
        };
      case "COMPLETED":
        return {
          label: "COMPLETED",
          bgColor: "#F3F4F6",
          borderColor: "#E5E7EB",
          textColor: "#4B5563",
          icon: "ribbon" as const,
        };
      case "PENDING":
      default:
        return {
          label: "PENDING REVIEW",
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          textColor: "#B45309",
          icon: "time" as const,
        };
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topInset + 8 }]}>
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

        {/* Applications / Intake Status Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>MY SERVICE APPLICATIONS</Text>
              <Text style={styles.sectionSubtitle}>
                Live intake status from community providers
              </Text>
            </View>
            {onRefreshApplications && (
              <TouchableOpacity
                onPress={onRefreshApplications}
                style={styles.refreshIconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="reload" size={16} color={GlovoTheme.colors.textDark} />
              </TouchableOpacity>
            )}
          </View>

          {applications.length > 0 ? (
            <View style={styles.applicationsList}>
              {applications.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                  <View key={app.id} style={styles.appCard}>
                    <View style={styles.appCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appServiceTitle} numberOfLines={1}>
                          {app.serviceTitle}
                        </Text>
                        <Text style={styles.appProviderName} numberOfLines={1}>
                          {app.providerName}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.appStatusPill,
                          {
                            backgroundColor: badge.bgColor,
                            borderColor: badge.borderColor,
                          },
                        ]}
                      >
                        <Ionicons name={badge.icon} size={12} color={badge.textColor} />
                        <Text
                          style={[
                            styles.appStatusText,
                            { color: badge.textColor },
                          ]}
                        >
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    {/* Status description box */}
                    {app.status === "APPROVED" && (
                      <View style={styles.approvedNoticeBox}>
                        <Ionicons name="checkmark-circle-outline" size={15} color="#00A082" />
                        <Text style={styles.approvedNoticeText}>
                          Accepted! You may visit this facility or expect their contact.
                        </Text>
                      </View>
                    )}
                    {app.status === "REJECTED" && (
                      <View style={styles.rejectedNoticeBox}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                            <Ionicons name="alert-circle-outline" size={15} color="#E11D48" />
                            <Text style={styles.rejectedNoticeText}>
                              Application was not approved.
                            </Text>
                          </View>
                          <Text style={styles.reapplyNoticeSub}>
                            You are eligible to reapply with updated details.
                          </Text>
                        </View>
                        {onSelectServiceById && (
                          <TouchableOpacity
                            style={styles.reapplyProfileBtn}
                            onPress={() => onSelectServiceById(app.serviceId)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="refresh" size={12} color="#78350F" />
                            <Text style={styles.reapplyProfileBtnText}>Reapply</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <View style={styles.appCardFooter}>
                      <Text style={styles.appDateText}>Applied: {app.date}</Text>
                      {app.notes ? (
                        <Text style={styles.appNotesText} numberOfLines={1}>
                          Note: {app.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyAppsBox}>
              <Ionicons name="clipboard-outline" size={28} color={GlovoTheme.colors.textMuted} />
              <Text style={styles.emptyAppsTitle}>No Applications Yet</Text>
              <Text style={styles.emptyAppsSub}>
                Browse directory facilities and tap &quot;Apply for Service&quot; to request assistance from providers.
              </Text>
            </View>
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: GlovoTheme.colors.primary,
    backgroundColor: GlovoTheme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
    marginVertical: 18,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: GlovoTheme.colors.textMuted,
    marginTop: 2,
  },
  refreshIconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: GlovoTheme.colors.background,
  },
  applicationsList: {
    gap: 12,
  },
  appCard: {
    backgroundColor: GlovoTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderLight,
    padding: 14,
    ...GlovoTheme.shadows.soft,
  },
  appCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  appServiceTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  appProviderName: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  appStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1,
  },
  appStatusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  approvedNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F6F3",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
  },
  approvedNoticeText: {
    fontSize: 11,
    color: "#00A082",
    fontWeight: "700",
    flex: 1,
  },
  rejectedNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
  },
  rejectedNoticeText: {
    fontSize: 11,
    color: "#E11D48",
    fontWeight: "700",
  },
  reapplyNoticeSub: {
    fontSize: 10,
    color: "#9F1239",
    marginTop: 2,
    fontWeight: "500",
  },
  reapplyProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: GlovoTheme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: GlovoTheme.borderRadius.pill,
    ...GlovoTheme.shadows.soft,
  },
  reapplyProfileBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  appCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
  },
  appDateText: {
    fontSize: 11,
    color: GlovoTheme.colors.textMuted,
    fontFamily: "monospace",
  },
  appNotesText: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    maxWidth: "60%",
  },
  emptyAppsBox: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: GlovoTheme.colors.borderLight,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  emptyAppsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    marginTop: 8,
  },
  emptyAppsSub: {
    fontSize: 12,
    color: GlovoTheme.colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  interestPillText: {
    fontSize: 12,
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
