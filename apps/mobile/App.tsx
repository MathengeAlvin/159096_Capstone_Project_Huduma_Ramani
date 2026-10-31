import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ResidentUser, MobileService, MainTab, ServiceCategory } from "./src/types";
import { INITIAL_USER, MOCK_SERVICES } from "./src/data/mockServices";
import { AuthScreen } from "./src/screens/AuthScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { ServiceDetailScreen } from "./src/screens/ServiceDetailScreen";
import { SavedScreen } from "./src/screens/SavedScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { BottomNavBar } from "./src/components/BottomNavBar";
import {
  fetchLiveRecommendations,
  submitLiveRating,
  fetchAllServicesForMap,
  registerOrLoginResident,
  syncUserInterestsToFirestore,
} from "./src/services/api";

export default function App() {
  // Start unauthenticated so user can Register or Log In
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentUser, setCurrentUser] = useState<ResidentUser>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedService, setSelectedService] = useState<MobileService | null>(null);

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    "srv-002",
    "srv-003",
    "srv-005",
  ]);

  const [services, setServices] = useState<MobileService[]>(MOCK_SERVICES);
  const [mapServices, setMapServices] = useState<MobileService[]>(MOCK_SERVICES);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load recommendations and map facilities when user authenticates and on settlement changes
  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      loadRecommendations(currentUser.settlement, currentUser.interests);
    }
  }, [isAuthenticated, isOnboarded, currentUser.settlement]);

  const loadRecommendations = async (
    settlement: "Kibera" | "Mathare",
    interests: ServiceCategory[]
  ) => {
    setIsLoading(true);
    try {
      const [recRes, mapRes] = await Promise.all([
        fetchLiveRecommendations(settlement, interests, 15),
        fetchAllServicesForMap(settlement),
      ]);
      setServices(recRes.services);
      setMapServices(mapRes.services);
      setIsLiveApi(recRes.isLive || mapRes.isLive);
    } catch {
      setIsLiveApi(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettlementChange = (newSettlement: "Kibera" | "Mathare") => {
    setCurrentUser((prev) => ({ ...prev, settlement: newSettlement }));
    loadRecommendations(newSettlement, currentUser.interests);
  };

  const handleAuthSuccess = async (user: ResidentUser, isNewUser: boolean) => {
    // 1. Persist or fetch resident profile in Cloud Firestore via Django backend
    const syncRes = await registerOrLoginResident(user);
    const activeUser = syncRes.user;
    setCurrentUser(activeUser);
    setIsAuthenticated(true);

    if (isNewUser || !activeUser.interests || activeUser.interests.length === 0) {
      // New account or no interests selected -> trigger questionnaire
      setIsOnboarded(false);
    } else {
      setIsOnboarded(true);
      setActiveTab("home");
      loadRecommendations(activeUser.settlement, activeUser.interests);
    }
  };

  const handleOnboardingComplete = (selectedInterests: ServiceCategory[]) => {
    const updatedUser = {
      ...currentUser,
      interests: selectedInterests,
    };
    setCurrentUser(updatedUser);
    setIsOnboarded(true);
    setActiveTab("home");

    // 1. Persist selected interest categories directly into Cloud Firestore
    syncUserInterestsToFirestore(updatedUser.id, updatedUser.email, selectedInterests);

    // 2. Query the hybrid ML recommendation engine with the selected questionnaire interests
    loadRecommendations(updatedUser.settlement, selectedInterests);
  };

  const handleToggleBookmark = (serviceId: string) => {
    if (bookmarkedIds.includes(serviceId)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== serviceId));
    } else {
      setBookmarkedIds([...bookmarkedIds, serviceId]);
    }
  };

  const handleRateService = async (serviceId: string, rating: number) => {
    // 1. Submit to Django Bayesian rating endpoint
    await submitLiveRating(serviceId, rating, currentUser.id);

    // 2. Update local state
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const newReviewCount = s.reviewCount + 1;
          const newRating = (s.rating * s.reviewCount + rating) / newReviewCount;
          return {
            ...s,
            rating: parseFloat(newRating.toFixed(1)),
            reviewCount: newReviewCount,
          };
        }
        return s;
      })
    );
  };

  // Screen routing
  let screenContent = null;

  if (!isAuthenticated) {
    screenContent = <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  } else if (!isOnboarded) {
    screenContent = (
      <OnboardingScreen
        initialSelected={currentUser.interests}
        onComplete={handleOnboardingComplete}
      />
    );
  } else if (selectedService) {
    screenContent = (
      <ServiceDetailScreen
        service={selectedService}
        onBack={() => setSelectedService(null)}
        isBookmarked={bookmarkedIds.includes(selectedService.id)}
        onToggleBookmark={handleToggleBookmark}
        onRateService={handleRateService}
      />
    );
  } else {
    switch (activeTab) {
      case "home":
        screenContent = (
          <HomeScreen
            user={currentUser}
            services={services}
            mapServices={mapServices}
            onSelectService={setSelectedService}
            onSearchPress={() => setActiveTab("search")}
            onSettlementChange={handleSettlementChange}
            isLive={isLiveApi}
            isLoading={isLoading}
            onRefresh={() =>
              loadRecommendations(currentUser.settlement, currentUser.interests)
            }
          />
        );
        break;
      case "search":
        screenContent = (
          <SearchScreen
            services={services}
            onSelectService={setSelectedService}
          />
        );
        break;
      case "saved":
        screenContent = (
          <SavedScreen
            savedServices={services.filter((s) => bookmarkedIds.includes(s.id))}
            onSelectService={setSelectedService}
            onRemoveBookmark={handleToggleBookmark}
          />
        );
        break;
      case "profile":
        screenContent = (
          <ProfileScreen
            user={currentUser}
            onEditInterests={() => setIsOnboarded(false)}
            onLogout={() => {
              setIsAuthenticated(false);
              setIsOnboarded(false);
              setSelectedService(null);
            }}
          />
        );
        break;
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.appRoot}>
        <StatusBar style="dark" />
        <View style={styles.mainContent}>{screenContent}</View>

        {/* Show bottom navigation only when authenticated and inside main flow */}
        {isAuthenticated && isOnboarded && !selectedService && (
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setSelectedService(null);
              setActiveTab(tab);
            }}
            savedCount={bookmarkedIds.length}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
  },
});
