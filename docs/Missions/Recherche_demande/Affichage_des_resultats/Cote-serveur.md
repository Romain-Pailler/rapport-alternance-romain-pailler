---
sidebar_label: Côté serveur
sidebar_position: "2"
tags: 
    - Migration
    - Java
---

# Affichage des résultats - Côté Java

## Ajout d’une projection spécifique dans le `searchService.java`

### Contexte

Pour que la nouvelle page Angular puisse afficher les résultats de recherche, il est nécessaire que le backend expose une **projection spécifique** — autrement dit, un format de données adapté à l'affichage. Cela se fait via un `DTO` (*Data Transfer Object*) qui structure les données côté Java avant leur envoi au frontend.

:::tip
#### Qu’est-ce qu’un DTO ? // A ajouter dans un autre fichier
Un DTO (Data Transfer Object) est une classe qui sert à transférer des données entre différentes couches de l’application (par exemple entre le backend et le frontend) tout en **filtrant et organisant** les champs utiles.
:::


---

### Code modifié dans `searchService.java`

Le code modifié dans le service de recherche ajoute un **cas particulier** pour traiter une projection spécifique : `PROJECTION_RECHERCHE_BACK_V2`.


``` java
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
                    return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count)).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
```

### Explication

* `DemandeCriteria.getCurrentProjection()` : récupère la projection demandée par le frontend.
* La condition `if (PROJECTION_RECHERCHE_BACK_V2.equals(...))` permet de **répondre avec un format de données spécifique**, ici un DTO se nommant `RestDemandeSearch`.
* `mapper.mapList(...)` : convertit les entités Java `Demande` (souvent complexes) vers une liste de `RestDemandeSearch`, qui contient **uniquement les champs nécessaires à l’affichage** dans la page Angular.
* `RestCollectionResult` : encapsule les données paginées avec le nombre total de résultats (`count`) et la page actuelle.

---

### Objectifs

Cela garantit :

* un **meilleur découplage** entre frontend et backend ;
* une réponse **plus légère et optimisée** par rapport à mon besoin côté client;
* une **structuration des données claire** pour l’affichage dans Angular.

---

## Enrichissement des entités en fonction de la projection demandée

### Objectif de la méthode `setEntitesByProjection(...)`

Cette méthode sert à **ajouter dynamiquement des données complémentaires** à une liste de demandes (`List<Demande>`), en fonction de la **projection** choisie par le frontend.

> Sans cette méthode, certaines données secondaires (comme les factures ou les groupes d’apporteurs) ne seraient **pas chargées**, car elles ne sont pas incluses par défaut dans les entités.

---

### Focus sur l’ajout pour la projection `PROJECTION_RECHERCHE_BACK`

on retrouve le bloc suivant :

``` java
    private List<Demande> setEntitesByProjection(final List<Demande> demandes, final DemandeCriteria demandeCriteria, final Utilisateur utilisateur) {
        
        if (demandeCriteria.getCurrentProjection() != null) {
            
            final List<List<Demande>> partitionDemandes = new PartitionManager<Demande>().add(demandes).getPartitions();
            final List<Demande> demandesToReturn = new ArrayList<>();
            
            for (final List<Demande> demandeList : partitionDemandes) {
                
                switch (demandeCriteria.getCurrentProjection()) {
                    case DemandeCriteria.PROJECTION_HISTORIQUE, DemandeCriteria.PROJECTION_STATISTIQUE_WITH_STATUT_HISTORIQUE -> setHistoriquesToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_STATISTIQUE_PAYE -> setPaiementsToDemandes(demandeList, new PaiementCriteria().setWithDateReglement(true));
                    case DemandeCriteria.PROJECTION_RECHERCHE_FRONT -> {
                        setConditionsAccordToDemandes(demandeList);
                        setValeurInterruptionToDemandes(demandeList, utilisateur);
                    }
                    case DemandeCriteria.PROJECTION_PORTEFEUILLE -> {
                        setTagsToDemandes(demandeList);
                        setGroupesApporteursToApporteurs(demandes);
                    }
                    case DemandeCriteria.PROJECTION_TAGS -> setTagsToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_FACTURES -> setFacturesToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_ETAT_PARC_VALEURS_INTERRUPTION_FRONT -> {
                        setValeurInterruptionToDemandes(demandeList, utilisateur);
                        setMateriels(demandes);
                    }
                    case DemandeCriteria.PROJECTION_TRANSFERABLE -> setDirigeantsClient(demandeList);
                    case DemandeCriteria.PROJECTION_RECHERCHE_BACK -> {
                        setProtections(demandeList);
                        setGroupesApporteursToApporteurs(demandeList);
                        setFacturesToDemandes(demandeList);
                    }
                    default -> {
                    }
                }
                
                demandesToReturn.addAll(demandeList);
            }
            
            return demandesToReturn;
        }
        return demandes;
    }
```


