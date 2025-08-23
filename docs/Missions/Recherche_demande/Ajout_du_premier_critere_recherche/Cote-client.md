---
sidebar_label: Filtre numéro demande - code source
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Premier filtre de recherche - Côté Client

## Mise en place du premier critère de recherche – Le FormGroup

Dans Angular, un `FormGroup` représente un ensemble de contrôles de formulaire (inputs) regroupés logiquement. Il permet de gérer l'état, la validation, et la récupération des valeurs de plusieurs champs dans un formulaire de manière structurée.

:::info
Le code source entier se trouve [ici](../../../annexes/bout_de_code/Projet_recherche_demande/cote_client)
:::

### Déclaration du FormGroup

``` typescript
export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null),
    });
  }
}
```

### Explication

* La classe `RechercheDemandesFormGroup` expose une méthode statique `build()` qui construit et retourne une instance de `FormGroup`.
* Le champ `code` est ici le **premier critère de recherche** que j'ai mis en place dans le formulaire. Il est associé à un `FormControl` initialisé à `null`.
* J'ai ensuite injecté ce `FormGroup` dans le composant Angular pour :

  * Lier dynamiquement les champs du formulaire dans le HTML.
  * Centraliser les valeurs saisies par l’utilisateur.
  * Faciliter la validation et la gestion des erreurs de formulaire.
  * Extraire les données pour les envoyer vers un service ou les utiliser dans l’URL via les query parameters (cf. composant ci-après).

---

## Le composant HTML – Liaison du champ de recherche au formulaire

J'ai ajouté dans le fichier HTML du composant le champ de saisie pour le numéro de dossier (`code`), en le liant dynamiquement au `FormGroup`.

### Extrait de code

```html
    <form
      (ngSubmit)="search()"
      [formGroup]="formGroupDemandeCriteria"
    >
      <div class="uig uis">
        <div class="uiu-1-6">
          <ml-ui-form-field>
            <ml-ui-label i18n>N° dossier</ml-ui-label>
            <input
              type="text"
              formControlName="code"
              mlUiInput
              (keydown.space)="$event.preventDefault()"
            />
          </ml-ui-form-field>
        </div>
      </div>
      <div>
        <button type="submit" mlUiButton [disabled]="searchLoading">
          <ml-ui-icon icon="search"></ml-ui-icon>
          <span i18n>Rechercher</span>
        </button>
      </div>
    </form>
```

### Explication

* Le champ de saisie `input` est relié à la propriété `code` du `FormGroup` grâce à `formControlName="code"`.
* L’attribut `(ngSubmit)="search()"` permet d’appeler la méthode TypeScript nommée `search()` lors de la soumission du formulaire (par exemple après clic sur le bouton).
* L’attribut `(keydown.space)="$event.preventDefault()"` empêche l’insertion d’un espace dans le champ, évitant ainsi des valeurs non souhaitées.
* Le bouton est désactivé dynamiquement si `searchLoading` est vrai, permettant de désactiver l’action pendant un chargement ou une requête en cours.

Ce petit formulaire constitue donc l'interface utilisateur pour le moment, j'ai aussi ajouté la logique des **query parameters** détaillés ci-après.

---

## Objectif général du composant

## 1. Initialisation du composant – `ngOnInit`

```ts
ngOnInit(): void {
  this.initDataSource(); // ①
  this.formGroupDemandeCriteria = RechercheDemandesFormGroup.build(); // ②

  this.route.queryParams.pipe(...).subscribe((params) => { // ③
    ...
  });
}
```

### Détail

* **① `initDataSource()`** : initialise la **data source** et ses observables pour récupérer le nombre total d’éléments, la page actuelle, et l’état de chargement.
* **② `formGroupDemandeCriteria`** : formulaire réactif pour filtrer les demandes.
* **③ `this.route.queryParams`** : souscription aux **query params**. Chaque fois qu’ils changent (page ou filtres), le composant :

  * Réinitialise le formulaire ;
  * Applique les critères depuis l’URL (`patchValue`) ;
  * Lance la recherche via `demandeDataSource.searchDemande()` ;
  * Corrige l’index de page si celui dans l’URL est supérieur au total de pages disponibles.

---

## 2. Recherche – `search()`

```ts
search() {
  const criteria = {
    ...this.formGroupDemandeCriteria.value,
    currentProjection: 'projectionRechercheBackV2',
  };
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      ...criteria,
      page: 0,
    },
    queryParamsHandling: 'merge',
  });
}
```

### À retenir

* Construit les critères à partir du formulaire.
* Déclenche **la navigation** avec `router.navigate` → met à jour l’URL avec les filtres et **la page 0**.
* Cette navigation déclenche **automatiquement** la souscription dans `ngOnInit()` pour relancer la recherche.

---

## 3. Pagination – `searchPage(index: number)`

```ts
searchPage(index: number) {
  const currentParams = this.route.snapshot.queryParams;
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      ...currentParams,
      page: index,
    },
    queryParamsHandling: 'merge',
  });
}
```

### Objectif

* Met à jour uniquement le numéro de page dans l’URL, **sans perdre les autres critères** de recherche.
* Comme toujours, cela déclenche une nouvelle recherche via `ngOnInit()`.

---

## 4. Gestion de la source de données – `initDataSource()`

```ts
private initDataSource() {
  this.demandeDataSource = new DemandeDataSource(this.demandeService); // Création

  this.demandeDataSource.numberPage$ // → numéro de la page affichée
    .pipe(...)
    .subscribe((value) => (this.numberPage = value));

  this.demandeDataSource.numberTotalElement$ // → nombre total de résultats
    .pipe(...)
    .subscribe((value) => {
      this.numberTotalElement = value;
      if (!this.showSearchResult) {
        this.showSearchResult = value >= 0;
      }
    });

  this.demandeDataSource.loading$ // → indicateur de chargement
    .pipe(...)
    .subscribe((value) => (this.searchLoading = value));
}
```

### But

* Abonnement aux flux `Observable` exposés par la **data source** :

  * Nombre total d’éléments,
  * Page actuelle,
  * État de chargement.
* Synchronisation de l’interface utilisateur avec ces données.

---

## 5. Mise à jour intelligente de l’URL – `updateUrlWithNewPage(newPage: number)`

```ts
private updateUrlWithNewPage(newPage: number) {
  const currentParams = this.route.snapshot.queryParams;
  this.router.navigate([], {
    queryParams: {
      ...currentParams,
      page: newPage,
    },
    queryParamsHandling: 'merge',
  });
}
```

### Utilité

* Appelée automatiquement dans `ngOnInit()` **si l’utilisateur a forcé une page invalide** (ex. page 10 alors qu’il n’y a que 5 pages).
* L’URL est mise à jour avec la dernière page disponible.

---

### Fonction simple

* Utilisée pour afficher la bonne **devise monétaire** avec `CurrencyPipe` dans le HTML.
* Par exemple : `"EURO"` devient `"EUR"` pour afficher "€".

---

## Conclusion

En résumé, j’ai structuré ce composant Angular autour de : :

* Mon **formulaire réactif** de recherche.
* L’**utilisation de la navigation par URL** pour permettre des recherches partageables.
* Une **data source** puissante pour gérer la pagination, les états, et le chargement.
* Une **UX fluide** où toute action (recherche, pagination) est reflétée dans l’URL.

---
