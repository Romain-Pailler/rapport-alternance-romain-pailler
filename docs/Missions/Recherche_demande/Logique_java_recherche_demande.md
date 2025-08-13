---
sidebar_label: Fonctionnement global de la recherche de demandes (Existant) 
sidebar_position: 2
tags: 
    - Migration
    - Java
---
# Fonctionnement global de la recherche de demandes (Existant)

Lorsqu’un utilisateur effectue une recherche de demandes depuis l’interface, une requête [HTTP](../../glossaire/Vocab.md#http) est envoyée à l’API. Cette requête est traitée par la couche service, puis transmise au processus métier, qui appelle le DAO. Le DAO utilise un `SearchBuilder` pour construire dynamiquement la requête SQL avec tous les critères nécessaires.

---

## 1. `SearchService` — **Point d'entrée de la recherche (API REST)**

```java
@GET
public Response search(...)
```

Ce contrôleur REST reçoit l'appel HTTP de recherche. Il construit un objet `DemandeCriteria` à partir des paramètres passés dans l’URL (via `UriInfo`) ainsi que du `Header` (clé d’authentification).

Ensuite, il :

* Calcule le nombre total de résultats avec `countAllByCriteria`.
* Récupère la liste paginée des demandes avec `searchByCriteria`.
* Applique un mapping vers un objet de sortie (`RestDemandeShort` ou autre).
* Selon la projection demandée (ex. : `PROJECTION_RECHERCHE_BACK_V2`), il peut également renvoyer des montants totaux (achat et vente) récupérés via `getMontantSearchDemande`.

**Rôle** : C’est le point d’entrée de l’API côté serveur. Il orchestre les appels aux couches métier et technique, selon le type de projection ou le format souhaité pour la réponse.

---

## 2. `DemandeSearchProcessus` — **Traitement métier de la recherche**

```java
public List<Demande> searchByCriteria(DemandeCriteria criteria, boolean initialize)
```

Cette méthode applique d'abord une logique métier :

* Récupère l'utilisateur courant (`currentUser`).
* Filtre les critères de recherche selon les droits utilisateur (`filterSearch`).
* Appelle le DAO pour exécuter la recherche réelle.
* Initialise ou hydrate certains champs d’entités avec [Hibernate](../../glossaire/Vocab.md#hibernate) si `initialize` est à `true` (notamment les objets liés comme taches, paiements, accord...).

**Rôle** : Appliquer la logique métier autour de la recherche, s'assurer que les entités sont correctement chargées et filtrées.

---

## 3. `DemandeDao` — **Accès aux données (DAO)**

```java
public List<Demande> searchByCriteria(DemandeCriteria criteria, Utilisateur utilisateur)
```

C’est ici que la recherche dans la base de données est réellement construite et exécutée :

* Un `DemandeSearchBuilder` est instancié, avec le `criteria` et l’utilisateur.
* Le builder ajoute tous les `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET`, etc.
* Les entités résultantes sont ensuite filtrées si nécessaire (`filterByRule`).
* Enfin, selon la projection, certains champs supplémentaires sont initialisés avec `setEntitesByProjection`.

**Rôle** : Construire et exécuter dynamiquement une requête basée sur les nombreux critères de recherche disponibles.

---

## 4. `DemandeSearchBuilder` — **Construction dynamique de requêtes**

```java
public DemandeSearchBuilder addAllWhere()
```

Ce fichier contient une longue série de méthodes `whereX()` qui ajoutent dynamiquement des clauses de filtrage (`WHERE`) à la requête JPQL/SQL :

Exemples :

* `whereCodeLoueur()` → filtre sur un loueur sélectionné.
* `whereDateCreationBetween()` → filtre sur une période de création.
* `whereClientId()` → filtre par client.
* `whereStatutsContrat()` → filtre sur le statut du contrat.

Toutes ces conditions sont chaînées via un **builder pattern**, permettant une flexibilité maximale.

**Rôle** : Générer dynamiquement la requête de recherche avec tous les filtres possibles selon les critères envoyés depuis le front.

---

## Résumé du flux de traitement

1. **L’interface utilisateur** envoie une requête avec les critères via HTTP.
2. **`SearchService`** reçoit la requête et construit l’objet `DemandeCriteria`.
3. **`DemandeSearchProcessus`** applique les règles métiers et appelle le DAO.
4. **`DemandeDao`** construit la requête avec le `SearchBuilder` et exécute la requête SQL.
5. **Les résultats** sont retournés (avec éventuellement des montants d'achat/vente HT), transformés en [DTOs](../../glossaire/Vocab.md#dto), puis renvoyés au client.

---

## SearchService (recoit l'appel api)
````java
  @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response search(@Context final UriInfo info, @HeaderParam(Constantes.AUTH_KEY_FROM) final String from) {
        final DemandeCriteria demandeCriteria = new DemandeCriteria(info.getQueryParameters(), from);
        
        if (demandeCriteria.getVersion().equals(DemandeCriteria.Version.V2)) {
            final Long count = demandeSearchProcessus.countAllByCriteria(demandeCriteria);
            final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria);
            return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeShort.class), demandeCriteria.getStartPage(), count)).build();
        } else {
            final Boolean withProjection = demandeCriteria.getWithProjection() != null && demandeCriteria.getWithProjection();
            final Boolean initialize = !withProjection;
            
            final Long count = demandeSearchProcessus.countAllByCriteria(demandeCriteria);
            if (DemandeCriteria.PROJECTION_ETAT_PARC_VALEURS_INTERRUPTION_FRONT.equals(demandeCriteria.getCurrentProjection())) {
                final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria);
                final List<RestDemandeEtatParc> restDemandes = demandeSearchProcessus.convertSearchResults(demandes);
                return Response
                        .ok(new RestEtatParcDureeContrat(restDemandes, demandeCriteria.getStartPage(), count, demandeProcessus.getMaxDureeContratByCriteria(demandeCriteria)))
                        .build();
            } else {
                final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria, initialize);
                if (DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2.equals(demandeCriteria.getCurrentProjection())) {
                    final DemandeSearchResultDomain montantsDemandes = demandeSearchProcessus.getMontantSearchDemande(demandeCriteria);
                    return Response.ok(new RestRechercheDemandeResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count,montantsDemandes.getMontantTotalAchatHT(),montantsDemandes.getMontantTotalVenteHT())).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