Voici ce que fait chaque appel :

* `setProtections(...)` : ajoute à chaque demande des informations liées à la protection (ex : niveau d’accès ou confidentialité). // à revérifier
* `setGroupesApporteursToApporteurs(...)` : permet de **rattacher à chaque apporteur son groupe**, ce qui est utile pour l’affichage de l’arborescence apporteur / groupe d’apporteurs dans le tableau de résultat de recherche.
* `setFacturesToDemandes(...)` : associe à chaque demande **les factures liées**, nécessaires pour afficher des montants ou dates de paiement dans la vue.

Ces appels permettent donc de **préparer toutes les données nécessaires** avant le mapping vers un DTO comme `RestDemandeSearch`.

---

### Pourquoi cette étape est indispensable

* Dans une application métier comme Leasa, les entités (Demandes, Apporteurs, Factures, etc.) sont souvent liées entre elles.
* Mais pour optimiser les performances, **ces relations ne sont pas chargées automatiquement** (lazy loading).
* Ce code permet donc de forcer le **chargement explicite** de certaines sous-parties des données uniquement **quand la projection l’exige**.

---

### Résumé

> Selon la projection demandée (ex. `PROJECTION_RECHERCHE_BACK`), certaines sous-données comme les groupes d’apporteurs ou les factures sont **chargées manuellement** avant d’être retournées au frontend.

Cela garantit que le frontend (notamment Angular) dispose **de toutes les données attendues pour chaque demande**, sans devoir refaire des appels secondaires.

---


## Enrichissement des entités : ajout des factures aux demandes (`setFacturesToDemandes`)

### Objectif de cette méthode

La méthode `setFacturesToDemandes(...)` permet d’**associer à chaque demande la liste de ses factures**, en les récupérant via une requête optimisée, et en projetant uniquement les champs nécessaires.

---
### Code

``` java
    
    private void setFacturesToDemandes(final List<Demande> demandes) {
        final Map<Long, List<Facture>> map = createQuery()
                .from(Q_DEMANDE)
                .leftJoin(Q_DEMANDE.factures, Q_FACTURE)
                .leftJoin(Q_FACTURE.entite, Q_ENTITE_FACTURE_ENTITE)
                .leftJoin(Q_FACTURE.loueur, Q_ENTITE_FACTURE_LOUEUR)
                .leftJoin(Q_FACTURE.sousTypeFacture, Q_SOUS_TYPE_FACTURE)
                .leftJoin(Q_FACTURE.sensFacture, Q_SENS_FACTURE)
                .where(Q_DEMANDE.in(demandes)).transform(
                        GroupBy.groupBy(Q_DEMANDE.id)
                                .as(GroupBy.list(Projections.bean(Facture.class,
                                        Q_FACTURE.id,
                                        Q_FACTURE.numeroFacture,
                                        Q_FACTURE.montantTotalHT,
                                        Q_FACTURE.dateComptabilisation,
                                        Projections.bean(EntiteFacture.class, Q_ENTITE_FACTURE_ENTITE.id,
                                                Q_ENTITE_FACTURE_ENTITE.premierNumeroIdentification).as(Q_FACTURE.entite),
                                        Projections.bean(EntiteFacture.class,
                                                Q_ENTITE_FACTURE_LOUEUR.id,
                                                Q_ENTITE_FACTURE_LOUEUR.premierNumeroIdentification).as(Q_FACTURE.loueur),
                                        Projections.bean(SensFacture.class, Q_SENS_FACTURE.id,
                                                Q_SENS_FACTURE.code).as(Q_FACTURE.sensFacture),
                                        Projections.bean(SousTypeFacture.class, Q_SOUS_TYPE_FACTURE.id,
                                                Q_SOUS_TYPE_FACTURE.code).as(Q_FACTURE.sousTypeFacture)))));
        
        demandes.forEach(d -> {
            List<Facture> factures = new ArrayList<>();
            if (map.containsKey(d.getId())) {
                factures = map.get(d.getId());
            }
            d.setFactures(factures.stream().filter(facture -> Objects.nonNull(facture.getId())).collect(Collectors.toList()));
        });
    }
```
---

