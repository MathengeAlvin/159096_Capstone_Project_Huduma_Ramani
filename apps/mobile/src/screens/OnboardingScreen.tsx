import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ServiceCategory } from "../types";
import { ALL_CATEGORIES } from "../data/mockServices";
import { GlovoTheme } from "../theme";

interface OnboardingScreenProps {
  initialSelected?: ServiceCategory[];
  onComplete: (selected: ServiceCategory[]) => void;
}

export function OnboardingScreen({
  initialSelected = [],
  onComplete,
}: OnboardingScreenProps) {
  const [selected, setSelected] = useState<ServiceCategory[]>(
    initialSelected.length > 0 ? initialSelected : ["Healthcare", "Digital Literacy"]
  );

  const toggleCategory = (cat: ServiceCategory) => {
    if (selected.includes(cat)) {
      setSelected(selected.filter((c) => c !== cat));
    } else {
      setSelected([...selected, cat]);
    }
  };

  const handleContinue = () => {
    onComplete(selected.length > 0 ? selected : ["Healthcare"]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title & Subtitle */}
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>CUSTOMIZE YOUR EXPERIENCE</Text>
          </View>
          <Text style={styles.title}>What services interest you?</Text>
          <Text style={styles.subtitle}>
            Select one or more categories to personalize your directory and recommendation engine.
          </Text>

          {/* 8 Category Selection Cards in Glovo Style */}
          <View style={styles.optionsList}>
            {ALL_CATEGORIES.map((cat) => {
              const isChecked = selected.includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.checkboxRow,
                    isChecked && styles.checkedCheckboxRow,
                  ]}
                  onPress={() => toggleCategory(cat)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.box, isChecked && styles.checkedBox]}>
                    {isChecked && (
                      <Ionicons name="checkmark" size={15} color={GlovoTheme.colors.textDark} />
                    )}
                  </View>
                  <Text style={[styles.categoryLabel, isChecked && styles.checkedLabel]}>
                    {cat}
                  </Text>
                  {isChecked && (
                    <Ionicons
                      name="star"
                      size={15}
                      color={GlovoTheme.colors.primaryHover}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Continue Button (Glovo Yellow) */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue ({selected.length} Selected)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: GlovoTheme.colors.white,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerBadge: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: GlovoTheme.borderRadius.pill,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#78350F",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: GlovoTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: "500",
  },
  optionsList: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.border,
    borderRadius: GlovoTheme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: GlovoTheme.colors.white,
    ...GlovoTheme.shadows.soft,
  },
  checkedCheckboxRow: {
    backgroundColor: GlovoTheme.colors.primaryLight,
    borderColor: GlovoTheme.colors.primary,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: GlovoTheme.colors.borderDark,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: GlovoTheme.colors.white,
  },
  checkedBox: {
    backgroundColor: GlovoTheme.colors.primary,
    borderColor: GlovoTheme.colors.primaryHover,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: GlovoTheme.colors.textDark,
  },
  checkedLabel: {
    fontWeight: "900",
    color: GlovoTheme.colors.textDark,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GlovoTheme.colors.borderLight,
    backgroundColor: GlovoTheme.colors.white,
  },
  continueButton: {
    height: 52,
    backgroundColor: GlovoTheme.colors.primary, // Glovo Yellow
    borderRadius: GlovoTheme.borderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    ...GlovoTheme.shadows.glowYellow,
  },
  continueButtonText: {
    color: GlovoTheme.colors.textDark,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
});
