import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import type { Team } from '@/types';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    if (!supabaseClient) return;

    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des équipes');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    // Récupérer l'utilisateur actuel
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data, error } = await supabaseClient
      .from('teams')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    setTeams(prev => [data, ...prev]);
    return data;
  };

  const deleteTeam = async (id: string) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    const { error } = await supabaseClient
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setTeams(prev => prev.filter(team => team.id !== id));
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    createTeam,
    deleteTeam,
    refetch: fetchTeams,
  };
}