### Détails de l'implémentation

1. **Construction de la requête avec QueryDSL :**

   La requête assemble toutes les informations utiles sur les factures liées aux demandes :

   * `montantTotalHT` : montant hors taxes de la facture
   * `dateComptabilisation` : date d’enregistrement comptable de la facture
   * `entité` et `loueur` : les parties liées à la facture
   * `sous-type de facture` : catégorie plus précise (ex : acompte, solde…)
   * `sens de facture` : sens comptable (débit/crédit)

   Tout est récupéré via des **jointures**, puis groupé avec :

   ```java
   GroupBy.groupBy(Q_DEMANDE.id).as(GroupBy.list(...))
   ```

   Cela permet de créer **un `Map<idDemande, List<Facture>>`**.

2. **Projection optimisée avec `Projections.bean(...)` :**

   Au lieu de charger tous les champs, on ne récupère que ceux nécessaires à l’affichage ou au traitement :

   * Pour `Facture`, on extrait par exemple : `id`, `montantTotalHT`, `dateComptabilisation`, etc.
   * Pour les entités liées comme `SousTypeFacture` ou `SensFacture`, seules `id` et `code` sont extraites.

 Cela permet de **réduire considérablement la charge mémoire et le temps de traitement**.

3. **Association finale aux objets `Demande` :**

   Pour chaque demande de la liste :

   * On regarde si des factures lui sont associées dans le `map`
   * On filtre les éventuelles factures invalides (`null` ou sans `id`)
   * On les assigne proprement à l’objet `Demande` via `d.setFactures(...)`

---

### Pourquoi c’est important

* Sans cette méthode, les factures ne seraient **pas chargées** avec les demandes.
* C’est indispensable pour **afficher les bons montants ou la date de paiement** dans la vue Angular.
* La projection permet de **gagner en performance** par rapport à une récupération brute.

---

### Lien avec le frontend

Grâce à ce code :

* Le backend **enrichit chaque demande avec ses factures complètes**
* Le DTO envoyé à Angular (`RestDemandeSearch`) contient ces factures
* Elles sont ensuite **utilisées dans les colonnes de la table** (ex : loyer HT ou date de paiement)

---

## `RestDemandeSearch.java` – Le **DTO** utilisé pour la recherche de demandes

### Qu’est-ce qu’un DTO ?

Un **DTO (Data Transfer Object)** est une classe utilisée pour **transporter des données entre le backend et le frontend**, sans exposer les entités internes du modèle métier.
Cela permet de :

* Sécuriser les données exposées à l’extérieur,
* Optimiser les échanges (en ne transférant que les champs nécessaires),
* Adapter la structure aux besoins spécifiques d’une interface.

---
### Code 

