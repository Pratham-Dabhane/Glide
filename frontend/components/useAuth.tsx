'use client'

import { useUser } from '@clerk/nextjs'

export function useAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()

  return {
    user: clerkUser ? {
      id: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      emailAddress: clerkUser.primaryEmailAddress?.emailAddress,
      fullName: clerkUser.fullName
    } : null,
    isLoaded: clerkLoaded,
    isSignedIn: !!clerkUser
  }
}