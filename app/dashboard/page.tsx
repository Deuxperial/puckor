'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  async function handleSignOut() {
    setSigningOut(true);

    if (!supabaseClient) {
      setSigningOut(false);
      return;
    }

    await supabaseClient.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300 shadow-2xl shadow-slate-950/20">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Tableau de bord</p>
          <h1 className="text-3xl font-semibold text-slate-100">Bienvenue, {user.email}</h1>
          <p className="mt-2 text-slate-300">
            Tu peux maintenant accéder aux fonctionnalités sécurisées et gérer ton équipe.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center justify-center rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Session</h2>
          <p className="mt-3 text-slate-300">Email : <span className="font-medium text-slate-100">{user.email}</span></p>
          <p className="mt-2 text-sm text-slate-500">ID utilisateur : {user.id}</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold text-slate-100">Actions rapides</h2>
          <div className="mt-3 space-y-3">
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition"
            >
              <Users className="h-4 w-4" />
              Gérer mes équipes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