``` java
package com.pharmagest.monalisa.rest.service.domain.demande;

import java.math.BigDecimal;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import lombok.Getter;
import lombok.Setter;

import com.pharmagest.monalisa.rest.service.domain.RestBafDetail;
import com.pharmagest.monalisa.rest.service.domain.RestClientMinimal;
import com.pharmagest.monalisa.rest.service.domain.RestClientShort;
import com.pharmagest.monalisa.rest.service.domain.RestDecisionShort;
import com.pharmagest.monalisa.rest.service.domain.RestSchemaFinancierShort;
import com.pharmagest.monalisa.rest.service.domain.RestStatutShort;
import com.pharmagest.monalisa.rest.service.domain.apporteur.RestApporteurShortWithGroupe;
import com.pharmagest.monalisa.rest.service.domain.utilisateur.RestUtilisateurShort;

@XmlType(name = "")
@XmlRootElement(name = "demande")
@XmlAccessorType(XmlAccessType.FIELD)
@Getter
@Setter
public class RestDemandeSearch {
    private Long id;
    private String code;
    private RestStatutShort statut;
    private RestUtilisateurShort utilisateurCommercial;
    private RestClientMinimal client;
    private Date dateCreation;
    private BigDecimal montantHT;
    private RestDecisionShort accord;
    private RestApporteurShortWithGroupe apporteur;
    private BigDecimal montantAchatContratHT;
    private BigDecimal montantVenteContratHT;
    private RestBafDetail bonAFacturer;
    private RestSchemaFinancierShort schemaFinancier;
    private RestClientShort loueur;
    private Date datePaiement;
    private String devise;
    private BigDecimal montantTotalAchatHT;
    private BigDecimal montantTotalVenteHT;
    private BigDecimal montantLoyerHT;
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return "RestDemandeSearch{id:" + getId() + ", code: " + getCode() + "}";
    }
}

```

---

### Objectif de `RestDemandeSearch`

La classe `RestDemandeSearch` est le **DTO renvoyé au frontend** lors d’une recherche de demandes avec la projection `PROJECTION_RECHERCHE_BACK_V2`.

Elle regroupe **toutes les informations nécessaires à l’affichage dans la table de résultats**, dans un format léger et structuré.

---

### Champs principaux

Voici les principaux champs présents dans ce DTO :

| Champ                                                          | Rôle                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| `id`, `code`                                                   | Identifiants uniques de la demande                   |
| `statut`                                                       | Statut actuel de la demande (ex: validée, rejetée…)  |
| `client`, `loueur`                                             | Informations synthétiques sur les entités impliquées |
| `apporteur`                                                    | Apporteur et groupe d’apporteurs liés                |
| `utilisateurCommercial`                                        | Nom du commercial qui gère cette demande             |
| `montantTotalAchatHT`, `montantTotalVenteHT`, `montantLoyerHT` | Montants financiers pour affichage                   |
| `dateCreation`, `datePaiement`                                 | Dates clés de la vie de la demande                   |
| `accord`                                                       | Accord obtenu pour la demande (bailleur, référence…) |
| `devise`                                                       | Devise utilisée pour les montants (ex : EUR)         |

> Tous ces champs sont utilisés **dans le tableau de résultats**, pour permettre un affichage complet et lisible des demandes.

---

### Annotation et structure

* `@XmlRootElement`, `@XmlAccessorType`... : annotations utilisées pour permettre la **sérialisation XML/JSON** automatique via JAX-RS.
* `@Getter` / `@Setter` : générés automatiquement grâce à **Lombok**, pour ne pas avoir à écrire manuellement les accesseurs.
* `toString()` : méthode de débogage simple pour afficher rapidement une demande dans les logs.

---

### Lien avec le reste du code

* C’est ce DTO qui est **renvoyé dans la méthode `search(...)`** du service REST, lorsque la projection demandée est `"PROJECTION_RECHERCHE_BACK_V2"`.
* C’est également ce qui est **affiché dans la table HTML Angular** grâce au `dataSource` bindé aux propriétés de ce DTO.

---


