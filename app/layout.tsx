import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './global.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Puckor - Gestion d\'équipe de hockey',
  description: 'Base moderne Next.js pour une application de gestion d\'équipe de hockey.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
