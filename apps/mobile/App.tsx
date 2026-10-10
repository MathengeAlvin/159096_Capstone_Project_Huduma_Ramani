import React, { useState } from "react";
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [currentUser, setCurrentUser] = useState<ResidentUser>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedService, setSelectedService] = useState<MobileService | null>(null);
  
  // Bookmarked services initial state matching Screenshot 142413:
  // Kibera Health Clinic (srv-002), Soma Tech Hub (srv-003), Youth Mentorship Program (srv-005)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    "srv-002",
    "srv-003",
    "srv-005",
  ]);

  const [services, setServices] = useState<MobileService[]>(MOCK_SERVICES);

  const handleAuthSuccess = (user: ResidentUser, isNewUser: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (isNewUser) {
      setIsOnboarded(false);
    } else {
      setIsOnboarded(true);
      setActiveTab("home");
    }
  };

  const handleOnboardingComplete = (selectedInterests: ServiceCategory[]) => {
    setCurrentUser({
      ...currentUser,
      interests: selectedInterests,
    });
    setIsOnboarded(true);
    setActiveTab("home");
  };

  const handleToggleBookmark = (serviceId: string) => {
    if (bookmarkedIds.includes(serviceId)) {
      setBookmarkedIds(bookmarkedIds.filter((id) => id !== serviceId));
    } else {
      setBookmarkedIds([...bookmarkedIds, serviceId]);
    }
  };

  const handleRateService = (serviceId: string, rating: number) => {
    setServices(
      services.map((s) => {
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
            onSelectService={setSelectedService}
            onSearchPress={() => setActiveTab("search")}
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
