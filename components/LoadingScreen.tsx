'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard'); // Redirige vers le tableau de bord après le délai
    }, Math.random() * 5000 + 2000); // Durée aléatoire entre 5 et 10 secondes

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A2980] to-[#26D0CE] text-white flex-col space-y-8">
      <div className="relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-white/70"></div>
        <div className="absolute text-2xl font-bold">⏳</div>
      </div>
      <p className="text-3xl font-semibold">Chargement de votre aventure...</p>
      <p className="text-xl text-white/80">Préparez-vous à plonger dans vos lectures !</p>
    </div>
  );
} 