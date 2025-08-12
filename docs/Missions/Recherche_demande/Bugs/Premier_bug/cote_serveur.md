---
sidebar_label: Côté serveur
sidebar_position: 2
tags:
  - Java
  - Backend
  - Projection
---

# Côté serveur – Création d’une projection dédiée

## Objectif
Isoler la logique de recherche de la nouvelle page Angular 2+ pour éviter tout impact sur l’ancienne page.

---

## Modifications

### 1. Nouvelle constante dans `DemandeCriteria.java`
```java
public static final String PROJECTION_RECHERCHE_BACK_V2 = "projectionRechercheBackV2";
```

### 2. Ajout dans la factory ProjectionDemandeFactory.java

```java
projections.add(DemandeProjectionRechercheBackV2Impl.getInstance());
```
:::info
Cette factory centralise toutes les projections possibles pour les demandes.
:::

### 3. Nouveau case dans DemandeDaoImpl.java
```java
case DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2 -> {
    setProtections(demandeList);
    setGroupesApporteursToApporteurs(demandeList);
    setFacturesToDemandes(demandeList);
}
```
### 4. Nouvelle classe DemandeProjectionRechercheBackV2Impl.java

```java
return Projections.bean(Demande.class,
    Q_DEMANDE.id,
    Q_DEMANDE.code,
    Q_DEMANDE.dateCreation,
    ...
    Projections.bean(Facturation.class,
        Q_FACTURATION.id,
        Q_FACTURATION.montantHT,
        Q_FACTURATION.loyerCalcule
    ).as(Q_DEMANDE.facturation)
);
```
:::info
Cette projection définit précisément quelles données sont envoyées au frontend.
:::

### 5. Adaptation dans SearchService.java
```java
if (DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2.equals(demandeCriteria.getCurrentProjection())) {
    return Response.ok(new RestCollectionResult<>(
        mapper.mapList(demandes, RestDemandeSearch.class),
        demandeCriteria.getStartPage(), count)).build();
}
```
Impact :
L’ancienne projection reste intacte (projectionRechercheBack)
La nouvelle page Angular utilise exclusivement projectionRechercheBackV2.

---
