---
sidebar_label: ML-Rest-API
sidebar_position: 3
tags: 
    - OpenApi
    - Présentation
---

# ML-Rest-API

Le projet **ML-Rest-API** permet d'écrire des **contrats OpenAPI au format YAML** qui, lorsqu’ils sont exécutés, génèrent automatiquement **les fichiers de controllers API côté client**.  


## Pourquoi utiliser ML-Rest-API ?

L’objectif principal est de **gagner du temps et de la fiabilité** dans le développement.  
Normalement, ce type de contrat devrait également générer :  

- Les **endpoints côté serveur**.  
- Les **DTOs** (Data Transfer Objects) côté serveur.  
- Les **services côté serveur**.  

Pour Leasa, cette configuration côté serveur n’est pas encore développée, seule la génération côté client fonctionne pour l’instant.  

---

## Exemple d’un endpoint YAML

Voici un exemple d’endpoint défini dans un contrat OpenAPI pour rechercher des demandes :

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

Ce fichier YAML définit :

* Le **type de requête** (`GET`).
* Le **tag** associé à l’endpoint (`demandes`).
* La **description** et le **résumé** pour documenter l’API.
* Les **paramètres** attendus (`demandesCriteria`).
* La **réponse attendue** (`DemandePaginateContainer`).

---

## Exemple d’un modèle YAML

Voici un exemple de modèle de données pour un apporteur :

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

---

## Exemple de code généré côté front (Angular)

```ts
import { HttpClient, HttpHeaders, HttpResponse, HttpEvent, HttpParameterCodec, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CountContainer } from '../model/countContainer';
import { DemandePaginateContainer } from '../model/demandePaginateContainer';
import { Configuration } from '../configuration';
import * as i0 from "@angular/core";
export declare class DemandesApi {
    protected httpClient: HttpClient;
    protected basePath: string;
    defaultHeaders: HttpHeaders;
    configuration: Configuration;
    encoder: HttpParameterCodec;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration: Configuration);
    private addToHttpParams;
    private addToHttpParamsRecursive;
    /**
     * Compte les demandes en fonction du critere
     * Compte les demandes en fonction du critere
     * @param demandesCriteria critere de recherche des demande
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    getNbDemandes(demandesCriteria: object, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<CountContainer>;
    getNbDemandes(demandesCriteria: object, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<CountContainer>>;
    getNbDemandes(demandesCriteria: object, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<CountContainer>>;
    /**
     * Recherche les demandes en fonction de critères
     * Recherche les statistiques de demandes en fonction d\&#39;un critère
     * @param demandesCriteria critère de recherche des demandes
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    searchByCriteria(demandesCriteria?: object, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<DemandePaginateContainer>;
    searchByCriteria(demandesCriteria?: object, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<DemandePaginateContainer>>;
    searchByCriteria(demandesCriteria?: object, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<DemandePaginateContainer>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DemandesApi, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DemandesApi>;
}
```

---

## Conclusion

ML-Rest-API permet donc de :

- **Centraliser les contrats API** pour garantir cohérence et fiabilité.
- **Générer automatiquement** les fichiers côté client, réduisant les erreurs et le temps de développement.

---
