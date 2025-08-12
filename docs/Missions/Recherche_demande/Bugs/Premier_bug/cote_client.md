---
sidebar_label: Côté client
sidebar_position: 3
tags:
  - Angular
  - Frontend
  - API
---

# Côté client – Utilisation de la nouvelle projection

## Objectif
Pointer la nouvelle page de recherche vers la projection dédiée `projectionRechercheBackV2` pour éviter tout conflit avec l’ancienne page.

---

## Modification principale

### Fichier : `recherche-demandes.component.ts`

```ts
searchPage(index: number) {
  const criteria: any = {
    currentProjection: 'projectionRechercheBackV2'
  };
  this.demandeDataSource.searchDemande(criteria, index);
}
```
Avant, ce champ contenait la valeur projectionRechercheBack utilisée aussi par l’ancienne page.

## Effet immédiat
La nouvelle page charge uniquement les champs définis dans projectionRechercheBackV2.

L’ancienne page continue à utiliser projectionRechercheBack.

## Bénéfice :
Code plus clair, isolation des comportements, et réduction des risques de régressions.

---
