---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Nombre de résultats / Montant totaux - Côté Client

## le datasource ce que j'ai ajouté

``` typescript
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

Dans le cadre de l’enrichissement des données affichées lors d’une recherche de demandes, j’ai modifié la méthode `searchDemande()` du composant en y ajoutant la gestion de trois nouvelles informations :

* **le nombre total d’éléments** (`numberTotalElementSubject`),
* **le montant total d'achat HT** (`montantTotalAchatHTSubject`),
* **et le montant total de vente HT** (`montantTotalVenteHTSubject`).

Ces trois valeurs sont extraites directement du DTO (`DemandesSearchDTO`) renvoyé par le backend via la méthode `searchDemandesByCriteria`. Elles ont été ajoutées côté serveur pour permettre l’affichage d’indicateurs financiers globaux dès la recherche. Chaque donnée est transmise au composant à l’aide d’un `tap()` dans la chaîne `RxJS`, ce qui permet de mettre à jour les `Subjects` correspondants.

Ce mécanisme assure une liaison réactive entre les résultats renvoyés par le serveur et les données affichées à l'écran, tout en maintenant une bonne séparation entre logique métier et affichage.

---
## le composant html

### Objectif général :

Afficher un **bloc de résultats de recherche** contenant :

1. Le **nombre de résultats** trouvés, avec un texte adapté au pluriel/singulier,
2. Le **montant total HT** des demandes d’achat et de vente, si des résultats sont présents.

---

### Détail du code :

```html
<ml-ui-bloc [class.hide]="!showSearchResult">
```

* Ce composant `<ml-ui-bloc>` représente un bloc visuel (probablement une **section stylisée**) de l'UI.
* Il est masqué (`.hide`) si `showSearchResult` vaut `false`.

---

```html
<ml-ui-bloc-title>
```

* C'est l'en-tête du bloc (titre/entête graphique).

---

```html
<div [ngPlural]="numberTotalElement">
```

* Directive `ngPlural` d'Angular utilisée pour **gérer dynamiquement le pluriel** en fonction du nombre.
* Ici, on affiche un texte différent selon la valeur de `numberTotalElement`.

#### Cas gérés :

```html
<ng-template ngPluralCase="-1">
  <span i18n>Résultats</span> <!-- Cas par défaut ou indéfini -->
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
```

* `-1` : Cas spécial ou fallback (souvent inutile mais parfois utilisé par sécurité).
* `0`, `1`, `other` : Cas gérés classiquement pour afficher "Résultat trouvé" ou "Résultats trouvés".

---

```html
<span *ngIf="numberTotalElement > 0" class="recherche-demande__resultat__titre__montants">
  Total Achat HT : <b>{{ montantTotalAchatHT | number:'1.2-2' }}</b> € -
  Total Vente HT : <b>{{ montantTotalVenteHT | number:'1.2-2' }}</b> €
</span>
```

* Affiche les **totaux HT** uniquement **si au moins un résultat** est présent.
* Le **pipe `number`** est utilisé pour :

  * formater le nombre avec **2 décimales minimum** et **2 maximum** (`'1.2-2'`).
  * Exemple : `1275.5` → `1 275,50`

---

### Résumé

Ce code permet d'afficher dynamiquement :

* Le bon **libellé selon le nombre de résultats** (0, 1, plusieurs),
* Et **les montants totaux** des achats et ventes **si** des résultats sont trouvés.

### code source
```html 
    <ml-ui-bloc [class.hide]="!showSearchResult">
    <ml-ui-bloc-title>
      <div [ngPlural]="numberTotalElement">
        <ng-template ngPluralCase="-1"><span i18n>Résultats</span></ng-template>
        <ng-template ngPluralCase="0"> <span>
          {{ numberTotalElement }} <span i18n>Résultat trouvé</span><br />
        </span></ng-template>
        <ng-template ngPluralCase="1"> <span>
          {{ numberTotalElement }} <span i18n>Résultat trouvé</span><br />
        </span></ng-template>
        <ng-template ngPluralCase="other"> <span>
          {{ numberTotalElement }} <span i18n>Résultats trouvés</span><br />
        </span></ng-template>


      </div>

      <span *ngIf="numberTotalElement > 0" class="recherche-demande__resultat__titre__montants">
      Total Achat HT : <b>{{ montantTotalAchatHT | number:'1.2-2' }}</b> € -
      Total Vente HT : <b>{{ montantTotalVenteHT | number:'1.2-2' }}</b> €
    </span>
    </ml-ui-bloc-title>
```

## le css

````scss
  &__titre {
      &__montants {
        font-size: medium;
      }
    }
````

## le composant

ngOnInit

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

le reste

``` typescript
search() {
    if (this.formGroupDemandeCriteria.invalid) {
      this.formGroupDemandeCriteria.markAllAsTouched();
      return;
    }
    this.showSearchResult = true;



  /**
   * Initialise la source de données des demandes.
   * - Souscrit aux observables exposés par la datasource pour :
   *   - Mettre à jour le numéro de page.
   *   - Mettre à jour le nombre total d'éléments.
   *   - Mettre à jour l'état de chargement (loading).
   * - Gère l'affichage des résultats en fonction du nombre total d'éléments.
   */
  private initDataSource() {
    this.demandeDataSource = new DemandeDataSource(this.demandeService);
    this.demandeDataSource.numberPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.numberPage = value));
    this.demandeDataSource.numberTotalElement$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.numberTotalElement = value;
    });
    this.demandeDataSource.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.searchLoading = value));
    this.demandeDataSource.montantTotalAchatHT$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.montantTotalAchatHT = value));
    this.demandeDataSource.montantTotalVenteHT$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.montantTotalVenteHT = value));
  }

}
```

### demande.datasource.ts

### Ajout des indicateurs dans le DataSource

Pour permettre l'affichage du **montant total d’achat HT** et du **montant total de vente HT** dans l'interface utilisateur, j’ai modifié la classe `DemandeDataSource`, qui gère la logique de récupération et de diffusion des données vers la vue. J’ai ajouté deux nouveaux `BehaviorSubject` :

* `montantTotalAchatHTSubject`
* `montantTotalVenteHTSubject`

Ces `Subject` permettent de stocker et diffuser de manière réactive les montants financiers globaux récupérés depuis le backend, via le DTO enrichi (`DemandesSearchDTO`). Des observables correspondants ont également été exposés (`montantTotalAchatHT$` et `montantTotalVenteHT$`) afin que les composants de présentation puissent s’y abonner et afficher ces informations.

J’ai également modifié la méthode `searchDemande()` pour y inclure deux nouveaux appels `tap()` qui récupèrent les valeurs `montantTotalAchatHT` et `montantTotalVenteHT` du résultat renvoyé par le service `searchDemandesByCriteria`. Cela garantit que les données financières globales sont disponibles dès la fin de la requête de recherche.

Cette modification s'inscrit dans une logique de présentation enrichie, visant à offrir à l’utilisateur une **vue synthétique instantanée des montants engagés**, en plus de la liste détaillée des demandes.

---

## recherche-demandes.form-group.ts

### ajout du validators.pattern

````typescript
code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
````
