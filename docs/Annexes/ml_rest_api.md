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
---
sidebar_label: ML-Rest-API
sidebar_position: "-1"
tags: 
    - Presentation
    - Rest-API
---

:::warning
page en construction
:::


ml rest-api = open api
contrats qui génère des fichiers, controller api côté front permet de coder plus écrire le code, normalement la configuration doit aussi créer côté serveur controllers et controllers (service chez nous) et dto mais on a pas la config pour


image d'exemple de code

image de bout de code générés

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