## Mapping XML – Déclaration du **converter** entre l’entité métier et le DTO

Dans l’application Java, le fichier `mapping.xml` sert à **configurer les conversions automatiques entre les objets métiers (entités) et les objets transférés (DTO)** grâce à un **mapper générique** (probablement basé sur Dozer ou une implémentation maison).

---

### Ce que fait ce bloc XML

```xml
<converter type="com.pharmagest.monalisa.rest.service.mapper.DemandeSearchConverter">
  <class-a>com.pharmagest.monalisa.rest.entity.Demande</class-a>
  <class-b>com.pharmagest.monalisa.rest.service.domain.demande.RestDemandeSearch</class-b>
</converter>
```

Ce bloc déclare un **convertisseur personnalisé (`DemandeSearchConverter`)** chargé de mapper :

* **`class-a` :** l’entité métier `Demande`, qui représente une demande complète en base de données,
* **`class-b` :** le DTO `RestDemandeSearch`, qui est renvoyé au frontend pour l’affichage dans la table.

---

### Pourquoi utiliser un converter personnalisé ?

Le mapping automatique ne suffit pas toujours (ex : sous-objets complexes, calculs spécifiques, formatages).
Le converter `DemandeSearchConverter` permet de :

* Sélectionner uniquement les champs utiles à exposer,
* Appliquer des **règles de transformation** (ex : changer une devise, formater une date…),
* Mapper des **relations imbriquées** (client, apporteur, facture…) vers leurs sous-DTO respectifs.

---

### Où est-il utilisé ?

Ce mapping est **activé automatiquement** lorsque l’on appelle une méthode comme :

```java
mapper.mapList(demandes, RestDemandeSearch.class);
```

dans la méthode `search(...)` du service REST.

Cela garantit que chaque objet `Demande` est converti proprement en un objet `RestDemandeSearch`, en appliquant la logique du converter déclaré ici.

---

demandeSearchConverter.java :

