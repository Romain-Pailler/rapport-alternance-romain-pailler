---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Premier filtre de recherche - Côté Client

## Mise en place du premier critère de recherche – Le FormGroup

Dans Angular, un `FormGroup` représente un ensemble de contrôles de formulaire (inputs) regroupés logiquement. Il permet de gérer l'état, la validation, et la récupération des valeurs de plusieurs champs dans un formulaire de manière structurée.

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
### Explication :

* La classe `RechercheDemandesFormGroup` expose une méthode statique `build()` qui construit et retourne une instance de `FormGroup`.
* Le champ `code` est ici le **premier critère de recherche** mis en place dans le formulaire. Il est associé à un `FormControl` initialisé à `null`.
* Ce `FormGroup` pourra être injecté dans un composant Angular pour :

  * Lier dynamiquement les champs du formulaire dans le HTML.
  * Centraliser les valeurs saisies par l’utilisateur.
  * Faciliter la validation et la gestion des erreurs de formulaire.
  * Extraire les données pour les envoyer vers un service ou les utiliser dans l’URL via les query parameters (cf. composant ci-après).

---

## Le composant HTML – Liaison du champ de recherche au formulaire

Le fichier HTML du composant permet d'afficher un champ de saisie pour le numéro de dossier (`code`), en le liant dynamiquement au `FormGroup` défini dans le fichier TypeScript.

### Extrait de code :


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

### Explication :

* Le formulaire est lié à l’instance du `FormGroup` via `[formGroup]="formGroupDemandeCriteria"`, ce qui permet d'associer dynamiquement les champs à leurs contrôles respectifs.
* Le champ de saisie `input` est relié à la propriété `code` du `FormGroup` grâce à `formControlName="code"`.
* L’attribut `(ngSubmit)="search()"` permet d’appeler une méthode TypeScript nommée `search()` lors de la soumission du formulaire (par exemple après clic sur le bouton).
* L’attribut `(keydown.space)="$event.preventDefault()"` empêche l’insertion d’un espace dans le champ, évitant ainsi des valeurs non souhaitées.
* Le bouton est désactivé dynamiquement si `searchLoading` est vrai, permettant de désactiver l’action pendant un chargement ou une requête en cours.

Ce formulaire constitue donc l'interface utilisateur du critère de recherche "N° dossier", dont la valeur est exploitée côté TypeScript, notamment via les **query parameters** détaillés ci-après.

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

### Détail :

* **① `initDataSource()`** : initialise la **data source** et ses observables pour récupérer le nombre total d’éléments, la page actuelle, et l’état de chargement.
* **② `formGroupDemandeCriteria`** : formulaire réactif pour filtrer les demandes.
* **③ `this.route.queryParams`** : souscription aux **paramètres d’URL**. Chaque fois qu’ils changent (page ou filtres), le composant :

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

### À retenir :

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

### Objectif :

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

### But :

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

### Utilité :

* Appelée automatiquement dans `ngOnInit()` **si l’utilisateur a forcé une page invalide** (ex. page 10 alors qu’il n’y a que 5 pages).
* L’URL est mise à jour avec la dernière page disponible.

---

### Fonction simple :

* Utilisée pour afficher la bonne **devise monétaire** avec `CurrencyPipe` dans le HTML.
* Par exemple : `"EURO"` devient `"EUR"` pour afficher "€".

---

## Conclusion

Ce composant Angular est bien structuré autour de :

* La **gestion d’un formulaire de recherche réactif** ;
* L’**utilisation de la navigation par URL** pour permettre des recherches partageables ;
* Une **data source** puissante pour gérer la pagination, les états, et le chargement ;
* Une **UX fluide** où toute action (recherche, pagination) est reflétée dans l’URL.

---

ngOnInit

```typescript
  ngOnInit(): void {
    this.initDataSource();
    this.formGroupDemandeCriteria = RechercheDemandesFormGroup.build();

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const {page = 0, ...criteriaParams} = params;
      const pageIndex = +page;
      this.formGroupDemandeCriteria.reset();
      this.formGroupDemandeCriteria.patchValue(criteriaParams, {emitEvent: false});

      if (Object.keys(criteriaParams).length > 0) {
        this.showSearchResult = true;
        this.demandeDataSource.searchDemande(criteriaParams, pageIndex);

        this.demandeDataSource.numberTotalElement$
          .pipe(takeUntilDestroyed(this.destroyRef), take(1))
          .subscribe((total) => {
            const totalPages = Math.ceil(total / 10);
            if (pageIndex >= totalPages && Math.abs(totalPages) > 0) {
              this.updateUrlWithNewPage(totalPages);
            }
          });
      }
    });
  }
```
le reste 