````

## DemandeSearchProcessus
````java

    @Override
    @Transactional(noRollbackFor = MonaLisaFunctionalException.class, readOnly = true)
    public List<Demande> searchByCriteria(final DemandeCriteria demandeCriteria, final boolean initialize) {
        final Utilisateur currentUser = currentUserProcessus.getCurrentUser();
        filterSearch(demandeCriteria, currentUser);
        
        final List<Demande> demandes = demandeDao.searchByCriteria(demandeCriteria, currentUser);
        
        for (final Demande demande : demandes) {
            if (demande != null) {
                if (initialize) {
                    Hibernate.initialize(demande.getDerogations());
                    Hibernate.initialize(demande.getTaches());
                    Hibernate.initialize(demande.getPaiements());
                    Hibernate.initialize(demande.getInfoCommissionBailleur());
                    Hibernate.initialize(demande.getTags());
                    if (demande.getAccord() != null) {
                        Hibernate.initialize(demande.getAccord().getConditions());
                        Hibernate.initialize(demande.getAccord().getBailleur());
                    }
                    for (final Tache tache : tacheProcessus.findByDemande(demande.getCode())) {
                        Hibernate.initialize(tache.getTypesTache());
                    }
                } else {
                    demande.setDerogations(derogationProcessus.findByCodeDemande(demande.getCode(), true));
                }
                
            }
        }
        
        return demandes;
    }
````
## DemandeDao.java

