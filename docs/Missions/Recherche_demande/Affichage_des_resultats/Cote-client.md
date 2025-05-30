---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

- j'ai du créer un nouveau composant (component/html), nouveau data source et tests 

## Création du composant avec la CLI angular 

il va créé recherche-demandes.component.html, recherche-demandes.component.scss, recherche-demandes.component.ts, recherche-demandes.component.spec.ts

## ajout dans app-routing.module.ts

``` typescript
   {
    path: 'recherche-demandes',
    component: RechercheDemandesComponent,
    canActivate: [AuthGuard, MailGuard],
  }
```

demande.service.ts ajout de ce code : expliquer ce code

```` typescript
 public searchDemandesByCriteria(demandeCriteria: FormGroup): Observable<DemandePaginate> {
    return this.demandesApi
      .searchByCriteria(demandeCriteria)
      .pipe(map((demandesContainer: DemandePaginateContainer) => demandesContainer.result));
  }
}
````

demande.datasource.ts : utilise search  pour requete get et la pagination fonctionne grâce au subscribe (à expliquer)

```` typescript
export class DemandeDataSource implements DataSource<DemandeDomain> {
  private NO_SEARCH: number = -1;
  private demandeSubject = new BehaviorSubject<DemandeDomain[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private numberPageSubject = new BehaviorSubject<number>(0);
  private numberTotalElementSubject = new BehaviorSubject<number>(this.NO_SEARCH);

  private demande$: Observable<DemandeDomain[]> = this.demandeSubject.asObservable();
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  public numberPage$: Observable<number> = this.numberPageSubject.pipe(distinctUntilChanged());
  public numberTotalElement$: Observable<number> = this.numberTotalElementSubject.pipe(distinctUntilChanged());
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
    this.demandeService
      .searchDemandesByCriteria(Object.assign(demandeCriteria, {startPage: indexPage}))
      .pipe(
        tap((demandes) => this.demandeSubject.next(demandes.list)),
        tap((demandes) => this.numberPageSubject.next(demandes.offset - 1)),
        tap((demandes) => this.numberTotalElementSubject.next(demandes.total)),
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

dans recherche-demandes.component.ts : ici fonction init pour initialiser le datasource, fonction search avec criteria (indispensable)

```` typescript
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
  ],
  templateUrl: './recherche-demandes.component.html',
  styleUrl: './recherche-demandes.component.scss',
})
export class RechercheDemandesComponent {
  public demandeDataSource: DemandeDataSource;
  public numberPage: number;
  public searchLoading: boolean = false;
  public numberTotalElement: number;
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

  constructor(
    private demandeService: DemandeService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.initDataSource();
  }

  search() {
    this.showSearchResult = true;
    this.searchPage(0);
  }
  searchPage(index: number) {
    const criteria: any = {
      currentProjection: 'projectionRechercheBack',
    };
    this.demandeDataSource.searchDemande(criteria, index);
  }
  getCurrency(devise: string) {
    return CurrencyUtils.parseToAngularDevise(devise);
  }
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
}
````

dans le recherche-demandes.component.html, ici j'ai créé deux parties : partie filtres (vide actuellement), partie affichage de résultats : colonnes avec skeletton pour charger les données

```` html
<div class="page-header-leasa">
  <h1 i18n>Recherche demandes</h1>
</div>
<ml-ui-bloc [foldable]="true" [folded]="false">
  <ml-ui-bloc-title i18n>Filtres</ml-ui-bloc-title>
  <ml-ui-bloc-body>
    <div>
      <button (click)="search()" mlUiButton [disabled]="searchLoading">
        <ml-ui-icon icon="search"></ml-ui-icon>
        <span i18n>Rechercher</span>
      </button>
    </div>
  </ml-ui-bloc-body>
</ml-ui-bloc>
<ml-ui-bloc [foldable]="true" [folded]="false" [class.hide]="!showSearchResult">
  <ml-ui-bloc-title i18n>Résultats</ml-ui-bloc-title>
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
          >{{demande.code}}</ml-ui-chips>
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="statut">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Statut</th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{demande.statut.libelleBack}}</td>
      </ng-container>
      <ng-container mlUiColumnDef="apporteur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Apporteur / Groupe d'apporteurs</th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{demande.apporteur.libelle}}</b>  <br> {{demande.apporteur?.groupeApporteurs?.nom ? demande.apporteur?.groupeApporteurs?.nom : '-'}}</td>
      </ng-container>
      <ng-container mlUiColumnDef="client">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Client / Siren / Registration number </th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{demande.client.raisonSociale}}</b> <br/> {{demande.client.siren}}</td>
      </ng-container>
      <ng-container mlUiColumnDef="bailleur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Bailleur et référence </th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{demande.accord?.bailleur.libelle ? (demande.accord?.bailleur.libelle) : '-' }}</b> <br/> {{demande.accord?.reference ? (demande.accord?.reference) : '-'}}</td>
      </ng-container>
      <ng-container mlUiColumnDef="montantVenteAchatHT">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Achat HT / Vente HT </th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{ demande.montantTotalAchatHT != null
          ? (demande.montantTotalAchatHT | currency:getCurrency(demande.devise):'symbol-narrow')
          : '-' }} <br> {{ demande.montantTotalVenteHT != null
          ? (demande.montantTotalVenteHT | currency:getCurrency(demande.devise):'symbol-narrow')
          : '-' }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="loyerHT">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Loyer HT </th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{ demande.montantLoyerHT != null
          ? (demande.montantLoyerHT | currency:getCurrency(demande.devise):'symbol-narrow')
          : '-' }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="dateDepot">
        <th ml-ui-header-cell *mlUiHeaderCellDef  i18n>Dépôt le </th>
        <td ml-ui-cell *mlUiCellDef="let demande" class="recherche-demande__resultat__table__align">{{ demande.dateCreation ? (demande.dateCreation | date:'dd/MM/yyyy') : '-' }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="datePaiement">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Paiement le </th>
        <td ml-ui-cell *mlUiCellDef="let demande" class="recherche-demande__resultat__table__align">{{demande.datePaiement ? (demande.datePaiement | date:'dd/MM/yyyy') : '-' }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="commercialApporteur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Ccial Apporteur </th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{demande.utilisateurCommercial.fullName}}</td>
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

```
