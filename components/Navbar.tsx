'use client';

import Link from 'next/link';
import { Menu, Trophy, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Equipes', href: '/teams' },
  { label: 'Joueurs', href: '/players' },
  { label: 'Line-ups', href: '/lineups' },
  { label: 'Dashboard', href: '/dashboard' }
];

function getInitial(email?: string | null) {
  if (!email) return 'P';
  return email.charAt(0).toUpperCase();
}

export default function Navbar() {
  const { user, loading } = useSupabaseAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-slate-100" onClick={closeMobileMenu}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sky-300 ring-1 ring-slate-800">
            <Trophy className="h-5 w-5" />
          </span>
          <span>Puckor</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 p-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          {loading ? (
            <div className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/80" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              title={user.email || 'Mon compte'}
            >
              {user.email ? (
                <span className="text-sm font-semibold">{getInitial(user.email)}</span>
              ) : (
                <UserRound className="h-4 w-4" />
              )}
            </Link>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link href="/login" className="font-medium text-slate-400 transition hover:text-slate-100">
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 md:hidden"
          type="button"
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-6 py-4 md:hidden sm:px-8">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="block rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-800 pt-4">
            {loading ? (
              <div className="h-11 rounded-2xl border border-slate-800 bg-slate-900/70" />
            ) : user ? (
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-100">
                  {user.email ? <span className="text-sm font-semibold">{getInitial(user.email)}</span> : <UserRound className="h-4 w-4" />}
                </span>
                <span>Mon compte</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
