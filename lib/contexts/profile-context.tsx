"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { RestaurantProfile, UserProfile } from "@/lib/types"

interface ProfileContextType {
  restaurantProfile: RestaurantProfile | null
  userProfile: UserProfile | null
  setRestaurantProfile: (profile: RestaurantProfile | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  refreshProfiles: () => Promise<void>
  isLoading: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const [profileRes, userRes] = await Promise.all([fetch("/api/profile"), fetch("/api/user")])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setRestaurantProfile(profileData)
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserProfile(userData)
      }
    } catch (error) {
      console.error("Error refreshing profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <ProfileContext.Provider
      value={{
        restaurantProfile,
        userProfile,
        setRestaurantProfile,
        setUserProfile,
        refreshProfiles,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
