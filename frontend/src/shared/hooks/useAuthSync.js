import { useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import { diagnose } from "@/features/detection/api";

export function useAuthSync() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        const pendingAnswersRaw = localStorage.getItem("pending_answers");
        if (pendingAnswersRaw) {
          try {
            const parsedAnswers = JSON.parse(pendingAnswersRaw);
            const diagRes = await diagnose(parsedAnswers, session.user.email);
            localStorage.setItem("latest_diagnosis", JSON.stringify(diagRes.data));
            localStorage.removeItem("pending_answers");
            console.log("App: Successfully synced pending diagnosis to DB.");
          } catch (syncErr) {
            console.error("App: Failed to sync pending diagnosis:", syncErr);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
