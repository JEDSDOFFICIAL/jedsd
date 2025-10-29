"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { User } from "@prisma/client";

// Cache to store user data and prevent duplicate API calls
const userDataCache = new Map<string, { data: User; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserData() {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<string | null>(null);

  const fetchUserDetails = useCallback(async (email: string) => {
    // Prevent duplicate calls for the same email
    if (fetchingRef.current === email || !email) return;

    // Check cache first
    const cached = userDataCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Using cached user data for:", email);
      setUserDetails(cached.data);
      return;
    }

    console.log("Fetching fresh user data for:", email);
    try {
      setIsLoading(true);
      setError(null);
      fetchingRef.current = email;

      const response = await axios.get(`/api/user?email=${email}`);
      const userData = response.data;

      // Update cache
      userDataCache.set(email, {
        data: userData,
        timestamp: Date.now(),
      });

      setUserDetails(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user details";
      console.error("Failed to fetch user details:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      fetchingRef.current = null;
    }
  }, []);

  // Fetch user details when session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserDetails(session.user.email);
    } else {
      setUserDetails(null);
      setError(null);
    }
  }, [session?.user?.email, fetchUserDetails]);

  // Handle role changes
  useEffect(() => {
    const handleRoleChange = () => {
      if (session?.user?.email) {
        // Clear cache for current user to force refresh
        userDataCache.delete(session.user.email);
        fetchUserDetails(session.user.email);
      }
    };

    window.addEventListener("userRoleChanged", handleRoleChange);
    return () => window.removeEventListener("userRoleChanged", handleRoleChange);
  }, [session?.user?.email, fetchUserDetails]);

  const refreshUserData = useCallback(() => {
    if (session?.user?.email) {
      userDataCache.delete(session.user.email);
      fetchUserDetails(session.user.email);
    }
  }, [session?.user?.email, fetchUserDetails]);

  return {
    userDetails,
    isLoading,
    error,
    refreshUserData,
  };
}