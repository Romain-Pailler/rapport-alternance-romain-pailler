---
sidebar_label: "Corrections de bug"
sidebar_position: 2
tags:
  - Bug
---

# Corrections de bug

## Contexte

Une fois les développements des nouvelles fonctionnalités terminés, ils sont mergés dans les **environnements de tests**.  
Julien, analyste testeur, vérifie alors que les livrables correspondent aux besoins et identifie d’éventuels bugs. Lorsqu’un défaut est détecté, il rédige un ticket de correctif afin que la version testée soit immédiatement corrigée. À chaque sprint, un développeur est désigné pour la **maintenance** : il doit se consacrer à la résolution des tickets ouverts.

## Ce que j’ai fait

Durant ma première période en entreprise, de septembre à décembre, j’ai participé à la correction des bugs. Cette mission m’a permis de me familiariser avec l’architecture de l’application, de comprendre le code existant et d’acquérir les bonnes pratiques pour analyser et corriger les anomalies.

Voici la liste de toutes les corrections que j'ai réaliser :

- [ML-14952](./liste/ML-14952) **[Pièce comptable]** Revoir le fonctionnement du filtre "Pièce créée entre..." et "... le"
- [ML-15002](./liste/ML-15002) **[Pièce comptable]** Le choix du loueur fait bouger les pièces comptables
- [ML-12242](./liste/ML-12242) Supprimer le bouton "Défendre le dossier" dans l'onglet "Décision"
- [ML-14950](./liste/ML-14950) La recherche de relevé se comporte bizarrement avec le filtre compte
- [ML-15003](./liste/ML-15003) **[Pièce comptable]** La recherche peut être spammée
- [ML-15120](./liste/ML-15120) Les codes CRE doivent être triés par ordre alphabétique
- [ML-15245](./liste/ML-15245) Reprendre un mail en changeant le contexte n'est pas tiptop
- [ML-15287](./liste/ML-15287) **[RIB/RUM]** Rechargement des éléments de la page quand il n'y a pas de changement
- [ML-14620](./liste/ML-14620) Ajouter au filtre "Statut" une option "Annulé" dans l'historique des CRE
- [ML-14747](./liste/ML-14747) Revoir le calcul de la tuile "Contrat de relocation"
- [ML-15290](./liste/ML-15290) **[Email]** Reprendre l'email marche partiellement pour la défense du dossier
- [ML-15202](./liste/ML-15202) Ajouter la date de prélèvement sur la consultation de pièce comptable
