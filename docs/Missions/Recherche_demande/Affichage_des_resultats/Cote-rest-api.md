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










