"use client";

import { createContext, useContext, type ReactNode } from "react";
import useSWR from "swr";
import type { RestaurantProfile, UserProfile } from "@/lib/types";

interface ProfileContextType {
  restaurantProfile: RestaurantProfile | null;
  userProfile: UserProfile | null;
  refreshProfiles: () => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const fetcher = (url: string) =>
  fetch(url).then((res) => (res.ok ? res.json() : null));

export function ProfileProvider({ children }: { children: ReactNode }) {
  const {
    data: restaurantProfile,
    isLoading: isLoadingRestaurant,
    mutate: mutateRestaurant,
  } = useSWR<RestaurantProfile | null>("/api/profile", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const {
    data: userProfile,
    isLoading: isLoadingUser,
    mutate: mutateUser,
  } = useSWR<UserProfile | null>("/api/user", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const refreshProfiles = async () => {
    await Promise.all([mutateRestaurant(), mutateUser()]);
  };

  const isLoading = isLoadingRestaurant || isLoadingUser;

  return (
    <ProfileContext.Provider
      value={{
        restaurantProfile: restaurantProfile ?? null,
        userProfile: userProfile ?? null,
        refreshProfiles,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
