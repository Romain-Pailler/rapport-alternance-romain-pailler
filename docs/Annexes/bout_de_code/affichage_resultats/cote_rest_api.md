---
sidebar_label: Côté Rest-API
sidebar_position: "3"
tags: 
    - Migration
    - OpenAPI
---

## decisionDomain.yaml

````
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
````

## demandeDomain.yaml

````
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
```` 
