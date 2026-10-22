import { Platform } from "react-native";
import Constants from "expo-constants";
import { MobileService, ServiceCategory } from "../types";
import { MOCK_SERVICES } from "../data/mockServices";

// Auto-detect web localhost vs dynamic Expo dev machine IP vs fallback IP
function getDevHostIp(): string {
  if (Platform.OS === "web") {
    return "localhost";
  }

  // 1. Automatically resolve development PC IP from Expo bundler host (works across any Wi-Fi)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip) return ip;
  }

  // 2. Fallback to current machine Wi-Fi LAN IP
  return "10.208.40.174";
}

const DEFAULT_HOST = `http://${getDevHostIp()}:8000/api`;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

export interface RecommendationResponseItem {
  service_id: string;
  provider: string;
  provider_name?: string;
  title: string;
  category: string;
  settlement: "Kibera" | "Mathare";
  location: string;
  description: string;
  latitude?: number;
  longitude?: number;
  target_audience?: string;
  status: string;
  rating: number | null;
  review_count: number;
  hybrid_score?: number;
  rank?: number;
}

/**
 * Calculates straight-line distance in km from settlement center.
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function mapDjangoToMobileService(
  item: RecommendationResponseItem,
  settlementCenter: { lat: number; lon: number }
): MobileService {
  const lat = item.latitude ?? settlementCenter.lat;
  const lon = item.longitude ?? settlementCenter.lon;
  const dist = calculateDistance(settlementCenter.lat, settlementCenter.lon, lat, lon);

  return {
    id: item.service_id,
    name: item.title,
    category: (item.category as ServiceCategory) || "Healthcare",
    settlement: item.settlement || "Kibera",
    location: item.location || `${item.settlement} Sector`,
    distanceKm: dist > 0 ? dist : 0.8,
    rating: item.rating ?? 4.5,
    reviewCount: item.review_count || 5,
    hours: "Mon - Sat, 8:00 AM - 5:00 PM",
    address: `${item.location || item.settlement}, Nairobi`,
    phone: "+254 700 123 456",
    description:
      item.description ||
      `Community-vetted facility providing essential services in ${item.settlement}.`,
    coordinates: {
      latitude: lat,
      longitude: lon,
    },
  };
}

/**
 * Fetches ranked recommendations from the Django Hybrid Recommendation Engine.
 * Combines TF-IDF Content Similarity + NMF Collaborative Filtering + Bayesian Quality Rating.
 */
export async function fetchLiveRecommendations(
  settlement: "Kibera" | "Mathare" = "Kibera",
  interests: ServiceCategory[] = ["Healthcare"],
  limit: number = 12
): Promise<{ services: MobileService[]; isLive: boolean; weights?: any }> {
  const center =
    settlement === "Mathare"
      ? { lat: -1.2612, lon: 36.8521 }
      : { lat: -1.3142, lon: 36.7865 };

  try {
    const interestsQuery = encodeURIComponent(interests.join(","));
    const url = `${API_BASE_URL}/recommendations/?settlement=${settlement}&interests=${interestsQuery}&limit=${limit}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const items: RecommendationResponseItem[] = data.results || [];

    if (items.length > 0) {
      return {
        services: items.map((i) => mapDjangoToMobileService(i, center)),
        isLive: true,
        weights: data.weights,
      };
    }

    throw new Error("Empty recommendations response");
  } catch (err) {
    console.warn("[Huduma Mobile API] Backend unreachable, using fallback dataset:", err);
    return {
      services: MOCK_SERVICES,
      isLive: false,
    };
  }
}

/**
 * Fetches all community facilities with coordinates for mapping.
 */
export async function fetchAllServicesForMap(
  settlement?: "Kibera" | "Mathare",
  category?: string
): Promise<{ services: MobileService[]; isLive: boolean; total: number }> {
  const center =
    settlement === "Mathare"
      ? { lat: -1.2612, lon: 36.8521 }
      : { lat: -1.3142, lon: 36.7865 };

  try {
    let url = `${API_BASE_URL}/services/map_all/`;
    const params: string[] = [];
    if (settlement) params.push(`settlement=${encodeURIComponent(settlement)}`);
    if (category && category !== "All") params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const items: RecommendationResponseItem[] = data.results || [];

    if (items.length > 0) {
      return {
        services: items.map((i) => mapDjangoToMobileService(i, center)),
        isLive: true,
        total: data.count || items.length,
      };
    }
    throw new Error("No map points returned");
  } catch (err) {
    console.warn("[Huduma Mobile API] Could not load all facilities from API, using fallback:", err);
    return {
      services: MOCK_SERVICES,
      isLive: false,
      total: MOCK_SERVICES.length,
    };
  }
}

/**
 * Submits a 1-to-5 star rating to the backend and recalculates Bayesian priors.
 */
export async function submitLiveRating(
  serviceId: string,
  ratingValue: number,
  residentId: string = "resident_mobile_user"
): Promise<{ success: boolean; newRating?: number; totalReviews?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resident_id: residentId,
        service_id: serviceId,
        rating_value: ratingValue,
      }),
    });

    if (!res.ok) return { success: false };
    const data = await res.json();
    return {
      success: true,
      newRating: data.new_rating,
      totalReviews: data.total_reviews,
    };
  } catch (err) {
    console.warn("[Huduma Mobile API] Rating submission failed, handled offline:", err);
    return { success: false };
  }
}
