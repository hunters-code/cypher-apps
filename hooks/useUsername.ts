/**
 * Hook for username availability checking
 */

import { useState, useCallback } from "react";

import { checkUsernameAvailability } from "@/lib/blockchain";

import { useBaseProvider } from "./useBlockchain";

export function useUsername() {
  const provider = useBaseProvider();
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);

  const checkAvailability = useCallback(
    async (username: string) => {
      if (!provider || !username.trim()) {
        setAvailability(null);
        return null;
      }

      setIsChecking(true);
      try {
        // Remove @ prefix if present
        const cleanUsername = username.replace(/^@+/, "");
        const isAvailable = await checkUsernameAvailability(
          provider,
          cleanUsername
        );
        setAvailability(isAvailable);
        return isAvailable;
      } catch (error) {
        console.error("Error checking username availability:", error);
        setAvailability(null);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [provider]
  );

  return {
    checkAvailability,
    isChecking,
    availability,
  };
}
