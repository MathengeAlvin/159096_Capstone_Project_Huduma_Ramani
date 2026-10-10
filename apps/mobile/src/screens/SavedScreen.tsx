import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService } from "../types";

interface SavedScreenProps {
  savedServices: MobileService[];
  onSelectService: (service: MobileService) => void;
  onRemoveBookmark: (serviceId: string) => void;
}

export function SavedScreen({
  savedServices,
  onSelectService,
  onRemoveBookmark,
}: SavedScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Title matching Screenshot 142413 */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Services</Text>
          <Text style={styles.subtitle}>
            {savedServices.length} {savedServices.length === 1 ? "listing" : "listings"} bookmarked for offline access
          </Text>
        </View>

        {/* List of Saved Service Cards */}
        <FlatList
          data={savedServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectService(item)}
              activeOpacity={0.75}
            >
              {/* Left Thumbnail with diagonal wireframe line */}
              <View style={styles.thumbnail}>
                <View style={styles.diagonalLine} />
                <Ionicons
                  name="image-outline"
                  size={16}
                  color="#98A2B3"
                  style={styles.cornerIcon}
                />
              </View>

              {/* Middle Service Info */}
              <View style={styles.cardInfo}>
                <Text style={styles.serviceName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>

              {/* Right Ribbon / Bookmark Icon */}
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => onRemoveBookmark(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="bookmark" size={20} color="#000000" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color="#D0D5DD" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No saved services yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the bookmark icon on any clinic, workshop, or legal clinic to save it here for offline reference.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: "#667085",
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#F2F4F7",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  diagonalLine: {
    position: "absolute",
    width: "140%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "35deg" }],
  },
  cornerIcon: {
    position: "absolute",
    top: 4,
    left: 4,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "500",
  },
  bookmarkButton: {
    padding: 6,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#667085",
    textAlign: "center",
    lineHeight: 18,
  },
});
