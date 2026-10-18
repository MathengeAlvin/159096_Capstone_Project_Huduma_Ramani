import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MobileService } from "../types";

interface MapViewComponentProps {
  services: MobileService[];
  onSelectService: (service: MobileService) => void;
  selectedServiceId?: string;
  settlement?: "Kibera" | "Mathare";
}

const SETTLEMENT_COORDS = {
  Kibera: { lat: -1.3142, lon: 36.7865, zoom: 15 },
  Mathare: { lat: -1.2612, lon: 36.8521, zoom: 15 },
};

export function MapViewComponent({
  services,
  onSelectService,
  selectedServiceId,
  settlement = "Kibera",
}: MapViewComponentProps) {
  const [activeSettlement, setActiveSettlement] = useState<"Kibera" | "Mathare">(settlement);

  useEffect(() => {
    if (settlement) setActiveSettlement(settlement);
  }, [settlement]);

  // Listen for message from Leaflet iframe on web
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "HUDUMA_SELECT_SERVICE") {
          const match = services.find((s) => s.id === event.data.serviceId);
          if (match) onSelectService(match);
        }
      };
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [services, onSelectService]);

  const coords = SETTLEMENT_COORDS[activeSettlement];

  // Generate interactive Leaflet HTML with OpenStreetMap Humanitarian / Standard tiles
  const leafletHtml = useMemo(() => {
    const markersData = services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lat: s.coordinates.latitude,
      lon: s.coordinates.longitude,
      rating: s.rating,
      reviews: s.reviewCount,
      isSelected: s.id === selectedServiceId,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f2f4f7;
          }
          .custom-pin {
            background-color: #000000;
            color: #ffffff;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .custom-pin.selected {
            background-color: #2563eb;
            transform: scale(1.2);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 4px;
            border: 1.5px solid #000000;
            padding: 4px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
          }
          .popup-title {
            font-size: 13px;
            font-weight: 800;
            color: #000000;
            margin-bottom: 2px;
          }
          .popup-cat {
            font-size: 10px;
            font-weight: 700;
            color: #475467;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .popup-rating {
            font-size: 11px;
            font-weight: 700;
            color: #d97706;
            margin-top: 4px;
          }
          .popup-btn {
            display: block;
            margin-top: 8px;
            background: #000000;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            text-align: center;
            padding: 6px 10px;
            text-decoration: none;
            border-radius: 2px;
            cursor: pointer;
          }
          .popup-btn:hover {
            background: #333333;
          }
          .osm-badge {
            position: absolute;
            bottom: 4px;
            left: 4px;
            background: rgba(255, 255, 255, 0.85);
            padding: 2px 6px;
            font-size: 9px;
            font-weight: 600;
            color: #344054;
            border-radius: 2px;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="osm-badge">© OpenStreetMap • Map Kibera & Mathare</div>

        <script>
          const map = L.map('map', {
            center: [${coords.lat}, ${coords.lon}],
            zoom: ${coords.zoom},
            zoomControl: false,
            attributionControl: false
          });

          // OpenStreetMap Tile Layer
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          L.control.zoom({ position: 'topright' }).addTo(map);

          const markers = ${JSON.stringify(markersData)};

          markers.forEach(m => {
            if (!m.lat || !m.lon) return;

            const icon = L.divIcon({
              className: 'pin-container',
              html: '<div class="custom-pin ' + (m.isSelected ? 'selected' : '') + '">' + m.name.charAt(0) + '</div>',
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            });

            const marker = L.marker([m.lat, m.lon], { icon }).addTo(map);

            const popupContent = 
              '<div class="popup-title">' + m.name + '</div>' +
              '<div class="popup-cat">' + m.category + '</div>' +
              '<div class="popup-rating">★ ' + m.rating.toFixed(1) + ' (' + m.reviews + ' reviews)</div>' +
              '<a class="popup-btn" onclick="selectService(\\'' + m.id + '\\')">View Details →</a>';

            marker.bindPopup(popupContent);
          });

          function selectService(id) {
            if (window.parent) {
              window.parent.postMessage({ type: 'HUDUMA_SELECT_SERVICE', serviceId: id }, '*');
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [services, coords, selectedServiceId]);

  return (
    <View style={styles.container}>
      {/* Map Header with Settlement Selector & OSM Indicator */}
      <View style={styles.mapHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.mapHeaderTitle}>OPENSTREETMAP VIEW</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.greenPulse} />
            <Text style={styles.liveText}>OSM Footpaths Active</Text>
          </View>
        </View>

        {/* Quick Settlement Switcher Pills */}
        <View style={styles.settlementPills}>
          <TouchableOpacity
            style={[
              styles.pill,
              activeSettlement === "Kibera" && styles.activePill,
            ]}
            onPress={() => setActiveSettlement("Kibera")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                activeSettlement === "Kibera" && styles.activePillText,
              ]}
            >
              Kibera (Olympic)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              activeSettlement === "Mathare" && styles.activePill,
            ]}
            onPress={() => setActiveSettlement("Mathare")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                activeSettlement === "Mathare" && styles.activePillText,
              ]}
            >
              Mathare (Mlango)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Surface */}
      <View style={styles.mapSurface}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={leafletHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="OpenStreetMap View"
          />
        ) : (
          // Native Fallback / Overlay
          <View style={styles.nativeFallback}>
            <View style={styles.gridLine1} />
            <View style={styles.gridLine2} />
            <Text style={styles.nativeCoordsText}>
              OpenStreetMap: {activeSettlement} ({coords.lat}, {coords.lon})
            </Text>
            {services.slice(0, 3).map((s, idx) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.nativePin,
                  { top: 40 + idx * 45, left: 60 + idx * 80 },
                ]}
                onPress={() => onSelectService(s)}
              >
                <View style={styles.nativePinDot} />
                <Text style={styles.nativePinLabel}>{s.name.slice(0, 16)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    height: 270,
    position: "relative",
  },
  mapHeader: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E7EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "column",
  },
  mapHeaderTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  liveText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16A34A",
  },
  settlementPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  activePill: {
    backgroundColor: "#000000",
  },
  pillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000000",
  },
  activePillText: {
    color: "#FFFFFF",
  },
  mapSurface: {
    flex: 1,
    backgroundColor: "#F2F4F7",
    position: "relative",
  },
  nativeFallback: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gridLine1: {
    position: "absolute",
    width: "120%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "20deg" }],
  },
  gridLine2: {
    position: "absolute",
    width: "120%",
    height: 1,
    backgroundColor: "#D0D5DD",
    transform: [{ rotate: "-20deg" }],
  },
  nativeCoordsText: {
    position: "absolute",
    bottom: 8,
    right: 8,
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#475467",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 3,
  },
  nativePin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nativePinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nativePinLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#000000",
  },
});
