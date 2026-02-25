// /hooks/useUserProfile.ts
"use client"

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  name: string;
  avatar_url?: string;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Busca profile no Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // perfil não existe → cria
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user.id, name: user.email })
          .select("*")
          .single();

        if (insertError) console.error("Erro ao criar profile:", insertError);
        setProfile(newProfile || null);
      } else {
        setProfile(data || null);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}