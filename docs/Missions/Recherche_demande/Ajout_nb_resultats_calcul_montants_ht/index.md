---
sidebar_label: Contexte
sidebar_position: "-1"
tags: 
    - Migration
---

# Ticket – Nombre de résultats et Montants totaux

## Objectif

Dans ce ticket, l'objectif était d'ajouter deux nouvelles fonctionnalités essentielles à la recherche de demandes :

1. Afficher le **nombre total de résultats** lors d'une recherche.
2. Calculer et afficher le **montant total HT par sens achat et vente**.

Les utilisateurs avaient exprimé le besoin de ces informations lors des réunions. Donc ce n'était pas simplement un simple développement miroir entre l'ancienne page de recherche et celle-ci mais une nouvelle fonctionnalité importante pour eux qui a nécessité une **réflexion côté serveur** pour gérer l'optimisation des calculs et garantir des performances optimales.

Au lieu de traiter ces calculs côté client, on a choisi de les effectuer côté serveur afin de ne pas surcharger le frontend.

## Ticket

![Screenshot du ticket Jira](/img/recherche_demande/ticket_nb_resultat_montant.png)

## Ce que j’ai développé

J'ai intégré les nouvelles fonctionnalités en ajustant à la fois le **backend** et le **frontend** mais également la partie **rest-api** pour refléter les nouvelles exigences :

- **Backend** : J'ai modifié le DTO côté serveur pour ajouter les calculs des montants totaux (achat et vente). J'ai également ajouter des fonctions de calculs dans les services.
  
- **Frontend** : J'ai mis à jour le DataSource côté Angular pour intégrer ces nouveaux montants et le nombre total de résultats, puis les afficher de manière dynamique dans l'interface.

Ce ticket a constitué une **étape importante** pour moi, car il m'a permis de développer une **nouvelle logique côté serveur** et de ne pas me contenter de reproduire un clone de l'ancienne page de recherche. J'ai appris à enrichir la logique métier tout en optimisant sa performance.

## Points techniques

### Explication côté serveur

[Consulter la documentation du développement côté serveur](./Cote-serveur.md)

### Explication côté client

[Consulter la documentation du développement côté client](./Cote-client.md)

## Temps investi

Ce ticket a demandé un investissement de temps significatif, car il n'a pas simplement consisté à faire une migration. Il a impliqué la mise en place d'une **nouvelle logique côté serveur**, ce qui m'a permis de me familiariser avec des concepts plus avancés de traitement des données côté backend.

## Résultat

À l'issue de ce ticket, j'ai pu :

- **Optimiser les calculs côté serveur** pour réduire la charge côté client.
- **Afficher dynamiquement** le nombre total de résultats et les montants totaux d'achat/vente.
- Offrir une **meilleure expérience utilisateur** en fournissant des informations financières supplémentaires directement lors de la recherche.

Cela a non seulement amélioré l'efficacité de l'application, mais aussi la satisfaction des utilisateurs finaux qui bénéficient désormais de ces informations cruciales.

---
