import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Bienvenue sur Reading Tracker
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Transformez votre passion pour la lecture en une aventure ludique. Suivez vos progrès, gagnez des points et débloquez des badges !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link 
              href="/register"
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Commencer l'aventure
            </Link>
            <Link 
              href="/login"
              className="px-8 py-3 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Suivi de Lecture</h3>
            <p className="text-muted-foreground">Suivez votre progression, marquez vos livres comme lus et gardez une trace de vos lectures.</p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Système de Points</h3>
            <p className="text-muted-foreground">Gagnez des points pour chaque livre terminé et progressez à travers différents niveaux.</p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-card-foreground">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Badges & Récompenses</h3>
            <p className="text-muted-foreground">Débloquez des badges pour vos réalisations et devenez un lecteur accompli.</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">4</div>
            <div className="text-muted-foreground">Niveaux</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">10+</div>
            <div className="text-muted-foreground">Badges</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">30</div>
            <div className="text-muted-foreground">Points Max</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">∞</div>
            <div className="text-muted-foreground">Possibilités</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Reading Tracker. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}