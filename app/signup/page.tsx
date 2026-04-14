'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabaseClient) {
      setError('Supabase n\'est pas configuré. Vérifie tes variables d\'environnement.');
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.replace('/dashboard');
      return;
    }

    setMessage('Compte créé. Vérifie ton email pour confirmer ton adresse si nécessaire.');
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
      <h1 className="text-3xl font-semibold text-slate-100">Inscription</h1>
      <p className="mt-3 text-slate-300">
        Crée ton compte pour accéder au dashboard et gérer ton équipe.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-200">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-200">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
            required
            minLength={6}
          />
        </label>

        {error && <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        {message && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Création...' : 'Créer un compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-slate-100 hover:text-sky-300">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
