# Système de Line-up Interactif - Puckor

## 📋 Vue d'ensemble

Un système complet pour créer et gérer les formations (line-ups) de votre équipe de hockey avec une interface glisser-déposer intuitive.

## 🚀 Fonctionnalités implémentées

### ✅ Composants créés

1. **Rink.tsx** - Patinoire visuelle interactive
   - Affichage graphique de la glace
   - Positions des joueurs en temps réel
   - Drag & drop pour repositionner les joueurs
   - Légende des positions (couleurs)

2. **PlayerSelector.tsx** - Sélecteur de joueurs
   - Liste des joueurs disponibles
   - Organisation par ligne (Défense, Ligne 1/2/3, Banc)
   - Limite du nombre de joueurs par ligne
   - Boutons rapides pour ajouter/retirer des joueurs

3. **Page Lineups** - Interface complète
   - Sélection d'équipe
   - Création de nouveaux line-ups
   - Chargement de line-ups existants
   - Sauvegarde/suppression

### ✅ Base de données

Table `lineups` créée avec :
- `id` : Identifiant unique
- `name` : Nom du line-up
- `team_id` : Référence à l'équipe
- `data` : JSON avec positions des joueurs
- Timestamps de création/modification
- Politiques RLS pour sécurisé par équipe

### ✅ Hooks

**useLineups.ts** - Gestion complète des line-ups
- Récupération des line-ups
- Création/modification/suppression
- Chargement d'un line-up spécifique

## 📝 Prochaines étapes

### 1. Exécuter le script SQL (IMPORTANT)
```sql
-- Copier-coller le contenu du fichier supabase-lineups.sql 
-- dans l'éditeur SQL de Supabase et exécuter
```

### 2. Utilisation dans l'application

#### Créer un nouveau line-up
1. Allez à `/lineups` ou cliquez sur "Line-ups" dans la menu
2. Sélectionnez une équipe
3. Glissez-déposez les joueurs sur la patinoire
4. Organisez-les par ligne
5. Cliquez "Sauvegarder" et donnez un nom

#### Charger un line-up existant
1. Sélectionnez l'équipe
2. Scroll jusqu'à "Mes Line-ups"
3. Cliquez "Charger" pour éditer ou "Poubelle" pour supprimer

### 3. Améliorations futures (optionnelles)

**Niveau 1 - Essentials**
```typescript
// Statistiques des line-ups
- Temps de jeu moyen par joueur
- Historique des compositions
- Duos/trios efficaces

// Comparaison
- Comparer 2 line-ups
```

**Niveau 2 - Pro**
```typescript
// IA/Suggestions
- Formations optimales par position
- Suggestions automatiques
- Analyse des performances

// Partage
- Exporter en image/PDF
- Code partage
- Équipes multi-utilisateurs
```

**Niveau 3 - Avancé**
```typescript
// Statistiques avancées
- Performance des line-ups
- Matchups gagnants
- Tendances temporelles

// Intégrations
- Import depuis API hockey
- Synchronisation multi-appareils
```

## 🎮 Guide d'utilisation

### Créer un line-up en 30 secondes

1. **Sélectionner équipe** → Dropdown "Sélectionner une équipe"
2. **Ajouter joueurs** → Cliquer bouton "Déf"/"L1"/"L2"/"L3" près du joueur
3. **Positionner** → Glisser les numéros sur la rink
4. **Sauvegarder** → Bouton "Sauvegarder" + nom du lineup

### Règles de composition

| Ligne      | Min | Max | Description |
|-----------|-----|-----|------------|
| Défense   | 0   | 2   | Défenseurs sur la rink |
| Ligne 1   | 0   | 3   | 1ère ligne d'attaque |
| Ligne 2   | 0   | 3   | 2ème ligne d'attaque |
| Ligne 3   | 0   | 3   | 3ème ligne d'attaque |
| Banc      | 0   | 12  | Joueurs en réserve |

### Coloris des positionel

- 🔴 Rouge = Gardien
- 🔵 Bleu = Défenseur
- 🟢 Vert = Attaquant (Centre/Ailier)

## 📂 Structure du projet

```
lib/
  ├── useLineups.ts              ← Hook pour gérer les line-ups
  
components/
  ├── Rink.tsx                   ← Affichage de la patinoire
  ├── PlayerSelector.tsx         ← Sélection des joueurs
  
app/
  ├── lineups/
  │   └── page.tsx               ← Page principale

types/
  └── index.ts                   ← Types (Lineup, RinkPosition)

supabase-lineups.sql             ← Script de migration
```

## 🔒 Sécurité

- Politiques RLS par équipe
- Chaque utilisateur ne voit que ses line-ups
- Données encryptées en JSON

## 🎨 Responsive

- ✅ Desktop : Layout 3-colonnes
- ✅ Tablette : Layout responsive
- ✅ Mobile : Empilé vertical

## 💡 Tips

- **Drag & Drop rapide** : Double-cliquer un joueur pour l'ajouter à la ligne par défaut
- **Positions** : Astuce - glissez près des cercles bleus pour les zones d'attaque
- **Sauvegarde** : Nommez clairement ('Match Day 1', 'Pratique', etc.)
- **Édition** : Chargez un line-up existant pour le modifier

## ❓ FAQ

**Q: Combien de line-ups peux-je créer ?**
A: Illimité ! Sauvegardez autant que vous voulez.

**Q: Je peux partager des line-ups avec mon équipe ?**
A: Pas encore, mais c'est prévu dans les améliorations futures.

**Q: Les joueurs se souviennent-ils de leurs positions ?**
A: Oui, chaque line-up sauvegarde exactement où était chaque joueur.

**Q: Comment je réinitialise un line-up ?**
A: Cliquez "Réinitialiser" pour vider complètement la composition.

## 🐛 Troubleshooting

**Erreur "Could not find the table 'public.lineups'"**
→ Exécutez le script `supabase-lineups.sql` dans Supabase

**Les joueurs ne se déplacent pas**
→ Assurez-vous que la rink est en mode "Modifiable" (isEditable=true)

**Les line-ups ne se sauvegardent pas**
→ Vérifiez les politiques RLS dans Supabase

---

**Créé avec ❤️ pour les passionnés de hockey**
