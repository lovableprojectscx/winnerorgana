import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserCredits {
  id: string;
  balance: number;
  email: string;
}

export const useUserCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setCredits(null);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from("user_credits")
        .select("id, balance, email")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching credits:", error);
        setCredits(null);
      } else if (data) {
        setCredits(data);
      } else {
        // User has no credits record yet
        setCredits({ id: "", balance: 0, email: session.user.email || "" });
      }
    } catch (error) {
      console.error("Error in fetchCredits:", error);
      setCredits(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCredits();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Convert WinnerPoints to Soles (10 WP = S/1.00)
  const convertToSoles = (winnerPoints: number) => winnerPoints / 10;
  
  // Convert Soles to WinnerPoints
  const convertToWinnerPoints = (soles: number) => soles * 10;

  return {
    credits,
    isLoading,
    isAuthenticated,
    balance: credits?.balance || 0,
    balanceInSoles: convertToSoles(credits?.balance || 0),
    convertToSoles,
    convertToWinnerPoints,
    refetch: fetchCredits,
  };
};
