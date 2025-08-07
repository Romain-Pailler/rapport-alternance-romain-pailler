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
    description: liste de demande
    items:
      $ref: "./domain/demandeDomain.yaml"
  montantTotalAchatHT:
    type: number
    description: calcul du montant achat des demandes recherchées
  montantTotalVenteHT:
    type: number
    description: calcul du montant vente des demandes recherchées
```