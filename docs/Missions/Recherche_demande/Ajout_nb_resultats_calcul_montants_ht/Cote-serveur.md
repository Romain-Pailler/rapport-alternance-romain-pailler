---
sidebar_label: Côté serveur
sidebar_position: "2"
tags: 
    - Migration
    - Java
---
# Calcul des Montants Totaux HT - Côté Serveur

## Introduction

L’objectif de ce ticket était d'ajouter la logique nécessaire pour calculer les montants totaux HT (achats et ventes) en fonction des demandes, en tenant compte de divers critères tels que le statut des demandes, le sens de la facture (achat/vente), et les sous-types de facture. Ces montants doivent être renvoyés à l'interface client sous forme de réponses agrégées pour chaque recherche.

---

## DemandeDaoImpl - Calcul des Montants HT

J’ai implémenté la méthode `getMontantTotalHTBeforeAttenteDePaiement` pour calculer le montant total HT des demandes avant leur passage en statut **"ATTENTE_PAIEMENT"**. Cette méthode fait la distinction entre les demandes d'achat et de vente, et calcule le montant HT en fonction du statut des factures.

### Code ajouté

```java
@Override
public BigDecimal getMontantTotalHTBeforeAttenteDePaiement(
        List<Long> demandeIds,
        Utilisateur utilisateur,
        String sensFacture
) {
    final QDemande qDemandeMaster = new QDemande("demandeMaster");
    final QStatut qStatutMaster = new QStatut("statutMaster");
    final QStatut qStatutSub = QStatut.statut;

    final Integer ordreTimelineAttentePaiement = createQuery()
            .select(qStatutSub.ordreTimeline)
            .from(qStatutSub)
            .where(qStatutSub.code.eq(Statut.ATTENTE_PAIEMENT))
            .fetchFirst();

    if (SensFacture.ACHAT.equals(sensFacture)) {
        final QSchemaFinancier qSchemaFinancierMaster = new QSchemaFinancier("schemaFinancierMaster");
        final JPQLQuery<BigDecimal> query = createQuery()
                .from(qDemandeMaster)
                .leftJoin(qDemandeMaster.statut, qStatutMaster)
                .leftJoin(qDemandeMaster.schemaFinancier, qSchemaFinancierMaster)
                .where(qDemandeMaster.id.in(demandeIds))
                .where(qStatutMaster.ordreTimeline.lt(ordreTimelineAttentePaiement))
                .select(qSchemaFinancierMaster.montantHT.sum());
        
        return query.fetchFirst() != null ? query.fetchFirst() : BigDecimal.ZERO;
    } else {
        final QDecision qDecisionMaster = new QDecision("decisionMaster");
        final JPQLQuery<BigDecimal> query = createQuery()
                .from(qDemandeMaster)
                .leftJoin(qDemandeMaster.statut, qStatutMaster)
                .leftJoin(qDemandeMaster.accord, qDecisionMaster)
                .where(qDemandeMaster.id.in(demandeIds))
                .where(qStatutMaster.ordreTimeline.lt(ordreTimelineAttentePaiement))
                .select(qDecisionMaster.montantHT.sum());
        
        BigDecimal result = query.fetchFirst();
        return result != null ? result : BigDecimal.ZERO;
    }
}
```

### Explication

* **SensFacture.ACHAT** et **SensFacture.VENTE** : Selon le sens de la facture, le calcul sera effectué soit avec les données du **Schéma Financier** (pour les achats), soit avec les données des **Décisions** (pour les ventes).
* **`ordreTimeline`** : Permet de filtrer les demandes en fonction de leur statut. Seules celles ayant un statut antérieur à "ATTENTE\_PAIEMENT" sont prises en compte dans les calculs.
* **Retour du montant** : Si aucune donnée n'est trouvée, la méthode retourne `BigDecimal.ZERO`, garantissant ainsi qu'il n'y a pas de valeurs nulles dans les résultats.

---

## DemandeSearchResultDomain - Représentation des Montants Totaux

J’ai créé la classe `DemandeSearchResultDomain` pour encapsuler les montants totaux d’achat et de vente HT afin de pouvoir les transmettre facilement au client sous forme de réponse.

### Code ajouté

```java
@Getter
@Setter
@AllArgsConstructor
public class DemandeSearchResultDomain {
    
    private BigDecimal montantTotalAchatHT;
    private BigDecimal montantTotalVenteHT;
}
```

### Explication

Cette classe permet de stocker les deux montants totaux (achats et ventes), qui sont ensuite renvoyés dans la réponse de l'API. Elle contient des annotations **`@Getter`** et **`@Setter`** pour générer automatiquement les méthodes d'accès, ce qui simplifie l'usage de ces objets dans le code.