``` typescript 
search() {
    this.showSearchResult = true;
    const criteria: any = {
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

  /**
   * Change la page affichée dans la recherche.
   * - Conserve les paramètres de recherche existants.
   * - Si des champs sont remplis dans le formulaire ils disparaitront
   * - Met à jour le paramètre 'page' dans l'URL.
   *
   * @param index Numéro de la page à afficher (indexée à partir de 0).
   */
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

  /**
   * Récupère le code devise compatible Angular à partir d'une devise métier.
   *
   * @param devise Code ou nom de la devise métier (ex: 'EURO').
   * @returns Code devise standard pour CurrencyPipe (ex: 'EUR').
   * Côté HTML avec currency on aura bien '€'
   */
  getCurrency(devise: string) {
    return CurrencyUtils.parseToAngularDevise(devise);
  }

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
      if (!this.showSearchResult) {
        this.showSearchResult = this.numberTotalElement >= 0;
      }
    });
    this.demandeDataSource.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => (this.searchLoading = value));
  }

  /*
   * Met à jour l'URL avec un nouveau numéro de page, tout en conservant les autres critères de recherche présents dans les query params.
   */
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
}
```


les tests

````
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RechercheDemandesComponent} from './recherche-demandes.component';
import {DemandeService} from '@core/service/demande/demande.service';
import {DemandeDataSource} from './demande.datasource';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';

describe('RechercheDemandesComponent', () => {
  let component: RechercheDemandesComponent;
  let fixture: ComponentFixture<RechercheDemandesComponent>;
  let demandeServiceSpy: jest.Mocked<DemandeService>;
  let demandeDataSourceSpy: jest.Mocked<DemandeDataSource>;
  const activatedRouteStub: Partial<ActivatedRoute> = {
    snapshot: {
      queryParams: {},
    } as any,
    queryParams: of({}),
  };

  const routerStub: Partial<Router> = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    demandeServiceSpy = jest.mocked(DemandeService.prototype);
    demandeDataSourceSpy = jest.mocked(DemandeDataSource.prototype);

    demandeDataSourceSpy.searchDemande = jest.fn();
    demandeDataSourceSpy.reinit = jest.fn();
    await TestBed.configureTestingModule({
      imports: [RechercheDemandesComponent],

      providers: [
        {provide: DemandeService, useValue: demandeServiceSpy},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: Router, useValue: routerStub},
      ],

      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RechercheDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should init the component and not trigger searchDemande when no query params are given', () => {
    const spySearch = jest.spyOn(component.demandeDataSource, 'searchDemande');
    const spyUpdateUrl = jest.spyOn(component as any, 'updateUrlWithNewPage');

    component.ngOnInit();

    expect(spySearch).not.toHaveBeenCalled();
    expect(spyUpdateUrl).not.toHaveBeenCalled();

    expect(component.searchLoading).toBe(false);
    expect(component.numberPage).toEqual(0);
    expect(component.columns.length).toBe(10);
    expect(component.columns).toEqual([
      'numDossier',
      'statut',
      'apporteur',
      'client',
      'bailleur',
      'montantVenteAchatHT',
      'loyerHT',
      'dateDepot',
      'datePaiement',
      'commercialApporteur',
    ]);
    expect(component.demandeDataSource).not.toBeNull();
  });

  it('should trigger searchDemande with correct criteria and call updateUrlWithNewPage if needed', fakeAsync(() => {
    const queryParams = {code: 'N12345'};

    component['route'].queryParams = of(queryParams);

    const searchSpy = jest.spyOn(component.demandeDataSource, 'searchDemande');
    const updateUrlSpy = jest.spyOn(component as any, 'updateUrlWithNewPage');

    component.ngOnInit();
    tick();

    expect(component['showSearchResult']).toBe(true);
    expect(searchSpy).toHaveBeenCalledWith({code: 'N12345'}, 0);
    expect(updateUrlSpy).not.toHaveBeenCalledWith(0);
  }));

  it('should set showSearchResult to true and navigate with correct query params', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());

    component.formGroupDemandeCriteria = new FormGroup({
      code: new FormControl('N12345'),
    });

    component.search();
    expect(component['showSearchResult']).toBe(true);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: component['route'],
      queryParams: {
        code: 'N12345',
        currentProjection: 'projectionRechercheBackV2',
        page: 0,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('should navigate with updated page query param', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());

    Object.defineProperty(component['route'], 'snapshot', {
      configurable: true,
      get: () => ({
        queryParams: {
          currentProjection: 'projectionRechercheBackV2',
          code: 'N12345',
        },
      }),
    });

    component.searchPage(2);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: component['route'],
      queryParams: {
        currentProjection: 'projectionRechercheBackV2',
        code: 'N12345',
        page: 2,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('should return parsed currency from CurrencyUtils', () => {
    const result = component.getCurrency('EURO');
    expect(result).toBe('EUR'); // le pipe côté html le trasnforme en €
  });
});
````