``` java
package com.pharmagest.monalisa.rest.service.mapper;

import com.github.dozermapper.core.CustomConverter;
import com.github.dozermapper.core.MappingException;
import com.pharmagest.monalisa.rest.entity.Demande;
import com.pharmagest.monalisa.rest.mapper.mapstruct.StatutShortMapper;
import com.pharmagest.monalisa.rest.processus.IFactureProcessus;
import com.pharmagest.monalisa.rest.service.domain.RestBailleurDetail;
import com.pharmagest.monalisa.rest.service.domain.RestClientMinimal;
import com.pharmagest.monalisa.rest.service.domain.RestDecisionShort;
import com.pharmagest.monalisa.rest.service.domain.RestGroupeApporteurShort;
import com.pharmagest.monalisa.rest.service.domain.RestLoueurMinimal;
import com.pharmagest.monalisa.rest.service.domain.apporteur.RestApporteurShortWithGroupe;
import com.pharmagest.monalisa.rest.service.domain.demande.RestDemandeSearch;
import com.pharmagest.monalisa.rest.service.domain.utilisateur.RestUtilisateurShort;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
public class DemandeSearchConverter implements CustomConverter {
    @Autowired
    private StatutShortMapper statutShortMapper;
    
    private final IFactureProcessus factureProcessus;
    
    @Autowired
    public DemandeSearchConverter(StatutShortMapper statutShortMapper, @Lazy IFactureProcessus factureProcessus) {
        this.statutShortMapper = statutShortMapper;
        this.factureProcessus = factureProcessus;
    }
    
    @Override
    public Object convert(final Object destination, final Object source, final Class destinationClass, final Class sourceClass) {
        
        if (source == null) {
            return null;
        }
        
        if (!(source instanceof Demande)) {
            throw new MappingException("DemandeSearchConverter : type source non supporté : " + source.getClass());
        }
        
        final Demande demande = (Demande) source;
        final RestDemandeSearch restDemandeSearch = destination == null ? new RestDemandeSearch() : (RestDemandeSearch) destination;
        
        restDemandeSearch.setId(demande.getId());
        restDemandeSearch.setCode(demande.getCode());
        restDemandeSearch.setDateCreation(demande.getDateCreation());
        
        if (demande.getUtilisateurCommercial() != null) {
            RestUtilisateurShort user = new RestUtilisateurShort();
            user.setId(demande.getUtilisateurCommercial().getId());
            user.setFullName(demande.getUtilisateurCommercial().getFullName());
            restDemandeSearch.setUtilisateurCommercial(user);
        }
        
        if (demande.getStatut() != null) {
            restDemandeSearch.setStatut(statutShortMapper.toRestDto(demande.getStatut()));
        }
        if (demande.getClient() != null) {
            RestClientMinimal client = new RestClientMinimal();
            client.setId(demande.getClient().getId());
            client.setRaisonSociale(demande.getClient().getRaisonSociale());
            client.setSiren(demande.getClient().getSiren());
            restDemandeSearch.setClient(client);
        }
        if (demande.getAccord() != null) {
            RestDecisionShort accord = new RestDecisionShort();
            RestBailleurDetail bailleur = new RestBailleurDetail();
            bailleur.setLibelle(demande.getAccord().getBailleur().getLibelle());
            accord.setBailleur(bailleur);
            accord.setReference(demande.getAccord().getReference());
            restDemandeSearch.setAccord(accord);
            
        }
        if (demande.getApporteur() != null) {
            RestApporteurShortWithGroupe restApporteur = new RestApporteurShortWithGroupe();
            restApporteur.setId(demande.getApporteur().getId());
            restApporteur.setCode(demande.getApporteur().getCode());
            restApporteur.setLibelle(demande.getApporteur().getLibelle());
            
            if (demande.getApporteur().getLoueur() != null) {
                RestLoueurMinimal loueur = new RestLoueurMinimal();
                loueur.setCode(demande.getApporteur().getLoueur().getCode());
                restDemandeSearch.setDevise(demande.getApporteur().getLoueur().getDevise().toString());
                restApporteur.setLoueur(loueur);
            }
            
            if (demande.getApporteur().getGroupeApporteurs() != null && !demande.getApporteur().getGroupeApporteurs().isEmpty()
                    && demande.getApporteur().getGroupeApporteurs().get(0) != null) {
                
                RestGroupeApporteurShort groupe = new RestGroupeApporteurShort();
                groupe.setId(demande.getApporteur().getGroupeApporteurs().get(0).getId());
                groupe.setNom(demande.getApporteur().getGroupeApporteurs().get(0).getNom());
                restApporteur.setGroupeApporteurs(groupe);
            }
            
            restDemandeSearch.setApporteur(restApporteur);
        }
        
        final Integer ordreTimeline = demande.getStatut() != null ? demande.getStatut().getOrdreTimeline() : null;
        
        if (ordreTimeline != null && ordreTimeline < 19) {
            if (demande.getSchemaFinancier() != null) {
                restDemandeSearch.setMontantTotalAchatHT(demande.getSchemaFinancier().getMontantHT());
                restDemandeSearch.setMontantLoyerHT(demande.getSchemaFinancier().getLoyerHT());
            }
            if (demande.getAccord() != null) {
                restDemandeSearch.setMontantTotalVenteHT(demande.getAccord().getMontantHT());
            }
        } else if (ordreTimeline != null) {
            if (demande.getFacturation() != null) {
                restDemandeSearch.setMontantLoyerHT(demande.getFacturation().getLoyerContrat());
            }
            BigDecimal totalAchat = factureProcessus.computeMontantTotalAchat(demande.getFactures());
            BigDecimal totalVente = factureProcessus.computeMontantTotalVente(demande.getFactures());
            restDemandeSearch.setMontantTotalAchatHT(totalAchat);
            restDemandeSearch.setMontantTotalVenteHT(totalVente);
        }
        
        return restDemandeSearch;
    }
}
```
## `DemandeSearchConverter` – Mettre en forme une **Demande** pour l’envoyer au frontend

