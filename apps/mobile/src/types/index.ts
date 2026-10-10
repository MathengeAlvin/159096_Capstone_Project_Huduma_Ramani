export type ServiceCategory =
  | "Healthcare"
  | "Legal Aid"
  | "Education"
  | "Digital Literacy"
  | "Mentorship"
  | "Scholarships"
  | "Mental Health"
  | "Vocational Training";

export interface MobileService {
  id: string;
  name: string;
  category: ServiceCategory;
  settlement: "Kibera" | "Mathare";
  location: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  hours: string;
  address: string;
  phone: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface ResidentUser {
  id: string;
  name: string;
  email: string;
  settlement: "Kibera" | "Mathare";
  interests: ServiceCategory[];
}

export type MainTab = "home" | "search" | "saved" | "profile";
