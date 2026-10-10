import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService } from "../types";

interface MapViewComponentProps {
  services: MobileService[];
  onSelectService: (service: MobileService) => void;
  selectedServiceId?: string;
}

export function MapViewComponent({
  services,
  onSelectService,
  selectedServiceId,
}: MapViewComponentProps) {
  // Pre-selected sample services for pins matching Screenshot 142340:
  // Clinic, Legal Aid, Vocational
  const clinic = services.find((s) => s.category === "Healthcare") || services[0];
  const legalAid = services.find((s) => s.category === "Legal Aid") || services[1];
  const vocational = services.find((s) => s.category === "Vocational Training") || services[2];

  const pins = [
    { service: clinic, label: "Clinic", top: "30%", left: "32%", icon: "medkit" as const },
    { service: legalAid, label: "Legal Aid", top: "54%", left: "62%", icon: "shield-checkmark" as const },
    { service: vocational, label: "Vocational", top: "70%", left: "22%", icon: "construct" as const },
  ].filter((p) => Boolean(p.service));

  return (
    <View style={styles.container}>
      <Text style={styles.mapHeaderTitle}>MAP VIEW</Text>

      {/* Stylized Settlement Map Grid (Informal Path Visualizer) */}
      <View style={styles.gridContainer}>
        {/* Settlement road lines */}
        <View style={styles.roadLine1} />
        <View style={styles.roadLine2} />
        <View style={styles.railwayLine} />

        {/* Map Pins matching wireframe */}
        {pins.map((pin, idx) => {
          const isSelected = selectedServiceId === pin.service.id;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.pinWrapper,
                { top: pin.top as any, left: pin.left as any },
              ]}
              onPress={() => onSelectService(pin.service)}
              activeOpacity={0.8}
            >
              <View style={[styles.pinDot, isSelected && styles.selectedPinDot]} />
              <View style={[styles.pinLabelBox, isSelected && styles.selectedPinLabelBox]}>
                <Text style={[styles.pinLabelText, isSelected && styles.selectedPinLabelText]}>
                  {pin.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Map Watermark / Coordinates */}
        <View style={styles.coordWatermark}>
          <Text style={styles.coordText}>Kibera, Nairobi • Lat: -1.3142, Lon: 36.7865</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F4F7",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
    height: 220,
    position: "relative",
  },
  mapHeaderTitle: {
    position: "absolute",
    top: 12,
    left: 16,
    zIndex: 10,
    fontSize: 13,
    fontWeight: "800",
    color: "#667085",
    letterSpacing: 0.8,
  },
  gridContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  roadLine1: {
    position: "absolute",
    top: -20,
    left: "40%",
    width: 2,
    height: 300,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "25deg" }],
  },
  roadLine2: {
    position: "absolute",
    top: 90,
    left: -50,
    width: 450,
    height: 2,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "-15deg" }],
  },
  railwayLine: {
    position: "absolute",
    bottom: 30,
    left: -20,
    width: 400,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#98A2B3",
  },
  pinWrapper: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedPinDot: {
    backgroundColor: "#2563EB",
    transform: [{ scale: 1.3 }],
  },
  pinLabelBox: {
    marginLeft: 6,
    backgroundColor: "transparent",
  },
  selectedPinLabelBox: {
    backgroundColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
  selectedPinLabelText: {
    color: "#FFFFFF",
  },
  coordWatermark: {
    position: "absolute",
    bottom: 8,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordText: {
    fontSize: 9,
    color: "#475467",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
