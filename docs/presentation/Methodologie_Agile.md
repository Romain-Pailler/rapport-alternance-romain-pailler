---
sidebar_label: Méthodologie Agile
sidebar_position: 6
tags: 
  - Présentation
---

# Méthodologie Agile

Au sein de mon équipe, le développement de l’application Leasa repose sur une organisation en **méthodologie Agile**, et plus précisément sur un fonctionnement par **sprints de trois semaines**.

## Organisation des sprints

Chaque sprint débute par deux temps forts :

- Une **rétrospective**, durant laquelle l'équipe revient sur le déroulement du sprint précédent. L’objectif est d’identifier les points positifs, les éventuels blocages rencontrés et de proposer des axes d’amélioration.
- Une **revue de sprint**, qui permet de présenter à l’ensemble de l’équipe (et parfois aux parties prenantes) les livrables produits durant les trois semaines écoulées.

L’ensemble du travail à réaliser est planifié dans un **tableau de sprint** accessible via l’outil **Jira**. Chaque ticket correspond à une tâche de développement, un correctif ou une amélioration, et est rattaché à une version précise de l’application.

## Gestion du code source

Le développement suit un processus de versioning rigoureux :

- Chaque développeur effectue un **fork** du projet principal.
- Les modifications sont soumises sous forme de **pull request**.
- Chaque pull request est automatiquement **validée par Jenkins**, via une suite de **tests automatisés** (unitaires, d’intégration...).
- Un ou plusieurs collègues sont ensuite chargés de **relire et valider la PR** avant intégration.

Ce processus garantit la **qualité du code** et la **stabilité** des fonctionnalités livrées.

## Documentation

L’outil **Confluence** est utilisé en parallèle pour centraliser la documentation. Il est structuré autour de plusieurs usages :

- **Changelog** des nouvelles versions : description des fonctionnalités, correctifs et évolutions livrées.
- **Documentation technique** : tutoriels internes pour installer les outils de développement, guides de démarrage, procédures de déploiement...
- **Notes de version** : synthèses des sprints et préparation des futures mises en production.

Confluence joue donc un rôle clé dans la **transmission de l’information** entre les membres de l’équipe, en favorisant la continuité et la clarté des échanges.

---

Cette organisation agile favorise un **rythme de travail soutenu mais maîtrisé**, une **collaboration fluide** au sein de l’équipe, et une **livraison continue** de valeur au fil des versions. Elle m’a permis de travailler dans un cadre structuré, tout en développant des réflexes essentiels dans la gestion de projet logiciel en entreprise.
