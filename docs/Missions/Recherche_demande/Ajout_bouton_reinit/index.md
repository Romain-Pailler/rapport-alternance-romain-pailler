---
sidebar_label: Contexte
sidebar_position: 1
tags:
  - Migration
  - Angular
---

# Bouton Réinitialiser

## Objectif du ticket

Ce ticket fait partie des premières fonctionnalités développées dans le cadre de la refonte de l’écran de recherche. Il s’agit d’un **développement simple mais très apprécié côté utilisateurs** : permettre, en un clic, de **réinitialiser tous les filtres** du formulaire de recherche.

C’est ce qu’on appelle une **quick win** : un développement rapide à mettre en place, mais qui améliore de façon concrète et immédiate l’expérience utilisateur.

## Ticket

## Une mise en œuvre complète côté client

Pour cette tâche, j’ai uniquement géré le développement côté Angular. Cela m’a permis de :

- **Créer la logique de remise à zéro** des champs dans le composant via `formGroup.reset()`.
- **Vider les résultats affichés** pour revenir à un état neutre.
- **Nettoyer l’URL** en supprimant tous les `queryParams` liés à la recherche.

---

[Lien vers le développement côté client](./Cote-client.md)