Ce converter personnalisé est appelé chaque fois qu’on veut transformer l’entité métier `Demande` en DTO `RestDemandeSearch`.
Il implémente l’interface **Dozer `CustomConverter`**, afin de pouvoir exécuter du code métier plus fin qu’un mapping déclaratif.

---

### 1. Sécurité et pré‑conditions

```java
if (source == null) return null;
if (!(source instanceof Demande)) throw new MappingException(...);
```

* **Null‑safety** : on renvoie `null` si rien n’est fourni.
* **Type‑safety** : on s’assure que la source est bien une `Demande`, sinon on lève une exception claire.

---

### 2. Création (ou réutilisation) du DTO

```java
RestDemandeSearch rest = destination == null ? new RestDemandeSearch() : (RestDemandeSearch) destination;
```

* Dozer peut recycler une instance déjà créée ; sinon on en instancie une nouvelle.

---

### 3. Copie des champs **simples**

```java
rest.setId(d.getId());
rest.setCode(d.getCode());
rest.setDateCreation(d.getDateCreation());
```

> Identifiants, code et date de création passent tels quels.

---

### 4. Mapping des **sous‑objets** (client, apporteur, bailleur, etc.)

| Sous‑objet                 | DTO cible                                   | Champs repris                              |
| -------------------------- | ------------------------------------------- | ------------------------------------------ |
| **Statut**                 | `RestStatutShort` (via `StatutShortMapper`) | id, libellé…                               |
| **Utilisateur commercial** | `RestUtilisateurShort`                      | id, fullName                               |
| **Client**                 | `RestClientMinimal`                         | id, raison sociale, SIREN                  |
| **Accord / Bailleur**      | `RestDecisionShort` + `RestBailleurDetail`  | libellé bailleur, référence accord         |
| **Apporteur**              | `RestApporteurShortWithGroupe`              | id, code, libellé, groupe, loueur & devise |

Tous ces sous‑DTO sont construits « à la main » pour **n’exposer que les champs utiles** et éviter des boucles de dépendances.

---

### 5. Calcul des **montants financiers**

La logique dépend du **statut de la demande** (repéré par `ordreTimeline`) :

| Cas                                              | Sources de montants                                  | Champs renseignés                                              |
| ------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------- |
| **Statut < 19** (demande encore « pré‑contrat ») | `schemaFinancier` (achat + loyer) + `accord` (vente) | `montantTotalAchatHT`, `montantLoyerHT`, `montantTotalVenteHT` |
| **Statut ≥ 19** (factures disponibles)           | `factureProcessus.computeMontantTotalAchat/ Vente()` | mêmes champs, mais calculés à partir des factures réelles      |

Ainsi :

* **Avant facturation** : on affiche les montants théoriques du contrat.
* **Après facturation** : on bascule sur les montants réellement émis.

---

### 6. Renvoi du DTO

Le DTO complet, enrichi et allégé, est renvoyé au mapper Dozer, qui le transmet ensuite au service REST → frontend.

---

### En résumé

* **But** : fournir un objet léger, prêt à l’emploi pour Angular, sans exposer toute la complexité de l’entité `Demande`.
* **Points clés** : null‑safety, mapping manuel des sous‑objets, calcul conditionnel des montants, ajout de la devise.
* **Avantage** : le frontend reçoit exactement les données qu’il attend, sans surcharge ni appels secondaires.

dans FactureProcessusImpl.java : 

