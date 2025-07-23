---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

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

## le composant html

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

### code source complet 

````
<div class="page-header-leasa">
  <h1 i18n>Recherche demandes</h1>
</div>
<ml-ui-bloc>
  <ml-ui-bloc-title i18n>Filtres</ml-ui-bloc-title>
  <ml-ui-bloc-body>
    <form
      (ngSubmit)="search()"
      [formGroup]="formGroupDemandeCriteria"
      (reset)="reinit()"
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
      <div class="recherche-demande__filtres__boutons">
        <button type="reset" mlUiButton variant="secondary">
          <ml-ui-icon icon="undo" class="recherche-demande__filtres__boutons__reinit"></ml-ui-icon>
        </button>
        <button type="submit" mlUiButton [disabled]="searchLoading">
          <ml-ui-icon icon="search"></ml-ui-icon>
          <span i18n>Rechercher</span>
        </button>
      </div>
    </form>
  </ml-ui-bloc-body>
</ml-ui-bloc>
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


  <ml-ui-bloc-body class="recherche-demande__resultat__body">
    <table
      ml-ui-table
      [dataSource]="demandeDataSource"
      class="recherche-demande__resultat__table"
      aria-label="Résultat de la recherche de demande"
      [class.hide]="numberTotalElement <= 0 || searchLoading">
      <ng-container mlUiColumnDef="numDossier">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>N°Dossier</th>
        <td ml-ui-cell *mlUiCellDef="let demande">
          <ml-ui-chips
            variant="dark"
            [color]="demande.apporteur.loueur.code | brandColor"
            class="recherche-demande__resultat__table__numDemande"
          >{{ demande.code }}
          </ml-ui-chips>
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="statut">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Statut</th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{ demande.statut.libelleBack }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="apporteur">
        <th ml-ui-header-cell *mlUiHeaderCellDef><span i18n>Apporteur</span> <br> <span i18n>Groupe d'apporteurs</span></th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.apporteur.libelle }}</b>
          <br> {{ demande.apporteur?.groupeApporteurs?.nom ? demande.apporteur?.groupeApporteurs?.nom : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="client">
        <th ml-ui-header-cell *mlUiHeaderCellDef><span i18n>Client</span> <br> <span i18n>Siren</span></th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.client.raisonSociale }}</b> <br /> {{ demande.client.siren }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="bailleur">
        <th ml-ui-header-cell *mlUiHeaderCellDef><span i18n>Bailleur</span> <br><span i18n>Référence</span></th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.accord?.bailleur.libelle ? (demande.accord?.bailleur.libelle) : '-' }}</b>
          <br /> {{ demande.accord?.reference ? (demande.accord?.reference) : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="montantVenteAchatHT">
        <th ml-ui-header-cell *mlUiHeaderCellDef><span i18n>Achat HT</span> <br><span i18n>Vente HT</span></th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{
            demande.montantTotalAchatHT != null
              ? (demande.montantTotalAchatHT | currency:getCurrency(demande.devise):'symbol-narrow')
              : '-'
          }} <br> {{
            demande.montantTotalVenteHT != null
              ? (demande.montantTotalVenteHT | currency:getCurrency(demande.devise):'symbol-narrow')
              : '-'
          }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="loyerHT">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Loyer HT</th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{
            demande.montantLoyerHT != null
              ? (demande.montantLoyerHT | currency:getCurrency(demande.devise):'symbol-narrow')
              : '-'
          }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="dateDepot">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Dépôt le</th>
        <td ml-ui-cell *mlUiCellDef="let demande" class="recherche-demande__resultat__table__align">{{ demande.dateCreation ? (demande.dateCreation | date:'dd/MM/yyyy') : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="datePaiement">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Paiement le</th>
        <td ml-ui-cell *mlUiCellDef="let demande" class="recherche-demande__resultat__table__align">{{ demande.datePaiement ? (demande.datePaiement | date:'dd/MM/yyyy') : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="commercialApporteur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Ccial Apporteur</th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{ demande.utilisateurCommercial.fullName }}</td>
      </ng-container>
      <tr ml-ui-header-row *mlUiHeaderRowDef="columns"></tr>
      <tr ml-ui-row *mlUiRowDef="let row; columns: columns"></tr>
    </table>
    <div
      *mlUiSkeleton="
        searchLoading;
        template: 'table';
        options: {style: {width: '100%'}, column: columns.length, row: 10}
      "
    ></div>
    <div [class.hide]="numberTotalElement > 0 || searchLoading" i18n>Aucun résultat pour cette recherche.</div>
    <ml-ui-paginator
      [length]="numberTotalElement"
      [pageSize]="10"
      [indexPage]="numberPage"
      (page)="searchPage($event + 1)"
      [class.hide]="numberTotalElement <= 0 || searchLoading"
    ></ml-ui-paginator>
  </ml-ui-bloc-body>
</ml-ui-bloc>
````

## le css 

````
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
### code source complet 

````
@Component({
  selector: 'ml-recherche-demandes',
  standalone: true,
  imports: [
    ButtonDirective,
    BlocModule,
    PaginatorComponent,
    IconComponent,
    SkeletonDirective,
    CommonModule,
    TableModule,
    ChipsComponent,
    SharedModule,
    ReactiveFormsModule,
  ],
  templateUrl: './recherche-demandes.component.html',
  styleUrl: './recherche-demandes.component.scss',
})
export class RechercheDemandesComponent {
  public demandeDataSource: DemandeDataSource;
  public numberPage: number;
  public searchLoading: boolean = false;
  public numberTotalElement: number;
  public montantTotalAchatHT: number;
  public montantTotalVenteHT: number;
  protected showSearchResult: boolean = false;
  public columns = [
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
  ];
  public formGroupDemandeCriteria: ReturnType<typeof RechercheDemandesFormGroup.build>;

  constructor(
    private demandeService: DemandeService,
    private destroyRef: DestroyRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  /**
   * Initialisation du composant.
   * - Initialise le dataSource des demandes.
   * - Initialise le formGroup de critères de recherche.
   * - Souscrit aux changements des paramètres de requête (queryParams) de l'URL.
   * - Lorsqu'il y a des critères dans l'URL, lance une recherche avec la pagination adaptée.
   * - Si la page demandée dépasse le nombre total de pages, met à jour l'URL avec la dernière page valide grâce à updateUrlWithNewPage
   */
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

  /**
   * Réinitialise l'état de la recherche :
   * - Réinitialise le formulaire de critères de recherche.
   * - Réinitialise les données de la source (DemandeDataSource).
   * - Masque les résultats de recherche.
   * - Nettoie complètement l'URL en supprimant tous les queryParams
   */
  reinit() {
    this.formGroupDemandeCriteria.reset();
    this.demandeDataSource.reinit();
    this.showSearchResult = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}, // vide tous les queryParams
      queryParamsHandling: '', // empêche la fusion avec les anciens queryParams
    });
  }

  /**
   * Lance une recherche avec les critères du formulaire depuis le bouton de la partie Filtres.
   * - Active l'affichage des résultats.
   * - Navigue vers la page 0 avec les critères actuels en paramètres d'URL.
   * Cela déclenche la mise à jour du composant via la souscription aux queryParams.
   */
  search() {
    if (this.formGroupDemandeCriteria.invalid) {
      this.formGroupDemandeCriteria.markAllAsTouched();
      return;
    }
    this.showSearchResult = true;

    const criteria: any = {
      ...this.formGroupDemandeCriteria.value,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...criteria,
        page: 0,
      },
      queryParamsHandling: 'merge',
    });
    this.demandeDataSource.searchDemande(criteria, 0);
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
````

## le code source

### demande.datasource.ts
````
export class DemandeDataSource implements DataSource<DemandeDomain> {
  private NO_SEARCH: number = -1;
  private demandeSubject = new BehaviorSubject<DemandeDomain[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private numberPageSubject = new BehaviorSubject<number>(0);
  private numberTotalElementSubject = new BehaviorSubject<number>(this.NO_SEARCH);
  private readonly montantTotalAchatHTSubject = new BehaviorSubject<number>(0);
  private readonly montantTotalVenteHTSubject = new BehaviorSubject<number>(0);
  private demande$: Observable<DemandeDomain[]> = this.demandeSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public numberPage$: Observable<number> = this.numberPageSubject.pipe(distinctUntilChanged());
  public numberTotalElement$: Observable<number> = this.numberTotalElementSubject.pipe(distinctUntilChanged());
  public montantTotalAchatHT$: Observable<number> = this.montantTotalAchatHTSubject.pipe(distinctUntilChanged());
  public montantTotalVenteHT$: Observable<number> = this.montantTotalVenteHTSubject.pipe(distinctUntilChanged());
  constructor(private demandeService: DemandeService) {}
  connect(collectionViewer: CollectionViewer): Observable<DemandeDomain[]> {
    return this.demande$;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.demandeSubject.complete();
    this.loadingSubject.complete();
    this.numberPageSubject.complete();
    this.numberTotalElementSubject.complete();
  }
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

  /**
   * Réinitialise la data source
   */
  reinit() {
    this.loadingSubject.next(false);
    this.demandeSubject.next([]);
    this.numberPageSubject.next(0);
    this.numberTotalElementSubject.next(this.NO_SEARCH);
  }
}
````

## recherche-demandes.form-group.ts :
### ajout du validators.pattern

````
code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
````

### code complet:
````
import {FormControl, FormGroup, Validators} from '@angular/forms';

export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
    });
  }
}
````
