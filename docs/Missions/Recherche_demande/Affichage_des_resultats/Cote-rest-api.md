---
sidebar_label: Côté Rest-API
sidebar_position: 3
tags: 
    - Migration
    - OpenAPI
---

# Affichage des résultats - Côté Rest-Api

## Explication

L'objectif de cette partie de l'application était de modifier le contrat en place qui était capable de gérer la recherche de demandes en fonction de critères afin de garantir la compatibilité avec le frontend Angular et d'assurer une réponse structurée par rapport au données retournées par le serveur

### Processus de développement

1. **Utilisation de l'endpoint Search** :
  L'endpoint `/demandes/search` situé dans le fichier `openapi.yaml` est celui utilisé pour permettre la recherche des demandes.

2. **Spécification de la logique de recherche** :
   La logique de recherche a été définie dans un fichier `search.yaml`, où était déjà précisé les paramètres acceptés (ici `demandesCriteria`) ainsi que le type de réponse attendu (une liste paginée de demandes).

3. **Réponse paginée des demandes** :
   La réponse contient un objet de type `DemandePaginateContainer`, définissant un conteneur pour les résultats paginés. Chaque demande dans la liste paginée suit une structure définie par l'objet `DemandePaginate`, qui elle-même est enrichie par des données détaillées sur chaque demande via le fichier `demandeDomain.yaml`.

---

## Ce que j'ai utilisé (existant)

:::info
Le code source complet se trouve [ici](../../../annexes/bout_de_code/Projet_recherche_demande/affichage_resultats/cote_rest_api)
:::


### Ajout dans `openapi.yaml`

Tout d'abord, j'ai gardé l'endpoint dans le fichier principal `openapi.yaml` qui expose la fonctionnalité de recherche des demandes.

```yaml
  /demandes/search:
    $ref: "./path/demandes/search.yaml"
```

---

### `search.yaml` - Définition de la recherche

Dans ce fichier, on définie l'**endpoint GET** pour récupérer les demandes, avec des paramètres en entrée et une réponse structurée.

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
      description: Critère de recherche des demandes
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

#### Explication

* **`operationId: searchByCriteria`** : Spécifie le nom de la fonction pour cette recherche lors de la génération du code.
* **`parameters`** : Prend en entrée un objet `demandesCriteria` dans la requête, permettant de spécifier des critères pour filtrer les demandes.
* **`responses`** : En cas de succès (`200`), la réponse est une liste paginée de demandes, structurée comme spécifié dans le fichier `demandePaginateContainer.yaml`.

---

### `demandePaginate.yaml` - Liste des demandes paginées

Le fichier `demandePaginate.yaml` définit un objet contenant une liste de demandes paginées.

```yaml
title: DemandePaginate
description: Contient une liste de demandes paginées
type: object
required:
  - list
allOf:
  - $ref: '../common/paginate.yaml'
properties:
  list:
    type: array
    description: Liste de demandes
    items:
      $ref: "./domain/demandeDomain.yaml"
```

#### Explication

* **`list`** : Contient une **liste** des demandes retournées, chacune d'elles étant structurée selon le modèle de `demandeDomain.yaml`.
* **`allOf`** : Hérite des propriétés de pagination définies dans un fichier commun `paginate.yaml`, qui permet de centraliser les informations relatives à la pagination. //a revoir

---
## Ce que j'ai modifié / ajouté

### `demandePaginateContainer.yaml` - Structure de la réponse paginée

Dans ce fichier, on décrit la structure de la réponse paginée retournée par le serveur, qui contient une liste d'objets `DemandePaginate`.

```yaml
title: DemandePaginateContainer
description: Contient les demandes paginées
type: object
required:
  - result
properties:
  result:
    $ref: "demandePaginate.yaml"
```

Cette réponse est constituée d'un objet de type `DemandePaginate`, qui contient une liste d'objets représentant les demandes.

### `demandeDomain.yaml` - Structure d'une demande

Ce fichier décrit la structure de chaque demande, qui inclut plusieurs sous-objets, tels que le statut, l'apporteur, le client, l'utilisateur commercial, etc.
Tout ce dont j'ai besoin pour afficher correctement les résultats dans le back-office.

J'ai donc ajouté : 

- L'apporteur relié à la demande
- L'accord
- Ainsi que son schéma financier

```yaml
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

Les sous-objets font référence à d'autres fichiers YAML, chacun d'eux représentant un domaine spécifique (statut, apporteur, etc.), assurant ainsi une séparation claire des préoccupations.

---

### `decisionDomain.yaml` - Détails d'une décision

Le fichier `decisionDomain.yaml` représente une décision associée à une demande, avec un identifiant et un montant hors taxe.

```yaml
title: DecisionDomain
description: La représentation simplifiée d'une décision
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
```

---

### `apporteurDomain.yaml` - Détails d'un apporteur

Le fichier `apporteurDomain.yaml` représente un apporteur, avec son identifiant, son code, son libellé, et ses liens avec d'autres entités comme le loueur et le groupe d'apporteurs.

```yaml
title: ApporteurDomain
description: La représentation d'un apporteur
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
    description: Numéro d'identification unique d'un tiers
    example: 845 636 789
  loueur:
    $ref: '../../common/loueur.yaml'
  groupeApporteurs:
    $ref: '../../groupe-apporteur/domain/groupeApporteurDomain.yaml'
```

---