```java
@Override
    public BigDecimal computeMontantTotalAchat(List<Facture> factures) {
        return computeTotalBySens(factures, SensFacture.ACHAT);
    }
    
    @Override
    public BigDecimal computeMontantTotalVente(List<Facture> factures) {
        return computeTotalBySens(factures, SensFacture.VENTE);
    }
    
    private BigDecimal computeTotalBySens(List<Facture> factures, String sensRecherche) {
        final Set<String> CODES_SOUS_TYPES_FATURE_AUTORISES =
                Set.of(SousTypeFacture.ACQUISITION_FACTURE_ACHAT, SousTypeFacture.ACQUISITION_FACTURE_VENTE, SousTypeFacture.ACQUISITION_AVOIR_ACHAT,
                        SousTypeFacture.ACQUISITION_AVOIR_VENTE, SousTypeFacture.ACQUISITION_EXTOURNE_ACHAT, SousTypeFacture.ACQUISITION_EXTOURNE_VENTE);
        
        BigDecimal total = BigDecimal.ZERO;
        if (CollectionUtils.isEmpty(factures)) {
            return BigDecimal.ZERO;
        }
        return factures.stream()
                .filter(facture -> facture.getDateComptabilisation() != null
                        && facture.getSousTypeFacture() != null
                        && CODES_SOUS_TYPES_FATURE_AUTORISES.contains(facture.getSousTypeFacture().getCode())
                        && facture.getMontantTotalHT() != null
                        && facture.getSensFacture() != null
                        && sensRecherche.equals(facture.getSensFacture().getCode()))
                .map(Facture::getMontantTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
```

---

## Objectif de ces fonctions

Ces méthodes calculent le **montant total HT** des factures d’une demande, en distinguant **les achats** des **ventes**.
Elles sont utilisées dans le `DemandeSearchConverter` pour enrichir le DTO `RestDemandeSearch` avec des données financières *réelles*, issues de la facturation.

---

## Fonctions exposées

### `computeMontantTotalAchat(List<Facture> factures)`

> Retourne la somme des montants HT des factures d’**achat**.

Elle appelle :

```java
computeTotalBySens(factures, SensFacture.ACHAT)
```

---

### `computeMontantTotalVente(List<Facture> factures)`

> Retourne la somme des montants HT des factures de **vente**.

 Elle appelle :

```java
computeTotalBySens(factures, SensFacture.VENTE)
```

---

## Fonction interne `computeTotalBySens(...)`

Cette fonction réalise tout le traitement métier :

```java
private BigDecimal computeTotalBySens(List<Facture> factures, String sensRecherche)
```

### Étapes du calcul

1. **Vérification de la liste**
   Si la liste est vide ou nulle → on retourne `0`.

2. **Filtrage des factures valides**
   On garde uniquement les factures qui :

   * ont une **date de comptabilisation** (facture effective),
   * ont un **sous-type** autorisé (cf. liste ci-dessous),
   * ont un **montant HT** non nul,
   * ont un **sens** (ACHAT ou VENTE) qui correspond au `sensRecherche`.

3. **Liste des sous-types autorisés**

   * `ACQUISITION_FACTURE_ACHAT`
   * `ACQUISITION_FACTURE_VENTE`
   * `ACQUISITION_AVOIR_ACHAT`
   * `ACQUISITION_AVOIR_VENTE`
   * `ACQUISITION_EXTOURNE_ACHAT`
   * `ACQUISITION_EXTOURNE_VENTE`

   Cela permet de filtrer uniquement les factures comptabilisées **reliées à une acquisition**.

4. **Calcul de la somme**
   On extrait les `montantTotalHT` des factures filtrées, puis on les additionne.

---

### En résumé

| Fonction                   | Rôle                                            | Filtrage                                                   |
| -------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `computeMontantTotalAchat` | Calcule les **achats** HT totaux d’une demande  | Sens = `ACHAT`                                             |
| `computeMontantTotalVente` | Calcule les **ventes** HT totales d’une demande | Sens = `VENTE`                                             |
| `computeTotalBySens`       | Fonction centrale                               | Applique les règles métier (type, sens, montant, validité) |

---

### Pourquoi ce filtrage ?

Il garantit que seules les **factures comptabilisées**, **pertinentes**, et **cohérentes avec l’analyse** sont prises en compte pour les montants. Cela renforce la fiabilité des données transmises au frontend.

