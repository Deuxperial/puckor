import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabaseClient) {
        if (mounted) {
          setError('Supabase n\'est pas configuré. Vérifie tes variables d\'environnement.');
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabaseClient.auth.getSession();
      if (!mounted) {
        return;
      }

      if (error) {
        setError(error.message);
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    load();

    if (!supabaseClient) {
      return;
    }

    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading, error };
}
