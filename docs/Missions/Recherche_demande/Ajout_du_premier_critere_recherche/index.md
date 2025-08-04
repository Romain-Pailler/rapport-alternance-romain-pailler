---
sidebar_label: "Contexte"
sidebar_position: -1
tags:
  - Développement
---

# Ajout du premier filtre de recherche – N° de dossier

## Objectif

Après avoir mis en place un affichage basique des résultats (notre “skateboard”), la prochaine étape naturelle était d’introduire un **premier critère de filtrage** : celui par **numéro de dossier** (`code`).  
Ce critère est central pour les utilisateurs, car il permet de retrouver **précisément une demande** à partir de son identifiant.

Ce ticket marque donc le **début de la construction réelle du formulaire de recherche**, en instaurant les fondations du `FormGroup` Angular et la gestion des paramètres d’URL.

## Rôle du ticket dans le projet

Ce développement m’a permis de :

- Mettre en place le **premier champ de formulaire** lié à un filtre.
- Gérer la **navigation via queryParams** (mise à jour de l’URL).
- **Relancer la recherche automatiquement** à chaque changement dans les paramètres d’URL.
- Préparer le système pour accueillir les filtres suivants de façon cohérente.

Il s’agit donc d’un **ticket de transition**, entre la simple récupération de résultats et une **logique de recherche avancée multi-critères**.

## Ticket


## Liens vers les explications détaillées

- [Voir le code côté client (Angular)](./Cote-client.md)

---
