import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MainTab } from "../types";

interface BottomNavBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  savedCount?: number;
}

export function BottomNavBar({ activeTab, onTabChange, savedCount = 0 }: BottomNavBarProps) {
  const tabs: { id: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
    { id: "search", label: "Search", icon: "search-outline", activeIcon: "search" },
    { id: "saved", label: "Saved", icon: "bookmark-outline", activeIcon: "bookmark" },
    { id: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? "#000000" : "#8E8E93"}
              />
              {tab.id === "saved" && savedCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{savedCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive ? styles.activeLabel : styles.inactiveLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 78 : 62,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 18 : 6,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#000000",
    fontWeight: "700",
  },
  inactiveLabel: {
    color: "#8E8E93",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#000000",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
  },
});
