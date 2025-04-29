"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

type ProfileContextType = {
  selectedProfile: string | null
  selectProfile: (profileName: string) => void
  clearProfile: () => void
  isLoading: boolean
}

const ProfileContext = createContext<ProfileContextType>({
  selectedProfile: null,
  selectProfile: () => {},
  clearProfile: () => {},
  isLoading: false,
})

export const useProfile = () => useContext(ProfileContext)

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectProfile = (profileName: string) => {
    setIsLoading(true)
    setSelectedProfile(profileName)
    setIsLoading(false)
  }

  const clearProfile = () => {
    setSelectedProfile(null)
  }

  return (
    <ProfileContext.Provider value={{ selectedProfile, selectProfile, clearProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  )
}