---

## DemandeSearchProcessusImpl - Calcul des Montants Totaux HT pour la Recherche

Dans la méthode `getMontantSearchDemande`, j’ai combiné les résultats des méthodes précédentes pour calculer les montants totaux d'achats et de ventes pour un ensemble de demandes, en fonction des critères fournis.

### Code ajouté

```java
@Override
public DemandeSearchResultDomain getMontantSearchDemande(final DemandeCriteria criteria) {
    criteria.setPaginate(false);
    final List<Demande> demandes = searchByCriteria(criteria);
    final List<Long> demandeIds = demandes.stream().map(Demande::getId).toList();
    
    final BigDecimal montantTotalAchatHT = getMontantTotalAchatHTByCriteria(demandeIds);
    final BigDecimal montantTotalVenteHT = getMontantTotalVenteHTByCriteria(demandeIds);
    
    return new DemandeSearchResultDomain(montantTotalAchatHT, montantTotalVenteHT);
}
```

### Explication

* **Critères de recherche** : La méthode reçoit un objet `DemandeCriteria` qui contient les critères de la recherche, et désactive la pagination pour récupérer toutes les demandes correspondant aux critères.
* **Combinaison des résultats** : Après avoir récupéré les demandes via `searchByCriteria()`, j’ai extrait les identifiants de ces demandes et utilisé les méthodes `getMontantTotalAchatHTByCriteria()` et `getMontantTotalVenteHTByCriteria()` pour obtenir les montants totaux des achats et des ventes respectivement.
* **Retour** : La méthode retourne un objet `DemandeSearchResultDomain` contenant les deux montants totaux.

---

## SearchService - API de Recherche avec Projection

Dans le service `SearchService`, j'ai modifié le point de terminaison `GET /demandes/search` pour inclure les montants totaux dans la réponse. J’ai utilisé les méthodes du `DemandeSearchProcessus` pour obtenir les montants totaux d'achats et de ventes et les ajouter à la réponse.

### Code ajouté

```java
@GET
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response search(@Context final UriInfo info, @HeaderParam(Constantes.AUTH_KEY_FROM) final String from) {
    final DemandeCriteria demandeCriteria = new DemandeCriteria(info.getQueryParameters(), from);
    
    if (demandeCriteria.getVersion().equals(DemandeCriteria.Version.V2)) {
        final Long count = demandeSearchProcessus.countAllByCriteria(demandeCriteria);
        final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria);
        if (DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2.equals(demandeCriteria.getCurrentProjection())) {
            final DemandeSearchResultDomain montantsDemandes = demandeSearchProcessus.getMontantSearchDemande(demandeCriteria);
            return Response.ok(new RestRechercheDemandeResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count, montantsDemandes.getMontantTotalAchatHT(), montantsDemandes.getMontantTotalVenteHT())).build();
        }
    }
}
```

### Explication

* **Projection spécifique** : La projection `PROJECTION_RECHERCHE_BACK_V2` est utilisée pour renvoyer les montants totaux dans la réponse de la recherche. Les montants sont récupérés via le `DemandeSearchProcessus`.
* **Format de la réponse** : Les résultats de la recherche, ainsi que les montants totaux, sont envoyés sous forme de `RestRechercheDemandeResult`, ce qui permet une sérialisation claire et structurée des données.

---

## Tests Unitaires

J’ai ajouté des tests pour valider le bon calcul des montants totaux, en vérifiant que les montants sont correctement calculés et renvoyés dans la réponse. Ces tests valident les différentes parties du processus, notamment le calcul des montants pour les demandes avant et après le statut **"ATTENTE\_PAIEMENT"**.

### Exemple de test

```java
@Test
public void itShouldReturnMontantTotalHTAchatForDemandesBeforeAttenteDePaiement() {
    // GIVEN
    List<Long> demandeIds = Arrays.asList(demandePerimetre.getId(), demandeHorsPerimetre.getId());
    
    // WHEN
    BigDecimal result = demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, utilisateur, SensFacture.ACHAT);
    
    // THEN
    assertThat(result).isNotNull();
    assertThat(result).isEqualByComparingTo(schemaFinancier1.getMontantHT());
}
```

---

### Résumé

* J'ai développé les méthodes nécessaires pour calculer les montants totaux HT pour les demandes d'achat et de vente en fonction des statuts et des critères.
* J'ai intégré ces calculs dans les services de recherche et j'ai ajusté l'API pour renvoyer ces montants dans les résultats de recherche.
* Des tests ont été ajoutés pour valider que les montants sont correctement calculés et renvoyés dans la réponse.

---
