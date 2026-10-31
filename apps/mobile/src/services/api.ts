import { Platform, NativeModules } from "react-native";
import Constants from "expo-constants";
import {
  MobileService,
  ServiceCategory,
  ResidentUser,
  MobileApplication,
  ApplicationStatus,
} from "../types";
import { MOCK_SERVICES } from "../data/mockServices";

// Auto-detect web localhost vs dynamic Expo dev machine IP vs fallback IP
function getDevHostIp(): string {
  if (Platform.OS === "web") {
    return "localhost";
  }

  // 1. Extract host directly from Metro's bundle scriptURL (most reliable in Expo Go on Android/iOS)
  try {
    const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^:/]+)/);
      if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
        return match[1];
      }
    }
  } catch {
    // Continue to next check
  }

  // 2. Automatically resolve development PC IP from Expo config host (works across any Wi-Fi)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") return ip;
  }

  // 3. Fallback to current Wi-Fi LAN machine IP
  return "192.168.100.9";
}

const DEFAULT_HOST = `http://${getDevHostIp()}:8000/api`;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

// Helper to prevent requests from hanging indefinitely
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

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

/**
 * Logs in an existing resident against Cloud Firestore via the Django backend.
 * Returns the resident's accurate registered name, settlement, and saved interests.
 */
export async function loginResident(credentials: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: ResidentUser; error?: string }> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/login/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password.trim(),
          role: "resident",
        }),
      },
      7000
    );

    if (res.ok) {
      const data = await res.json();
      const rawSaved = data.user.saved_services || data.user.savedServices || [];
      return {
        success: true,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          settlement: data.user.settlement,
          interests: (data.user.interests as ServiceCategory[]) || [],
          savedServices: Array.isArray(rawSaved) ? rawSaved : [],
        },
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.error || "Login failed. Please check your email and password.",
    };
  } catch (err: any) {
    console.warn("[Huduma Mobile API] Login network failure:", err);
    return {
      success: false,
      error: "Unable to reach the server. Please verify your connection.",
    };
  }
}

/**
 * Registers a new resident account in Cloud Firestore.
 * Stores their real name, email, password, and settlement accurately.
 */
export async function registerResident(payload: {
  name: string;
  email: string;
  password: string;
  settlement: "Kibera" | "Mathare";
  interests?: ServiceCategory[];
}): Promise<{ success: boolean; user?: ResidentUser; error?: string }> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/register/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password.trim(),
          settlement: payload.settlement,
          role: "resident",
          interests: payload.interests || [],
        }),
      },
      7000
    );

    if (res.ok) {
      const data = await res.json();
      const rawSaved = data.user.saved_services || data.user.savedServices || [];
      return {
        success: true,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          settlement: data.user.settlement,
          interests: (data.user.interests as ServiceCategory[]) || [],
          savedServices: Array.isArray(rawSaved) ? rawSaved : [],
        },
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.error || "Registration failed. Please try again.",
    };
  } catch (err: any) {
    console.warn("[Huduma Mobile API] Registration network failure:", err);
    return {
      success: false,
      error: "Unable to connect to registration server. Please check your network.",
    };
  }
}

/**
 * Registers or logs in a resident user, persisting their account in Cloud Firestore.
 */
export async function registerOrLoginResident(user: {
  name: string;
  email: string;
  settlement: "Kibera" | "Mathare";
  interests?: ServiceCategory[];
  password?: string;
}): Promise<{ user: ResidentUser; storedInFirestore: boolean }> {
  const regResult = await registerResident({
    name: user.name,
    email: user.email,
    password: user.password || "Huduma@2026",
    settlement: user.settlement,
    interests: user.interests,
  });

  if (regResult.success && regResult.user) {
    return {
      user: regResult.user,
      storedInFirestore: true,
    };
  }

  // Graceful fallback
  return {
    user: {
      id: `res-${Date.now().toString().slice(-4)}`,
      name: user.name,
      email: user.email,
      settlement: user.settlement,
      interests: user.interests || [],
    },
    storedInFirestore: false,
  };
}

/**
 * Persists updated interest questionnaire categories to the resident's Firestore profile.
 */
