export type ServiceCategory =
  | "Healthcare"
  | "Legal Aid"
  | "Education"
  | "Mentorship"
  | "Vocational Training"
  | "Scholarships"
  | "Digital Literacy"
  | "Mental Health";

export type ListingStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface ServiceListing {
  id: string;
  name: string;
  category: ServiceCategory;
  settlement: "Kibera" | "Mathare";
  location: string;
  lat?: number;
  lng?: number;
  operatingHours: string;
  description: string;
  status: ListingStatus;
  rating: number | null;
  reviewCount: number;
  contactEmail?: string;
  contactPhone?: string;
}

export type ApplicationStatus = "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";

export interface ServiceApplication {
  id: string;
  applicantName: string;
  serviceRequested: string;
  serviceId: string;
  date: string;
  status: ApplicationStatus;
  notes?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  sublabel?: string;
}

export interface ProviderOrganization {
  id: string;
  name: string;
  shortName: string;
  email: string;
  settlement: "Kibera" | "Mathare";
  verified: boolean;
}
