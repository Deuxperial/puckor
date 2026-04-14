import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import type { Player } from '@/types';

export function usePlayers(teamId?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = async (selectedTeamId?: string) => {
    if (!supabaseClient) return;

    try {
      setLoading(true);
      let query = supabaseClient
        .from('players')
        .select('*')
        .order('number', { ascending: true });

      if (selectedTeamId || teamId) {
        query = query.eq('team_id', selectedTeamId || teamId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des joueurs');
    } finally {
      setLoading(false);
    }
  };

  const createPlayer = async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    const { data, error } = await supabaseClient
      .from('players')
      .insert([playerData])
      .select()
      .single();

    if (error) throw error;
    setPlayers(prev => [...prev, data].sort((a, b) => a.number - b.number));
    return data;
  };

  const updatePlayer = async (id: string, updates: Partial<Omit<Player, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    const { data, error } = await supabaseClient
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setPlayers(prev => prev.map(player =>
      player.id === id ? data : player
    ).sort((a, b) => a.number - b.number));
    return data;
  };

  const deletePlayer = async (id: string) => {
    if (!supabaseClient) throw new Error('Supabase non configuré');

    const { error } = await supabaseClient
      .from('players')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setPlayers(prev => prev.filter(player => player.id !== id));
  };

  useEffect(() => {
    fetchPlayers();
  }, [teamId]);

  return {
    players,
    loading,
    error,
    createPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers,
  };
}