export async function syncUserInterestsToFirestore(
  userId: string,
  email: string,
  interests: ServiceCategory[]
): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/interests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        email: email,
        interests: interests,
      }),
    }, 6000);
    if (res.ok) {
      const data = await res.json();
      return data.stored_in_firestore ?? false;
    }
  } catch (err) {
    console.warn("[Huduma Mobile API] Could not sync interests to Firestore:", err);
  }
  return false;
}

/**
 * Persists saved/bookmarked facility IDs to the resident's Cloud Firestore profile.
 * Ensures bookmarked facilities persist across logouts and logins.
 */
export async function syncUserBookmarksToFirestore(
  userId: string,
  email: string,
  savedServiceIds: string[]
): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/bookmarks/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          email: email,
          saved_services: savedServiceIds,
        }),
      },
      6000
    );
    if (res.ok) {
      const data = await res.json();
      return data.stored_in_firestore ?? false;
    }
  } catch (err) {
    console.warn("[Huduma Mobile API] Could not sync bookmarks to Firestore:", err);
  }
  return false;
}

/**
 * Retrieves saved/bookmarked facility IDs for a resident from Cloud Firestore.
 */
export async function fetchUserBookmarksFromFirestore(
  userId: string,
  email: string
): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth/bookmarks/?user_id=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      6000
    );
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.saved_services) ? data.saved_services : [];
    }
  } catch (err) {
    console.warn("[Huduma Mobile API] Could not fetch bookmarks from Firestore:", err);
  }
  return [];
}


/**
 * Submits an intake application to a service and provider.
 * Syncs to Django backend and Cloud Firestore 'applications' collection.
 */
export async function submitServiceApplication(payload: {
  residentId: string;
  applicantName: string;
  applicantPhone: string;
  serviceId: string;
  notes: string;
}): Promise<{ success: boolean; application?: MobileApplication; error?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/applications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resident_id: payload.residentId,
        applicant_name: payload.applicantName,
        applicant_phone: payload.applicantPhone,
        service_id: payload.serviceId,
        notes: payload.notes,
      }),
    }, 8000);

    if (res.ok) {
      const data = await res.json();
      const dateStr = data.created_at
        ? new Date(data.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Today";

      return {
        success: true,
        application: {
          id: data.application_id,
          residentId: data.resident_id,
          applicantName: data.applicant_name,
          applicantPhone: data.applicant_phone || "",
          serviceId: data.service,
          serviceTitle: data.service_title || "Community Service",
          providerId: data.provider,
          providerName: data.provider_name || "Community Provider",
          notes: data.notes || "",
          status: data.status,
          date: dateStr,
        },
      };
    }
    const errData = await res.json();
    return { success: false, error: errData.error || "Submission failed" };
  } catch (err) {
    console.warn("[Huduma Mobile API] Offline application submit fallback:", err);
    // Graceful offline fallback
    const offlineApp: MobileApplication = {
      id: `app_${Date.now().toString().slice(-6)}`,
      residentId: payload.residentId,
      applicantName: payload.applicantName,
      applicantPhone: payload.applicantPhone,
      serviceId: payload.serviceId,
      serviceTitle: "Community Service",
      providerId: "org-kibera-aid",
      providerName: "Community Provider",
      notes: payload.notes,
      status: "PENDING",
      date: "Today",
    };
    return { success: true, application: offlineApp };
  }
}

/**
 * Fetches all applications submitted by the resident, with live provider status updates.
 */
export async function fetchResidentApplications(
  residentId: string
): Promise<{ applications: MobileApplication[]; isLive: boolean }> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/applications/?resident_id=${encodeURIComponent(residentId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      6000
    );

    if (res.ok) {
      const data = await res.json();
      const results = data.results || (Array.isArray(data) ? data : []);
      const mapped: MobileApplication[] = results.map((a: any) => ({
        id: a.application_id,
        residentId: a.resident_id,
        applicantName: a.applicant_name,
        applicantPhone: a.applicant_phone || "",
        serviceId: a.service,
        serviceTitle: a.service_title || "Community Service",
        providerId: a.provider,
        providerName: a.provider_name || "Community Provider",
        notes: a.notes || "",
        status: a.status,
        date: a.created_at
          ? new Date(a.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Today",
      }));
      return { applications: mapped, isLive: true };
    }
  } catch (err) {
    console.warn("[Huduma Mobile API] Could not fetch resident applications:", err);
  }
  return { applications: [], isLive: false };
}
