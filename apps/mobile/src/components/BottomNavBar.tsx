import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainTab } from "../types";
import { GlovoTheme } from "../theme";

interface BottomNavBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  savedCount?: number;
}

export function BottomNavBar({ activeTab, onTabChange, savedCount = 0 }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 8);

  const tabs: { id: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
    { id: "search", label: "Search", icon: "search-outline", activeIcon: "search" },
    { id: "saved", label: "Saved", icon: "bookmark-outline", activeIcon: "bookmark" },
    { id: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding, height: 56 + bottomPadding }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? GlovoTheme.colors.textDark : GlovoTheme.colors.textMuted}
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
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    ...GlovoTheme.shadows.soft,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: GlovoTheme.borderRadius.pill,
  },
  activeIconContainer: {
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow pill highlight
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "600",
  },
  activeLabel: {
    color: GlovoTheme.colors.textDark,
    fontWeight: "800",
  },
  inactiveLabel: {
    color: GlovoTheme.colors.textMuted,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: GlovoTheme.colors.secondary, // Glovo teal-green accent for badge
    borderRadius: GlovoTheme.borderRadius.pill,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.white,
  },
  badgeText: {
    color: GlovoTheme.colors.white,
    fontSize: 9,
    fontWeight: "900",
  },
});
