import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const checkPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("premium_access")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking premium status:", error);
      }

      setIsPremium(!!data);
    } catch (error) {
      console.error("Error checking premium status:", error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  return { isPremium, isLoading, checkPremiumStatus };
};