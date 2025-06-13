'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/app/providers/auth-provider';
import { MainNav } from '@/components/main-nav';
import { Toaster } from '@/components/ui/toaster';

/**
 * Configuration de la police Geist Sans pour le texte principal
 * Utilise la variable CSS --font-geist-sans
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configuration de la police Geist Mono pour le texte monospace
 * Utilise la variable CSS --font-geist-mono
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Layout principal de l'application
 * Configure la structure de base et les providers globaux
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Le contenu à afficher dans le layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Provider d'authentification pour gérer l'état de connexion */}
        <AuthProvider>
          {/* Navigation principale de l'application */}
          <MainNav />
          {/* Contenu principal de la page */}
          {children}
          {/* Système de notifications toast */}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
