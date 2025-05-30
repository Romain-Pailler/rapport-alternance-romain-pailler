---
sidebar_label: Côté Rest-API
sidebar_position: "3"
tags: 
    - Migration
    - OpenAPI
---

# Rest-Api


## explication

## ce que j'ai fait 

ajout dans openapi.yaml : 

``` yaml
  /demandes/search:
    $ref: "./path/demandes/search.yaml"
```

search.yaml 

``` yaml
get:
  tags:
    - demandes
  summary: Recherche les demandes en fonction de critères
  description: Recherche les statistiques de demandes en fonction d'un critère
  operationId: searchByCriteria
  parameters:
    - name: demandesCriteria
      in: query
      description: critère de recherche des demandes
      required: false
      schema:
        type: object
  responses:
    "200":
      description: La liste paginée des demandes 
      content:
        application/json:
          schema:
            $ref: "../../model/demande/demandePaginateContainer.yaml"
```

demandePaginateContainer.yaml :

``` yaml

title: DemandePaginateContainer
description: contient les demandes paginées
type: object
required:
  - result
properties:
  result:
    $ref: "demandePaginate.yaml"

```

demandePaginate.yaml :

``` yaml
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

```

demandeDomain.yaml 

``` yaml
title: demandeDomain
description: La representation d'une demande simpliste
type: object
required:
  - id
  - code
properties:
  id:
    type: integer
    format: int64
    example: 123
  code:
    type: string
    description: Code
    example: N99999
  statut: 
    $ref: '../../statuts/domain/statutDomain.yaml'
  apporteur:
    $ref: '../../apporteur/domain/apporteurDomain.yaml'
  client:
    $ref: '../../client/domain/clientDomain.yaml'
  utilisateurCommercial:
    $ref: '../../user/domain/userDomain.yaml'
  accord:
    $ref: '../../decision/domain/decisionDomain.yaml'
  schemaFinancier:
    $ref: '../../schema-financier/domain/schemaFinancierDomain.yaml'
```
decisionDomain.yaml

``` yaml

title: DecisionDomain
description: La représentation simplifiée d'une decision
type: object
required:
  - id
properties:
  id:
    type: integer
    format: int64
    example: 723
  montantHT:
    type: number
    format: double
    description: Montant Hors Taxe

apporteurDomain.yaml
title: ApporteurDomain
description: La representation d'un apporteur qui est generique pour toute l'application
type: object
required:
  - id
  - code
  - libelle
  - loueur
properties:
  id:
    type: integer
    format: int64
    example: 723
  code:
    type: string
    description: Code
    example: IMPRESSION
  libelle:
    type: string
    description: Libelle
    example: Impression
  premierNumeroIdentification:
    type: string
    description: numéro d'identification unique d'un tiers, siren ou registration number
    example: 845 636 789
  loueur:
    $ref: '../../common/loueur.yaml'
  groupeApporteurs:
    $ref: '../../groupe-apporteur/domain/groupeApporteurDomain.yaml'
```