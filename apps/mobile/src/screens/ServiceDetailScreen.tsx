import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MobileService, ResidentUser, MobileApplication } from "../types";
import { GlovoTheme } from "../theme";

interface ServiceDetailScreenProps {
  service: MobileService;
  user?: ResidentUser;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (serviceId: string) => void;
  onRateService: (serviceId: string, rating: number) => void;
  existingApplication?: MobileApplication;
  onApplyForService?: (serviceId: string, phone: string, notes: string) => Promise<boolean>;
}

export function ServiceDetailScreen({
  service,
  user,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onRateService,
  existingApplication,
  onApplyForService,
}: ServiceDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) : 0, 24);

  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState(false);

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantPhone, setApplicantPhone] = useState("+254 7");
  const [applicationNotes, setApplicationNotes] = useState("");
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const handleStarPress = (rating: number) => {
    setUserRating(rating);
    setHasRated(true);
    onRateService(service.id, rating);
  };

  const handleOpenApplyModal = () => {
    if (existingApplication) {
      if (existingApplication.status === "APPROVED") {
        Alert.alert(
          "Application Approved ✓",
          "Your application has been APPROVED by the provider! You can visit them in person or call them at " + service.phone
        );
        return;
      }
      if (existingApplication.status === "PENDING") {
        Alert.alert(
          "Awaiting Provider Review ⏳",
          "Your application was submitted on " + existingApplication.date + " and is awaiting provider review. You can track status on your Profile tab."
        );
        return;
      }
      if (existingApplication.status === "REJECTED") {
        // Pre-fill phone if available and allow re-application
        if (existingApplication.applicantPhone) {
          setApplicantPhone(existingApplication.applicantPhone);
        }
        setShowApplyModal(true);
        return;
      }
    }
    setShowApplyModal(true);
  };

  const handleConfirmApplication = async () => {
    if (!onApplyForService) return;
    if (!applicantPhone.trim() || applicantPhone.trim().length < 8) {
      Alert.alert("Contact Required", "Please provide a valid phone number so the provider can reach you.");
      return;
    }

    const isReapplication = existingApplication?.status === "REJECTED";
    setIsSubmittingApp(true);
    const success = await onApplyForService(
      service.id,
      applicantPhone.trim(),
      applicationNotes.trim()
    );
    setIsSubmittingApp(false);

    if (success) {
      setShowApplyModal(false);
      Alert.alert(
        isReapplication ? "Reapplication Submitted! ✓" : "Application Submitted! ✓",
        isReapplication
          ? `Your renewed intake request for ${service.name} has been resubmitted to the provider for review.`
          : `Your intake request for ${service.name} has been sent to the provider. You can track their review status on your Profile tab.`
      );
    } else {
      Alert.alert("Submission Error", "Could not submit application. Please check your network connection.");
    }
  };

  const snippetHtml = useMemo(() => {
    const lat = service.coordinates?.latitude ?? -1.3142;
    const lon = service.coordinates?.longitude ?? 36.7865;
    const safeTitle = service.name.replace(/'/g, "\\'");
    const safeLoc = (service.location || service.settlement).replace(/'/g, "\\'");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #mini-map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #fffdf5;
          }
          .location-pin {
            background-color: #ffc244;
            color: #1e1e1e;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 900;
            border: 3px solid #1e1e1e;
            box-shadow: 0 0 12px rgba(255, 194, 68, 0.8), 0 3px 6px rgba(0,0,0,0.3);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            border: 1.5px solid #ffc244;
            padding: 2px;
          }
          .popup-title {
            font-size: 12px;
            font-weight: 900;
            color: #1e1e1e;
            margin: 0;
          }
          .popup-sub {
            font-size: 10px;
            color: #4b5563;
          }
          .osm-tag {
            position: absolute;
            bottom: 3px;
            left: 3px;
            background: rgba(255,255,255,0.9);
            font-size: 8px;
            font-weight: 800;
            color: #374151;
            padding: 2px 5px;
            border-radius: 3px;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="mini-map"></div>
        <div class="osm-tag">© OpenStreetMap</div>
        <script>
          const map = L.map('mini-map', {
            center: [${lat}, ${lon}],
            zoom: 16,
            zoomControl: false,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            attributionControl: false
          });

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          const icon = L.divIcon({
            className: 'pin-box',
            html: '<div class="location-pin">📍</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([${lat}, ${lon}], { icon }).addTo(map);
          marker.bindPopup("<div class='popup-title'>${safeTitle}</div><div class='popup-sub'>${safeLoc}</div>").openPopup();
        </script>
      </body>
      </html>
    `;
  }, [service]);

  // Determine button status text & style
  const getApplyButtonProps = () => {
    if (!existingApplication) {
      return {
        text: "Apply for Service / Intake",
        bgColor: GlovoTheme.colors.primary,
        textColor: GlovoTheme.colors.textDark,
        icon: "send" as const,
      };
    }
    switch (existingApplication.status) {
      case "APPROVED":
        return {
          text: "Application Approved ✓",
          bgColor: "#E6F6F3",
          textColor: "#00A082",
          icon: "checkmark-circle" as const,
        };
      case "REJECTED":
        return {
          text: "Reapply for Service ↺",
          bgColor: GlovoTheme.colors.primary,
          textColor: GlovoTheme.colors.textDark,
          icon: "refresh" as const,
        };
      case "COMPLETED":
        return {
          text: "Intake Completed",
          bgColor: "#F3F4F6",
          textColor: "#4B5563",
          icon: "ribbon" as const,
        };
      case "PENDING":
      default:
        return {
          text: "Pending Provider Review ⏳",
          bgColor: "#FFFBEB",
          textColor: "#B45309",
          icon: "time" as const,
        };
    }
  };

  const btnProps = getApplyButtonProps();

  return (
    <View style={[styles.safeArea, { paddingTop: topInset + 8 }]}>
      <View style={styles.container}>
        {/* Top Header with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={24} color={GlovoTheme.colors.textDark} />
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Text style={styles.headerCategoryText}>{service.category}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleBookmark(service.id)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.bookmarkHeaderBtn}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? GlovoTheme.colors.primaryHover : GlovoTheme.colors.textDark}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title & Subtitle */}
          <Text style={styles.title}>{service.name}</Text>
          <View style={styles.subtitleRow}>
            <View style={styles.starBadge}>
              <Ionicons name="star" size={13} color={GlovoTheme.colors.star} />
              <Text style={styles.starBadgeText}>{service.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCountText}>({service.reviewCount} verified reviews)</Text>
            <Text style={styles.settlementTag}>• {service.settlement}</Text>
          </View>

          {/* Active Application Status Banner if applied */}
          {existingApplication && (
            <View
              style={[
                styles.appStatusBanner,
                existingApplication.status === "APPROVED" && styles.bannerApproved,
                existingApplication.status === "REJECTED" && styles.bannerRejected,
                existingApplication.status === "PENDING" && styles.bannerPending,
              ]}
            >
              <Ionicons
                name={
                  existingApplication.status === "APPROVED"
                    ? "checkmark-circle"
                    : existingApplication.status === "REJECTED"
                    ? "alert-circle"
                    : "time"
                }
                size={22}
                color={
                  existingApplication.status === "APPROVED"
                    ? "#00A082"
                    : existingApplication.status === "REJECTED"
                    ? "#E11D48"
                    : "#B45309"
                }
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.bannerStatusTitle,
                    {
                      color:
                        existingApplication.status === "APPROVED"
                          ? "#00A082"
                          : existingApplication.status === "REJECTED"
                          ? "#E11D48"
                          : "#B45309",
                    },
                  ]}
                >
                  {existingApplication.status === "REJECTED"
                    ? "Application Declined — You Can Reapply"
                    : `Application Status: ${existingApplication.status}`}
                </Text>
                <Text style={styles.bannerStatusSub}>
                  {existingApplication.status === "APPROVED"
                    ? "Your request was accepted by the provider! You can visit them in person or expect follow-up."
                    : existingApplication.status === "REJECTED"
                    ? "The provider was unable to accommodate your previous request. You may update your reasons and submit a new application below."
                    : `Submitted on ${existingApplication.date}. Awaiting provider approval.`}
                </Text>

                {existingApplication.status === "REJECTED" && (
                  <TouchableOpacity
                    style={styles.bannerReapplyBtn}
                    onPress={handleOpenApplyModal}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={13} color="#78350F" />
                    <Text style={styles.bannerReapplyBtnText}>Tap here to Reapply</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Hero Banner with Glovo Yellow Accents */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="business" size={36} color={GlovoTheme.colors.textDark} />
            </View>
            <Text style={styles.heroBannerLabel}>{service.name}</Text>
            <Text style={styles.heroBannerSub}>{service.location} Community Hub</Text>
          </View>

          {/* About Service Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>ABOUT THIS SERVICE</Text>
            <Text style={styles.descriptionText}>{service.description}</Text>

            {/* Metadata Rows */}
            <View style={styles.metaInfoBox}>
              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="location" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Address: </Text>{service.address}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="time" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Hours: </Text>{service.hours}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaIconBox}>
                  <Ionicons name="call" size={15} color={GlovoTheme.colors.textDark} />
                </View>
                <Text style={styles.metaText}>
                  <Text style={styles.metaBold}>Contact: </Text>{service.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Live OpenStreetMap Snippet */}
          <View style={styles.mapSnippetBox}>
            <View style={styles.mapSnippetHeader}>
              <View style={styles.snippetHeadingRow}>
                <Ionicons name="map" size={15} color={GlovoTheme.colors.textDark} />
                <Text style={styles.mapSnippetText}>LOCATION ON OPENSTREETMAP</Text>
              </View>
              <View style={styles.snippetDistancePill}>
                <Text style={styles.snippetBadge}>{service.distanceKm} km away</Text>
              </View>
            </View>

            <View style={styles.snippetMapSurface}>
              {Platform.OS === "web" ? (
                <iframe
                  srcDoc={snippetHtml}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title="Service Location Snippet"
                />
              ) : (
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: snippetHtml }}
                  style={styles.snippetWebView}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scrollEnabled={false}
                />
              )}
            </View>

            <View style={styles.snippetFooter}>
              <Ionicons name="navigate-circle" size={14} color={GlovoTheme.colors.secondary} />
              <Text style={styles.mapSubtext}>
                {service.location || service.settlement} • Lat: {service.coordinates.latitude.toFixed(4)}, Lon: {service.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Rate This Service Panel */}
          <View style={styles.ratingPanel}>
            <Text style={styles.ratingPanelTitle}>Rate this service</Text>
            <Text style={styles.ratingPanelSub}>Your rating informs the Bayesian recommendation engine</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= userRating;
                return (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={filled ? "star" : "star-outline"}
                      size={32}
                      color={filled ? GlovoTheme.colors.primary : "#D1D5DB"}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {hasRated && (
              <View style={styles.ratingConfirmationBox}>
                <Ionicons name="checkmark-circle" size={16} color={GlovoTheme.colors.secondary} />
                <Text style={styles.ratingConfirmation}>
                  Thank you! Your feedback adjusts quality rankings in {service.settlement}.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions Row with Glovo Yellow Primary Button */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <TouchableOpacity
            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkedActiveButton]}
            onPress={() => onToggleBookmark(service.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={GlovoTheme.colors.textDark}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.bookmarkButtonText}>
              {isBookmarked ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: btnProps.bgColor },
            ]}
            onPress={handleOpenApplyModal}
            activeOpacity={0.85}
          >
            <Ionicons name={btnProps.icon} size={15} color={btnProps.textColor} style={{ marginRight: 5 }} />
            <Text style={[styles.applyButtonText, { color: btnProps.textColor }]}>
              {btnProps.text}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Application Intake Modal */}
        <Modal
          visible={showApplyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowApplyModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {existingApplication?.status === "REJECTED" ? "Reapply for Service" : "Apply for Service"}
                  </Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {existingApplication?.status === "REJECTED"
                      ? `Update and resubmit intake to ${service.name}`
                      : service.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowApplyModal(false)}
                  style={styles.closeModalBtn}
                >
                  <Ionicons name="close" size={20} color={GlovoTheme.colors.textDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.applicantInfoBox}>
                  <Text style={styles.applicantInfoLabel}>APPLICANT</Text>
                  <Text style={styles.applicantInfoName}>
                    {user?.name || "Community Resident"}
                  </Text>
                  <Text style={styles.applicantInfoSub}>
                    {user?.email || "resident@huduma.org"} • {service.settlement}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>YOUR CONTACT PHONE *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={applicantPhone}
                    onChangeText={setApplicantPhone}
                    placeholder="+254 712 345 678"
                    keyboardType="phone-pad"
                    placeholderTextColor={GlovoTheme.colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>REASON / NEED DESCRIPTION</Text>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    value={applicationNotes}
                    onChangeText={setApplicationNotes}
                    placeholder="e.g. Requesting medical check-up, legal aid consult, or vocational scholarship assistance..."
                    placeholderTextColor={GlovoTheme.colors.textMuted}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitAppButton, isSubmittingApp && { opacity: 0.7 }]}
                  onPress={handleConfirmApplication}
                  disabled={isSubmittingApp}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitAppButtonText}>
                    {isSubmittingApp
                      ? "Submitting Request..."
                      : existingApplication?.status === "REJECTED"
                      ? "Submit Reapplication to Provider ↺"
                      : "Submit Application to Provider →"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GlovoTheme.colors.background,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...GlovoTheme.shadows.soft,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
  },
  headerCategoryText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#78350F",
  },
  bookmarkHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GlovoTheme.colors.background,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
    ...GlovoTheme.shadows.soft,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
    gap: 6,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: GlovoTheme.borderRadius.xs,
    gap: 3,
  },
  starBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: GlovoTheme.colors.textSecondary,
  },
  settlementTag: {
    fontSize: 12,
    fontWeight: "600",
    color: GlovoTheme.colors.textMuted,
  },
  appStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerApproved: {
    backgroundColor: "#E6F6F3",
    borderColor: "#A3E2D5",
  },
  bannerRejected: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
  },
  bannerPending: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  bannerStatusTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  bannerStatusSub: {
    fontSize: 11,
    color: GlovoTheme.colors.textDark,
    marginTop: 2,
    lineHeight: 15,
  },
  bannerReapplyBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: GlovoTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GlovoTheme.borderRadius.pill,
    ...GlovoTheme.shadows.soft,
  },
  bannerReapplyBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  heroBanner: {
    height: 140,
    borderRadius: GlovoTheme.borderRadius.lg,
    backgroundColor: GlovoTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    ...GlovoTheme.shadows.soft,
  },
  heroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GlovoTheme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...GlovoTheme.shadows.soft,
  },
  heroBannerLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  heroBannerSub: {
    fontSize: 11,
    color: "#78350F",
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: GlovoTheme.colors.textSecondary,
    marginBottom: 14,
  },
  metaInfoBox: {
    backgroundColor: GlovoTheme.colors.background,
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    padding: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GlovoTheme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  metaText: {
    fontSize: 12,
    color: GlovoTheme.colors.textDark,
    flex: 1,
  },
  metaBold: {
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  mapSnippetBox: {
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
    backgroundColor: GlovoTheme.colors.white,
    marginBottom: 20,
    overflow: "hidden",
    ...GlovoTheme.shadows.soft,
  },
  mapSnippetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.primaryLight,
  },
  snippetHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapSnippetText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#78350F",
    letterSpacing: 0.5,
  },
  snippetDistancePill: {
    backgroundColor: GlovoTheme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  snippetBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  snippetMapSurface: {
    height: 180,
    backgroundColor: "#FFFDF7",
  },
  snippetWebView: {
    flex: 1,
  },
  snippetFooter: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: GlovoTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mapSubtext: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "600",
  },
  ratingPanel: {
    borderRadius: GlovoTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.border,
    backgroundColor: GlovoTheme.colors.background,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  ratingPanelTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  ratingPanelSub: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 10,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingConfirmationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: GlovoTheme.colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GlovoTheme.borderRadius.sm,
  },
  ratingConfirmation: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "700",
  },
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
    gap: 12,
    ...GlovoTheme.shadows.soft,
  },
  bookmarkButton: {
    flex: 0.8,
    height: 48,
    borderRadius: GlovoTheme.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: GlovoTheme.colors.white,
  },
  bookmarkedActiveButton: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderColor: GlovoTheme.colors.primary,
  },
  bookmarkButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
  },
  applyButton: {
    flex: 1.4,
    height: 48,
    borderRadius: GlovoTheme.borderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...GlovoTheme.shadows.glowYellow,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: GlovoTheme.colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    ...GlovoTheme.shadows.soft,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: GlovoTheme.colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: GlovoTheme.colors.textSecondary,
    fontWeight: "700",
    marginTop: 2,
    maxWidth: 240,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GlovoTheme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    paddingTop: 16,
    gap: 14,
  },
  applicantInfoBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: GlovoTheme.colors.primarySoft,
    borderWidth: 1,
    borderColor: GlovoTheme.colors.borderYellow,
  },
  applicantInfoLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#78350F",
    letterSpacing: 0.5,
  },
  applicantInfoName: {
    fontSize: 14,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    marginTop: 2,
  },
  applicantInfoSub: {
    fontSize: 11,
    color: GlovoTheme.colors.textSecondary,
    marginTop: 2,
    fontFamily: "monospace",
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.4,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: GlovoTheme.colors.textDark,
    backgroundColor: GlovoTheme.colors.white,
  },
  textAreaInput: {
    height: 70,
    textAlignVertical: "top",
  },
  submitAppButton: {
    height: 48,
    borderRadius: GlovoTheme.borderRadius.pill,
    backgroundColor: GlovoTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    ...GlovoTheme.shadows.glowYellow,
  },
  submitAppButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: 0.2,
  },
});
