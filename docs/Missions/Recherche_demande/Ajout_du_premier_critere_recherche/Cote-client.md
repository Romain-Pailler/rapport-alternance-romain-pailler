---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

## le form group
``` typescript
export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null),
    });
  }
}
```

## le composant html

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
## le composant 

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