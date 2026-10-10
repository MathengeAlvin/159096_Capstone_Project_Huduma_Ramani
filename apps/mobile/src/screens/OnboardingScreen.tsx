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
          <Text style={styles.title}>What services interest you?</Text>
          <Text style={styles.subtitle}>
            Select one or more categories to customize your map and directory.
          </Text>

          {/* 8 Category Checkboxes matching Screenshot 142326 */}
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
                  activeOpacity={0.7}
                >
                  <View style={[styles.box, isChecked && styles.checkedBox]}>
                    {isChecked && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={[styles.categoryLabel, isChecked && styles.checkedLabel]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 18,
    marginBottom: 24,
  },
  optionsList: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  checkedCheckboxRow: {
    backgroundColor: "#F8F9FA",
    borderColor: "#000000",
    borderWidth: 2,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "#FFFFFF",
  },
  checkedBox: {
    backgroundColor: "#000000",
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  checkedLabel: {
    fontWeight: "800",
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    height: 50,
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
