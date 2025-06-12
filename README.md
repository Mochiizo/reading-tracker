# 📚 Reading Tracker - Application de Suivi de Lecture Gamifiée

## 🎯 Description du Projet

Reading Tracker est une application web moderne permettant aux utilisateurs de suivre leurs lectures de manière ludique et motivante. L'application intègre un système de gamification avec des points, des niveaux et des badges pour encourager la lecture régulière.

## ✨ Fonctionnalités Principales

### 👤 Gestion des Utilisateurs
- Inscription et connexion sécurisées
- Gestion du profil utilisateur
- Modification des informations personnelles
- Suppression de compte

### 📖 Gestion des Livres
- Ajout de nouveaux livres avec détails complets
- Suivi de la progression de lecture
- Marquage des livres comme terminés
- Calcul automatique de la progression en pourcentage

### 🎮 Système de Gamification
- Attribution de points selon la longueur des livres :
  - Livres courts (< 150 pages) : 10 points
  - Livres moyens (150-300 pages) : 20 points
  - Livres longs (> 300 pages) : 30 points

### 📊 Système de Niveaux
- Niveau 1 : Débutant (0-50 points)
- Niveau 2 : Amateur (51-150 points)
- Niveau 3 : Confirmé (151-300 points)
- Niveau 4 : Expert (301+ points)

### 🏆 Système de Badges
- Badges de quantité :
  - "Première Lecture" : 1er livre
  - "Lecteur assidu" : 5 livres
  - "Bibliophile" : 20 livres
- Badges de diversité :
  - "Explorateur des genres" : 3 genres
  - "Aventurier littéraire" : 5 genres
- Badges thématiques :
  - "Lecture rapide" : 5 livres en 2 semaines
  - "Marathon de lecture" : 1 livre > 300 pages
- Badges d'objectifs :
  - "10 livres en un mois"
  - "30 livres dans l'année"

## 🛠️ Technologies Utilisées

- **Frontend** :
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui

- **Backend** :
  - Next.js API Routes
  - Prisma
  - PostgreSQL

- **Authentification** :
  - NextAuth.js

## 🚀 Installation

1. Cloner le repository :
```bash
git clone [URL_DU_REPO]
cd reading-tracker
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```
Remplir les variables nécessaires dans `.env.local`

4. Initialiser la base de données :
```bash
npx prisma generate
npx prisma db push
```

5. Lancer l'application en mode développement :
```bash
npm run dev
```

## 📝 Structure du Projet

```
reading-tracker/
├── app/                    # Routes et pages Next.js
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configurations
├── prisma/               # Schéma et migrations Prisma
├── public/               # Assets statiques
└── types/                # Types TypeScript
```

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Protection des routes API
- Validation des données
- Gestion sécurisée des sessions

## 🧪 Tests

```bash
# Lancer les tests
npm run test

# Lancer les tests avec couverture
npm run test:coverage
```

## 📈 Déploiement

L'application peut être déployée sur Vercel :

```bash
npm run build
vercel deploy
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- [Hautbois Mathis] - Développeur Principal