````java

    @Override
    public List<Demande> searchByCriteria(final DemandeCriteria demandeCriteria, final Utilisateur utilisateur) {
        
        final DemandeCriteria criteria = Objects.isNull(demandeCriteria) ? new DemandeCriteria() : demandeCriteria;
        
        checkUserAccess(criteria, utilisateur);
        
        final DemandeSearchBuilder demandeSearchBuilder = new DemandeSearchBuilder(createQuery(), criteria, utilisateur);
        
        if (criteria.getCodePreSelection() != null) {
            demandeSearchBuilder.addAllWhereWithoutStatuts();
        } else {
            demandeSearchBuilder.addAllWhere();
        }
        
        demandeSearchBuilder.distinct().offset().limit();
        
        addPreselections(criteria, demandeSearchBuilder);
        
        demandeSearchBuilder.addAllOrderBy();
        
        List<Demande> demandes = demandeSearchBuilder.fetch();
        
        demandes = filterByRule(demandes, criteria);
        
        return setEntitesByProjection(demandes, criteria, utilisateur);
    }
````

## DemandeSearchBuilder.java (enorme fichier qui permet de construire une requete avec tout les critères possibles implémenter au fur et à mesure des besoins)

````java
  public DemandeSearchBuilder addAllWhereWithoutStatuts() {
        return whereAvecDecisionAccord()
                .whereAvecRentFree()
                .whereApporteursId()
                .whereBailleurId()
                .whereCategoriesTache()
                .whereOriginesTache()
                .whereClientId()
                .whereCode()
                .whereCodes()
                .whereCoefficientNegocie()
                .whereCodeCIP()
                .whereCodeLoueur()
                .whereConditionDecision()
                .whereDateAccordBetween()
                .whereDateAttentePaiementBetween()
                .whereDateChangementStatutToBetween()
                .whereDateCreationBetween()
                .whereDateDecisionBetween()
                .whereDateFinContratBetween()
                .whereDateFinBailleurBetweenAndTypeSelection()
                .whereDatePaiementBetween()
                .whereDatePremierLoyerBailleurBetweenAndTypeSelection()
                .whereDatePremierLoyerBetween()
                .whereDateRefusBetween()
                .whereDecisionPubliable()
                .whereDemandesId()
                .whereDocumentLu()
                .whereLoueurId()
                .whereNumVirement()
                .whereRaisonSociale()
                .whereRefApporteur()
                .whereRefBailleur()
                .whereRetardPaiement()
                .wherePremierNumeroIdentification()
                .whereSecondNumeroIdentification()
                .whereStatutsDecision()
                .whereStatutsContrat()
                .whereTacheLue()
                .whereTacheOuverte()
                .whereTacheVisibiliteFront()
                .whereTags()
                .whereUtilisateurAdvFrontId()
                .whereUtilisateurApporteurId()
                .whereIncidentPaiement()
                .whereUtilisateurBoId()
                .whereUtilisateurCommercialId()
                .whereNumVirement()
                .whereLoueurId()
                .whereDatePremierLoyerGoeDateDebut()
                .whereDatePremierLoyerLoeDateFin()
                .whereClientId()
                .whereTransferable()
                .whereCodePeriodiciteBaremeApporteur()
                .whereDureePeriodiciteBaremeApporteur()
                .whereBaremeApporteurIsNot()
                .whereIsSansVerrou()
                .whereMontantDemandeInTranchesBaremeApporteur()
                .whereValeurInterruptionPubliee()
                .whereCodePortefeuille()
                .whereIdGroupeApporteur()
                .whereCodeSpecificiteApporteur()
                .whereCodesStatutFront()
                .whereESignature()
                .whereUtilisateurAdvBackApporteurId()
                .whereUtilisateurComBackApporteurId()
                .whereUtilisateurResponsableBackApporteurId()
                .whereHasAcompte()
                .whereMoisBooking()
                .whereEligibiliteProtection()
                .whereStatutProtection()
                .whereMandatSepaLoueurId();
    }
````