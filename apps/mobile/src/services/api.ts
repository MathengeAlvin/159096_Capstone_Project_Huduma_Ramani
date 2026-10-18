import { Platform } from "react-native";
import { MobileService, ServiceCategory } from "../types";
import { MOCK_SERVICES } from "../data/mockServices";

// Auto-detect localhost vs Android emulator IP
const DEFAULT_HOST =
  Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

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

