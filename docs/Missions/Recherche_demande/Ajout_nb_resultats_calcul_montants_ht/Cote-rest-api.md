---
sidebar_label: Côté Rest-API
sidebar_position: 3
tags:
- Migration
- OpenAPI
---

# Affichage des résultats - Côté Rest-Api

## Explication de la modification

L’objectif de cette modification était d’enrichir la réponse pour inclure les informations financières nécessaires, notamment les montants totaux d'achats et de ventes, en plus des données de la demande elle-même. Cette évolution permet de rendre les résultats de recherche plus complets et utiles pour le front-end, qui doit afficher ces informations de manière claire et précise.

### Ce que j'ai modifié

#### `demandePaginate.yaml` - Liste des demandes paginées avec montants totaux

J’ai modifié la structure de la réponse de l'API, plus précisément le fichier `demandePaginate.yaml`, pour inclure deux nouveaux champs calculés côté serveur : le montant total des achats HT (`montantTotalAchatHT`) et le montant total des ventes HT (`montantTotalVenteHT`).

```yaml
title: DemandePaginate
description: contient une liste de demandes paginées
type: object
required:
  - list
allOf:
  - $ref: '../common/paginate.yaml'
properties:
  list:
    type: array
    description: liste de demandes
    items:
      $ref: "./domain/demandeDomain.yaml"
  montantTotalAchatHT:
    type: number
    description: calcul du montant achat des demandes recherchées
  montantTotalVenteHT:
    type: number
    description: calcul du montant vente des demandes recherchées
```

#### Explication des éléments ajoutés

* **`list`** : Ce champ est une liste d'objets, chaque objet représentant une demande. La structure de chaque demande est définie dans le fichier `demandeDomain.yaml`, ce qui permet d'assurer une cohérence dans la façon dont les demandes sont représentées dans les réponses de l'API.

* **`montantTotalAchatHT`** : Ce champ contient la somme des montants HT des demandes ayant un statut d'achat. Il est calculé côté serveur pour chaque lot de demandes retourné. Cela permet d'obtenir un total financier instantané pour l'utilisateur sans avoir à recalculer chaque fois côté client.

* **`montantTotalVenteHT`** : De même, ce champ contient la somme des montants HT des demandes ayant un statut de vente, calculée côté serveur. Cela fournit une vue d'ensemble des montants des ventes associées aux demandes.

#### Pourquoi cette modification ?

L'ajout de ces champs permet d'améliorer l'efficacité de la présentation des données côté front-end, car cela évite d’avoir à effectuer des calculs supplémentaires côté client. De plus, l'enrichissement de la réponse avec des informations financières essentielles rend l'API plus complète et mieux adaptée aux besoins des utilisateurs finaux.

### Conclusion

Cette mise à jour apporte une grande valeur en fournissant directement au client les informations financières globales des demandes, facilitant ainsi l'affichage rapide et précis des données. Les informations de pagination, ainsi que les montants totaux, sont maintenant directement accessibles via l'API sans nécessiter de traitement supplémentaire côté client.
