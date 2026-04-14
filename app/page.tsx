'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeHelp,
  ClipboardList,
  FileOutput,
  LayoutDashboard,
  MessageSquareHeart,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserRound
} from 'lucide-react';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';
import { useTeams } from '@/lib/useTeams';
import { supabaseClient } from '@/lib/supabaseClient';
import type { Lineup, Player } from '@/types';

type HomeSummary = {
  players: Player[];
  lineups: Lineup[];
};

const navigationCards = [
  {
    title: 'Gerer mes lignes',
    description: 'Compose rapidement tes unites 5v5, powerplay et boxplay.',
    href: '/lineups',
    icon: ClipboardList,
    accent: 'from-red-500/20 via-red-500/5 to-transparent'
  },
  {
    title: 'Mes equipes',
    description: 'Retrouve tes effectifs et bascule d’une equipe a l’autre.',
    href: '/teams',
    icon: Users,
    accent: 'from-sky-500/20 via-sky-500/5 to-transparent'
  },
  {
    title: 'Joueurs',
    description: 'Ajoute, trie et prepare chaque profil de joueur.',
    href: '/players',
    icon: Target,
    accent: 'from-emerald-500/20 via-emerald-500/5 to-transparent'
  },
  {
    title: 'Mon compte',
    description: 'Accede a ta session, tes reglages et ton espace secure.',
    href: '/dashboard',
    icon: UserRound,
    accent: 'from-amber-500/20 via-amber-500/5 to-transparent'
  }
];

const quickActions = [
  { label: 'Creer une ligne', href: '/lineups', icon: ClipboardList },
  { label: 'Ajouter un joueur', href: '/players', icon: Plus },
  { label: 'Creer une equipe', href: '/teams', icon: Users },
  { label: 'Exporter une composition', href: '/lineups', icon: FileOutput }
];

const footerLinks = [
  {
    title: 'Guide / aide',
    description: 'Premiers pas pour demarrer rapidement ton organisation.',
    href: '/dashboard',
    icon: BadgeHelp
  },
  {
    title: 'Support',
    description: 'Un bug ou une question ? Centralise tes retours ici.',
    href: '/dashboard',
    icon: ShieldCheck
  },
  {
    title: 'Donner un avis',
    description: 'Partage ton feedback pour faire evoluer Puckor.',
    href: '/dashboard',
    icon: MessageSquareHeart
  }
];

function getDisplayName(email?: string | null) {
  if (!email) return 'coach';

  const [rawName] = email.split('@');
  if (!rawName) return 'coach';

  const cleaned = rawName.split(/[._-]/)[0];
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : 'coach';
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export default function HomePage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const [summary, setSummary] = useState<HomeSummary>({ players: [], lineups: [] });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      if (!supabaseClient || !user) {
        if (active) {
          setSummary({ players: [], lineups: [] });
          setSummaryLoading(false);
        }
        return;
      }

      try {
        setSummaryLoading(true);

        const teamIds = teams.map((team) => team.id);

        const [playersResult, lineupsResult] = await Promise.all([
          supabaseClient.from('players').select('*').order('created_at', { ascending: false }),
          teamIds.length
            ? supabaseClient.from('lineups').select('*').in('team_id', teamIds).order('updated_at', { ascending: false })
            : Promise.resolve({ data: [], error: null })
        ]);

        if (!active) return;

        setSummary({
          players: playersResult.data || [],
          lineups: lineupsResult.data || []
        });
      } finally {
        if (active) {
          setSummaryLoading(false);
        }
      }
    }

    if (!teamsLoading) {
      loadSummary();
    }

    return () => {
      active = false;
    };
  }, [teams, teamsLoading, user]);

  const latestLineup = summary.lineups[0];
  const activeTeam = latestLineup
    ? teams.find((team) => team.id === latestLineup.team_id) || teams[0]
    : teams[0];

  const totalLineUnits = useMemo(
    () =>
      summary.lineups.reduce((sum, lineup) => {
        return sum + (lineup.data.lines?.filter((line) => line.players.length > 0).length || 0);
      }, 0),
    [summary.lineups]
  );

  const recentActivity = useMemo(() => {
    if (latestLineup) {
      return `Derniere mise a jour le ${formatRelativeDate(latestLineup.updated_at)}`;
    }

    if (summary.players[0]) {
      return `Dernier joueur ajoute le ${formatRelativeDate(summary.players[0].created_at)}`;
    }

    return 'Aucune activite recente pour le moment';
  }, [latestLineup, summary.players]);

  const displayName = getDisplayName(user?.email);
  const isLoading = authLoading || teamsLoading || summaryLoading;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_36%),radial-gradient(circle_at_85%_20%,_rgba(239,68,68,0.16),_transparent_24%),linear-gradient(135deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.72))]" />
        <div className="absolute -right-16 top-10 h-44 w-44 rounded-full border border-white/10 bg-white/5 blur-xl" />
        <div className="absolute bottom-[-3rem] left-[-2rem] h-36 w-36 rounded-full bg-red-500/10 blur-2xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:items-end">
          <div className="space-y-6">


            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">Accueil</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Bienvenue {displayName}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                Prepare tes lignes et domine le match avec une vue claire sur ton effectif, tes compositions et tes prochaines actions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/teams"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Gerer mon equipe
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/lineups"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Reprendre mes lignes
              </Link>
            </div>
          </div>

          
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {navigationCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20 transition duration-200 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-90 transition group-hover:opacity-100`} />
              <div className="relative space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
                  Ouvrir
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-sky-300/70">Reprendre rapidement</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-50">Continue la derniere composition</h2>
            </div>
            <LayoutDashboard className="h-6 w-6 text-sky-300" />
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-5">
            {latestLineup ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Derniere composition modifiee</p>
                  <p className="mt-1 text-xl font-semibold text-white">{latestLineup.name}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Equipe active</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">{activeTeam?.name || 'Aucune equipe'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mise a jour</p>
                    <p className="mt-2 text-sm font-medium text-slate-100">{formatRelativeDate(latestLineup.updated_at)}</p>
                  </div>
                </div>
                <Link
                  href={`/lineups?team=${latestLineup.team_id}&lineup=${latestLineup.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Continuer cette composition
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300">Aucune composition recente. Cree ton premier line-up pour gagner du temps avant le prochain match.</p>
                <Link
                  href="/lineups"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
                >
                  Creer mon premier line-up
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300/70">Actions rapides</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">Passe a l’action</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between rounded-[1.25rem] border border-slate-800 bg-slate-950/80 px-4 py-4 transition hover:border-slate-700 hover:bg-slate-950"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-100">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-200" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300/70">Resume</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">Dashboard leger</h2>

          <div className="mt-6 space-y-3">
            {[
              { label: 'Nombre d’equipes', value: teams.length },
              { label: 'Nombre de joueurs', value: summary.players.length },
              { label: 'Nombre de lignes', value: totalLineUnits }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                <span className="text-sm text-slate-300">{item.label}</span>
                <span className="text-lg font-semibold text-white">{isLoading ? '...' : item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Activite recente</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{isLoading ? 'Chargement...' : recentActivity}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {footerLinks.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-100">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-50">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-300">
                Ouvrir
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
