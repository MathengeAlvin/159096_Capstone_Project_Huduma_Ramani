import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { MobileService, ServiceCategory } from "../types";
import { ALL_CATEGORIES } from "../data/mockServices";

interface MapViewComponentProps {
  services: MobileService[];
  recommendedServices?: MobileService[];
  onSelectService: (service: MobileService) => void;
  selectedServiceId?: string;
  settlement?: "Kibera" | "Mathare";
  onSettlementChange?: (settlement: "Kibera" | "Mathare") => void;
}

const SETTLEMENT_CENTERS = {
  Kibera: { lat: -1.3142, lon: 36.7865, name: "Kibera", zoom: 15 },
  Mathare: { lat: -1.2612, lon: 36.8521, name: "Mathare", zoom: 15 },
};

export function MapViewComponent({
  services,
  recommendedServices = [],
  onSelectService,
  selectedServiceId,
  settlement = "Kibera",
  onSettlementChange,
}: MapViewComponentProps) {
  const [activeSettlement, setActiveSettlement] = useState<"Kibera" | "Mathare">(settlement);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (settlement) setActiveSettlement(settlement);
  }, [settlement]);

  const handleSettlementSwitch = (s: "Kibera" | "Mathare") => {
    setActiveSettlement(s);
    if (onSettlementChange) onSettlementChange(s);
  };

  // Listen for message from Leaflet map
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

  const coords = SETTLEMENT_CENTERS[activeSettlement];

  // Set of recommended service IDs for fast lookup & visual highlighting
  const recommendedIds = useMemo(
    () => new Set(recommendedServices.map((r) => r.id)),
    [recommendedServices]
  );

  // Filter services by active settlement and category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSettlement = s.settlement.toLowerCase() === activeSettlement.toLowerCase();
      const matchesCategory =
        selectedCategory === "All" || s.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSettlement && matchesCategory;
    });
  }, [services, activeSettlement, selectedCategory]);

  // Generate interactive Leaflet HTML with OpenStreetMap tiles
  const leafletHtml = useMemo(() => {
    const markersData = filteredServices.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lat: s.coordinates.latitude,
      lon: s.coordinates.longitude,
      rating: s.rating,
      reviews: s.reviewCount,
      address: s.address || `${s.settlement}, Nairobi`,
      isRecommended: recommendedIds.has(s.id),
      isSelected: s.id === selectedServiceId,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #e5e7eb;
            touch-action: pan-x pan-y pinch-zoom;
          }
          /* Standard community provider pin */
          .provider-pin {
            background-color: #111827;
            color: #ffffff;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: transform 0.15s ease;
          }
          .provider-pin:hover {
            transform: scale(1.2);
          }
          /* Top Recommended facility pin (Ranked/Golden Highlight) */
          .provider-pin.recommended {
            background-color: #2563eb;
            border: 2.5px solid #fbbf24;
            box-shadow: 0 0 8px rgba(37, 99, 235, 0.6), 0 2px 4px rgba(0,0,0,0.3);
            width: 28px;
            height: 28px;
            font-size: 11px;
            z-index: 1000 !important;
          }
          .provider-pin.selected {
            background-color: #dc2626 !important;
            border-color: #ffffff !important;
            transform: scale(1.35);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 6px;
            border: 2px solid #111827;
            padding: 2px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
          }
          .popup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            margin-bottom: 4px;
          }
          .popup-title {
            font-size: 14px;
            font-weight: 900;
            color: #111827;
            margin: 0;
            line-height: 1.2;
          }
          .rec-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 2px;
            text-transform: uppercase;
          }
          .popup-cat {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            color: #4b5563;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .popup-address {
            font-size: 11px;
            color: #6b7280;
            margin: 3px 0;
          }
          .popup-rating {
            font-size: 12px;
            font-weight: 800;
            color: #d97706;
            margin-top: 4px;
          }
          .popup-btn {
            display: block;
            margin-top: 10px;
            background: #111827;
            color: #ffffff !important;
            font-size: 12px;
            font-weight: 800;
            text-align: center;
            padding: 8px 12px;
            text-decoration: none;
            border-radius: 3px;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          .popup-btn:hover {
            background: #000000;
          }
          .osm-attribution {
            position: absolute;
            bottom: 4px;
            left: 4px;
            background: rgba(255, 255, 255, 0.9);
            padding: 2px 6px;
            font-size: 9px;
            font-weight: 700;
            color: #374151;
            border-radius: 2px;
            border: 1px solid rgba(0,0,0,0.1);
            z-index: 1000;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="osm-attribution">© OpenStreetMap • Map Kibera & Mathare</div>

        <script>
          const map = L.map('map', {
            center: [${coords.lat}, ${coords.lon}],
            zoom: ${coords.zoom},
            minZoom: 12,
            maxZoom: 19,
            zoomControl: true,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
          });

          // OpenStreetMap Tile Layer (Renders informal footpaths and alleys)
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const markers = ${JSON.stringify(markersData)};

          markers.forEach(m => {
            if (!m.lat || !m.lon) return;

            const pinClasses = [
              'provider-pin',
              m.isRecommended ? 'recommended' : '',
              m.isSelected ? 'selected' : ''
            ].filter(Boolean).join(' ');

            const iconContent = m.isRecommended ? '★' : m.name.charAt(0);

            const icon = L.divIcon({
              className: 'pin-wrapper',
              html: '<div class="' + pinClasses + '" title="' + m.name + '">' + iconContent + '</div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14]
            });

            const marker = L.marker([m.lat, m.lon], { icon }).addTo(map);

            const recHtml = m.isRecommended ? '<span class="rec-badge">Recommended</span>' : '';

            const popupContent = 
              '<div class="popup-header">' +
                '<h4 class="popup-title">' + m.name + '</h4>' +
                recHtml +
              '</div>' +
              '<div class="popup-cat">' + m.category + '</div>' +
              '<div class="popup-address">📍 ' + m.address + '</div>' +
              '<div class="popup-rating">★ ' + m.rating.toFixed(1) + ' (' + m.reviews + ' reviews)</div>' +
              '<a class="popup-btn" onclick="selectService(\\'' + m.id + '\\')">View Full Details →</a>';

            marker.bindPopup(popupContent);
          });

          function selectService(id) {
            var payload = JSON.stringify({ type: 'HUDUMA_SELECT_SERVICE', serviceId: id });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(payload);
            } else if (window.parent) {
              window.parent.postMessage({ type: 'HUDUMA_SELECT_SERVICE', serviceId: id }, '*');
            }
          }

          // Center helper for parent window
          window.recenterMap = function(lat, lon, zoom) {
            map.flyTo([lat, lon], zoom || 15);
          };
        </script>
      </body>
      </html>
    `;
  }, [filteredServices, coords, recommendedIds, selectedServiceId]);

  return (
    <View style={[styles.container, isExpanded && styles.expandedContainer]}>
      {/* Top Map Toolbar: Settlement Switcher, Filter Count, Fullscreen Toggle */}
      <View style={styles.topToolbar}>
        <View style={styles.settlementRow}>
          <TouchableOpacity
            style={[
              styles.settlementPill,
              activeSettlement === "Kibera" && styles.activeSettlementPill,
            ]}
            onPress={() => handleSettlementSwitch("Kibera")}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.settlementPillText,
                activeSettlement === "Kibera" && styles.activeSettlementPillText,
              ]}
            >
              📍 Kibera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settlementPill,
              activeSettlement === "Mathare" && styles.activeSettlementPill,
            ]}
            onPress={() => handleSettlementSwitch("Mathare")}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.settlementPillText,
                activeSettlement === "Mathare" && styles.activeSettlementPillText,
              ]}
            >
              📍 Mathare
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legend / Status Info */}
        <View style={styles.toolbarRight}>
          <View style={styles.badgeCountBox}>
            <Text style={styles.badgeCountText}>
              {filteredServices.length} Providers Plotted
            </Text>
          </View>

          {/* Expand / Minimize Map Toggle */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
            accessibilityLabel={isExpanded ? "Minimize map" : "Expand map"}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isExpanded ? "contract-outline" : "expand-outline"}
              size={16}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Chips Horizontal Bar */}
      <View style={styles.categoryFilterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {["All", ...ALL_CATEGORIES].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.activeCategoryChipText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Map Surface (Fully Interactive Leaflet / OpenStreetMap) */}
      <View style={styles.mapSurface}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={leafletHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Interactive OpenStreetMap"
          />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: leafletHtml }}
            style={styles.webView}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "HUDUMA_SELECT_SERVICE") {
                  const match = services.find((s) => s.id === data.serviceId);
                  if (match) onSelectService(match);
                }
              } catch (e) {
                console.warn("WebView onMessage parse error", e);
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={false}
            scrollEnabled={false}
          />
        )}

        {/* Map Legend Overlay at Bottom */}
        <View style={styles.mapLegendOverlay}>
          <View style={styles.legendItem}>
            <View style={styles.legendBlueDot} />
            <Text style={styles.legendText}>Recommended</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendBlackDot} />
            <Text style={styles.legendText}>All Providers ({services.length})</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    height: 310,
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  expandedContainer: {
    height: 520,
    zIndex: 100,
  },
  topToolbar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settlementRow: {
    flexDirection: "row",
    gap: 6,
  },
  settlementPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  activeSettlementPill: {
    backgroundColor: "#000000",
  },
  settlementPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000000",
  },
  activeSettlementPillText: {
    color: "#FFFFFF",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeCountBox: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1F2937",
  },
  expandButton: {
    padding: 5,
    borderWidth: 1.5,
    borderColor: "#000000",
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  categoryFilterBar: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  activeCategoryChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  activeCategoryChipText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  mapSurface: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  mapLegendOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    flexDirection: "row",
    gap: 12,
    zIndex: 1000,
    pointerEvents: "none",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendBlueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    borderWidth: 1.5,
    borderColor: "#FBBF24",
  },
  legendBlackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  legendText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#374151",
  },
  webView: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
});
