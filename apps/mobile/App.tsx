import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  ResidentUser,
  MobileService,
  MainTab,
  ServiceCategory,
  MobileApplication,
} from "./src/types";
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
  loginResident,
  registerResident,
  syncUserInterestsToFirestore,
  fetchResidentApplications,
  submitServiceApplication,
  syncUserBookmarksToFirestore,
  fetchUserBookmarksFromFirestore,
} from "./src/services/api";

export default function App() {
  // Start unauthenticated so user can Register or Log In
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentUser, setCurrentUser] = useState<ResidentUser>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedService, setSelectedService] = useState<MobileService | null>(null);

  // Default to empty array - accurately tracks user-saved facilities
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const [services, setServices] = useState<MobileService[]>(MOCK_SERVICES);
  const [mapServices, setMapServices] = useState<MobileService[]>(MOCK_SERVICES);
  const [userApplications, setUserApplications] = useState<MobileApplication[]>([]);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load recommendations, map facilities, and applications on auth and settlement change
  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      loadRecommendations(currentUser.settlement, currentUser.interests);
      loadUserApplications(currentUser.id);
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

  const loadUserApplications = async (userId: string) => {
    try {
      const res = await fetchResidentApplications(userId);
      setUserApplications(res.applications);
    } catch {
      setUserApplications([]);
    }
  };

  const handleSettlementChange = (newSettlement: "Kibera" | "Mathare") => {
    setCurrentUser((prev) => ({ ...prev, settlement: newSettlement }));
    loadRecommendations(newSettlement, currentUser.interests);
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    settlement: "Kibera" | "Mathare";
  }): Promise<{ success: boolean; error?: string }> => {
    const res = await registerResident(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      // New account -> trigger questionnaire to select interests
      setIsOnboarded(false);
      if (res.user.savedServices && Array.isArray(res.user.savedServices)) {
        setBookmarkedIds(res.user.savedServices);
      }
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed." };
  };

  const handleLogin = async (data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const res = await loginResident(data);
    if (res.success && res.user) {
      const activeUser = res.user;
      setCurrentUser(activeUser);
      setIsAuthenticated(true);

      // Restore saved organizations accurately from Cloud Firestore
      if (activeUser.savedServices && Array.isArray(activeUser.savedServices)) {
        setBookmarkedIds(activeUser.savedServices);
      } else {
        fetchUserBookmarksFromFirestore(activeUser.id, activeUser.email).then((saved) => {
          if (saved && saved.length > 0) setBookmarkedIds(saved);
        });
      }

      if (!activeUser.interests || activeUser.interests.length === 0) {
        // No interests chosen yet -> questionnaire
        setIsOnboarded(false);
      } else {
        setIsOnboarded(true);
        setActiveTab("home");
        loadRecommendations(activeUser.settlement, activeUser.interests);
        loadUserApplications(activeUser.id);
      }
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed." };
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
    loadUserApplications(updatedUser.id);
  };

  const handleToggleBookmark = (serviceId: string) => {
    const updated = bookmarkedIds.includes(serviceId)
      ? bookmarkedIds.filter((id) => id !== serviceId)
      : [...bookmarkedIds, serviceId];
    setBookmarkedIds(updated);

    // Persist bookmarked organizations to Cloud Firestore immediately under resident profile
    if (currentUser?.id) {
      syncUserBookmarksToFirestore(currentUser.id, currentUser.email, updated);
    }
  };

  const handleRateService = async (serviceId: string, rating: number) => {
    await submitLiveRating(serviceId, rating, currentUser.id);
  };

  const handleApplyForService = async (
    serviceId: string,
    phone: string,
    notes: string
  ): Promise<boolean> => {
    const res = await submitServiceApplication({
      residentId: currentUser.id,
      applicantName: currentUser.name,
      applicantPhone: phone,
      serviceId,
      notes,
    });

    if (res.success && res.application) {
      setUserApplications((prev) => [
        res.application!,
        ...prev.filter((a) => a.id !== res.application!.id),
      ]);
      return true;
    }
    return false;
  };

  // Derive accurately saved facilities from actual loaded services list
  const savedServicesList = useMemo(() => {
    const all = [...services, ...mapServices];
    const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
    return unique.filter((s) => bookmarkedIds.includes(s.id));
  }, [services, mapServices, bookmarkedIds]);

  let screenContent = null;

  if (!isAuthenticated) {
    screenContent = <AuthScreen onRegister={handleRegister} onLogin={handleLogin} />;
  } else if (!isOnboarded) {
    screenContent = (
      <OnboardingScreen
        initialSelected={currentUser.interests}
        onComplete={handleOnboardingComplete}
      />
    );
  } else if (selectedService) {
    const existingApp = userApplications.find(
      (a) => a.serviceId === selectedService.id
    );

    screenContent = (
      <ServiceDetailScreen
        service={selectedService}
        user={currentUser}
        onBack={() => setSelectedService(null)}
        isBookmarked={bookmarkedIds.includes(selectedService.id)}
        onToggleBookmark={handleToggleBookmark}
        onRateService={handleRateService}
        existingApplication={existingApp}
        onApplyForService={handleApplyForService}
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
            onRefresh={() => {
              loadRecommendations(currentUser.settlement, currentUser.interests);
              loadUserApplications(currentUser.id);
            }}
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
            savedServices={savedServicesList}
            onSelectService={setSelectedService}
            onRemoveBookmark={handleToggleBookmark}
          />
        );
        break;
      case "profile":
        screenContent = (
          <ProfileScreen
            user={currentUser}
            applications={userApplications}
            onRefreshApplications={() => loadUserApplications(currentUser.id)}
            onSelectServiceById={(serviceId) => {
              const all = [...services, ...mapServices];
              const target = all.find((s) => s.id === serviceId);
              if (target) {
                setSelectedService(target);
              }
            }}
            onEditInterests={() => setIsOnboarded(false)}
            onLogout={() => {
              setIsAuthenticated(false);
              setIsOnboarded(false);
              setSelectedService(null);
              setBookmarkedIds([]);
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
            savedCount={savedServicesList.length}
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
