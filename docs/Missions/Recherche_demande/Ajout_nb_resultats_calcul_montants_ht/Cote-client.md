---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---

# Nombre de résultats / Montant totaux - Côté Client

## Modification du DataSource : Ajout des indicateurs financiers

:::info

Le code source de ce ticket se trouve [ici](../../../annexes/bout_de_code/Projet_recherche_demande/montants_totaux/client)
:::
Dans ce ticket, j’ai modifié la méthode `searchDemande()` du composant pour intégrer trois nouvelles informations venant du backend : 

1. **Le nombre total d’éléments** (`numberTotalElementSubject`),
2. **Le montant total d'achat HT** (`montantTotalAchatHTSubject`),
3. **Le montant total de vente HT** (`montantTotalVenteHTSubject`).

Ces valeurs sont récupérées directement depuis le DTO (`DemandesSearchDTO`) renvoyé par le backend. Voici le code que j'ai ajouté :

```typescript
searchDemande(demandeCriteria: any, indexPage: number) {
  this.loadingSubject.next(true);
  this.numberTotalElementSubject.next(this.NO_SEARCH);
  const criteria = {
    ...demandeCriteria,
    startPage: indexPage,
    currentProjection: 'projectionRechercheBackV2',
  };
  this.demandeService
    .searchDemandesByCriteria(criteria)
    .pipe(
      tap((demandes) => this.demandeSubject.next(demandes.list)),
      tap((demandes) => this.numberPageSubject.next(demandes.offset - 1)),
      tap((demandes) => this.numberTotalElementSubject.next(demandes.total)),
      tap((demandes) => this.montantTotalAchatHTSubject.next(demandes.montantTotalAchatHT ?? 0)),
      tap((demandes) => this.montantTotalVenteHTSubject.next(demandes.montantTotalVenteHT ?? 0)),
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false)),
    )
    .subscribe();
}
```

### Explication du code ajouté

1. **Paramètres modifiés** :

   * `currentProjection: 'projectionRechercheBackV2'` permet de définir une projection spécifique côté serveur, incluant les nouveaux champs financiers.
2. **Gestion des nouveaux indicateurs financiers** :

   * J'ai ajouté des `tap()` pour stocker et diffuser les valeurs financières :

     * `montantTotalAchatHTSubject` : Montant total des achats HT.
     * `montantTotalVenteHTSubject` : Montant total des ventes HT.
     * `numberTotalElementSubject` : Nombre total d'éléments retournés par la recherche.
3. **Gestion de la pagination et des erreurs** :

   * `catchError(() => of([]))` permet d'éviter des erreurs dans l'affichage si la requête échoue.
   * `finalize(() => this.loadingSubject.next(false))` garantit que l'indicateur de chargement est désactivé à la fin du traitement.

---

## Mise à jour du composant HTML pour l'affichage des résultats

Pour afficher dynamiquement les résultats et les totaux, j'ai mis à jour le fichier HTML afin de rendre visible le nombre total de résultats et les montants totaux. Le code suivant permet d'afficher ces informations de manière conditionnelle.

```html
<ml-ui-bloc [class.hide]="!showSearchResult">
  <ml-ui-bloc-title>
    <div [ngPlural]="numberTotalElement">
      <ng-template ngPluralCase="-1">
        <span i18n>Résultats</span>
      </ng-template>
      <ng-template ngPluralCase="0">
        {{ numberTotalElement }} <span i18n>Résultat trouvé</span><br />
      </ng-template>
      <ng-template ngPluralCase="1">
        {{ numberTotalElement }} <span i18n>Résultat trouvé</span><br />
      </ng-template>
      <ng-template ngPluralCase="other">
        {{ numberTotalElement }} <span i18n>Résultats trouvés</span><br />
      </ng-template>
    </div>
    <span *ngIf="numberTotalElement > 0" class="recherche-demande__resultat__titre__montants">
      Total Achat HT : <b>{{ montantTotalAchatHT | number:'1.2-2' }}</b> € -
      Total Vente HT : <b>{{ montantTotalVenteHT | number:'1.2-2' }}</b> €
    </span>
  </ml-ui-bloc-title>
</ml-ui-bloc>
```

### Explication

* **`ngPlural`** : Utilisé pour afficher le texte en fonction du nombre de résultats, avec une gestion dynamique du pluriel.
* **Affichage des totaux** : Les montants totaux d'achat et de vente HT sont affichés uniquement si des résultats sont trouvés. Le pipe `number` permet de formater les valeurs numériques avec deux décimales.

---

## Intégration dans le cycle de vie du composant

Ensuite, dans le `ngOnInit()`, j'ai intégré l'initialisation des données et l'abonnement aux flux afin de maintenir la réactivité des informations affichées.

```typescript
ngOnInit(): void {
  this.initDataSource();
  this.formGroupDemandeCriteria = RechercheDemandesFormGroup.build();
  this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
    this.formGroupDemandeCriteria.reset();
    if (Object.keys(params).length > 0) {
      const {page = 0, ...criteriaParams} = params;
      const pageIndex = +page;
      this.formGroupDemandeCriteria.patchValue(criteriaParams, {emitEvent: false});
      if (this.formGroupDemandeCriteria.invalid) {
        this.formGroupDemandeCriteria.markAllAsTouched();
      } else {
        this.showSearchResult = true;
        this.demandeDataSource.searchDemande(criteriaParams, pageIndex);
        this.demandeDataSource.numberTotalElement$
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            filter((total) => total !== -1),
            take(1),
          )
          .subscribe((total) => {
            this.numberTotalElement = total;
            const totalPages = Math.ceil(total / 10);
            if (pageIndex >= totalPages && Math.abs(totalPages) > 0) {
              this.updateUrlWithNewPage(totalPages);
            }
          });
      }
    }
  });
}
```

---

### Résumé

* J'ai modifié la **DataSource** pour inclure des informations supplémentaires comme le nombre total d'éléments et les montants totaux.
* J'ai mis à jour le **composant HTML** pour rendre visibles ces données sous forme d'indicateurs financiers, tout en gérant dynamiquement le pluriel pour le nombre de résultats.
* J'ai intégré ces changements dans le **cycle de vie du composant**, afin d'assurer une bonne réactivité et une interface utilisateur fluide.

---
