---
sidebar_label: ML-Rest-API
sidebar_position: 3
tags: 
    - OpenApi
    - Présentation
---

# ml rest api est un projet qui permet d'écrire des contrats sous formats yaml afin que lors de son execution il puisse générer des fichiers de controllers api côté client

## pourquoi ?

Permet d'écrire moins de code et d'avoir une cohérence et une sécurité avec ce qui est développé côté serveur
normalement ce genre de contrats doit aussi générer les endpoints ainsi que les dto côté serveur mais cette partie là n'est pas encore développé pour leasa

## exemple d'un endpoint

```yaml
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

## exemple d'un model

```yaml
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
