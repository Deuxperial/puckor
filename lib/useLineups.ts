import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import type { Lineup, LineupData } from '@/types';

export function useLineups(teamId?: string) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLineups = async (selectedTeamId?: string) => {
    if (!supabaseClient || (!selectedTeamId && !teamId)) {
      setLineups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: err } = await supabaseClient
        .from('lineups')
        .select('*')
        .eq('team_id', selectedTeamId || teamId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setLineups(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des lineups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLineups();
  }, [teamId]);

  const createLineup = async (name: string, data: LineupData) => {
    if (!supabaseClient || !teamId) throw new Error('Équipe non sélectionnée');

    try {
      const { data: newLineup, error: err } = await supabaseClient
        .from('lineups')
        .insert([{ name, team_id: teamId, data }])
        .select()
        .single();

      if (err) throw err;
      setLineups(prev => [newLineup, ...prev]);
      return newLineup;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur lors de la création du lineup');
    }
  };

  const updateLineup = async (id: string, updates: { name?: string; data?: LineupData }) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    try {
      const { data: updated, error: err } = await supabaseClient
        .from('lineups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setLineups(prev => prev.map(lu => lu.id === id ? updated : lu));
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur lors de la mise à jour du lineup');
    }
  };

  const deleteLineup = async (id: string) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    try {
      const { error: err } = await supabaseClient
        .from('lineups')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setLineups(prev => prev.filter(lu => lu.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur lors de la suppression du lineup');
    }
  };

  const getLineup = async (id: string): Promise<Lineup | null> => {
    if (!supabaseClient) return null;

    try {
      const { data, error: err } = await supabaseClient
        .from('lineups')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      return null;
    }
  };

  return {
    lineups,
    loading,
    error,
    createLineup,
    updateLineup,
    deleteLineup,
    getLineup,
    refreshLineups: () => fetchLineups()
  };
}
