---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
    - Code
---
# Affichage résultat - Code source - Front


## demande.datasource.ts 
````
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, catchError, distinctUntilChanged, finalize, Observable, of, tap} from 'rxjs';
import {DemandeService} from '@core/service/demande/demande.service';
import {DemandeDomain} from '@leasa/rest-api-angular';

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

## recherche-demandes.component.ts

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

## recherche-demandes.component.html

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

````


## demande.service.spec.ts

````
import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {DemandeCriteria, DemandeService} from './demande.service';
import {
  ApporteurDomain,
  ClientDomain,
  DecisionDomain,
  DemandeDomain,
  DemandePaginate,
  DemandePaginateContainer,
  DemandesApi,
  SchemaFinancierDomain,
  UserDomain,
} from '@leasa/rest-api-angular';
import {of} from 'rxjs';
import {FormGroup} from '@angular/forms';

describe('DemandeServiceAngular', () => {
  let service: DemandeService;
  let demandesApiSpy: jest.Mocked<Partial<DemandesApi>>;

  beforeEach(() => {
    demandesApiSpy = jest.mocked(DemandesApi.prototype);

    TestBed.configureTestingModule({
      providers: [DemandeService, {provide: DemandesApi, useValue: demandesApiSpy}],
    });
    service = TestBed.inject(DemandeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return count demande', fakeAsync((): void => {
    let nombreDemande = 4;

    let nombreResult = 0;
    let critere: DemandeCriteria = {
      statut: 'ETUDE',
    } as DemandeCriteria;

    demandesApiSpy.getNbDemandes = jest.fn().mockReturnValue(of({Long: nombreDemande}));
    service.getNbDemandes(critere).subscribe((nombre) => {
      nombreResult = nombre;
    });
    tick();
    expect(demandesApiSpy.getNbDemandes).toHaveBeenCalledWith(critere);
    expect(nombreResult).toEqual(nombreDemande);
  }));

  it('should return paginated demandes based on criteria', fakeAsync(() => {
    //GIVEN
    const mockApporteurDomain: ApporteurDomain = {
      id: 100,
      code: 'ABCD',
      libelle: 'Apporteur Mock',
      premierNumeroIdentification: 'SIREN123',
      loueur: {id: 1, code: 'L1', libelle: 'Test'},
    };
    const mockClientDomain: ClientDomain = {
      id: 200,
      numero: 'ABCD',
      raisonSociale: 'Client',
    };
    const mockUserDomain: UserDomain = {
      id: 300,
      prenom: 'U',
      nom: 'Mock',
    };
    const mockDecisionDomain: DecisionDomain = {
      id: 400,
      montantHT: 1234.56,
    };
    const mockSchemaFinancierDomain: SchemaFinancierDomain = {
      id: 500,
      loyerHT: 789.01,
    };
    const mockDemandes: DemandeDomain[] = [
      {
        id: 1,
        code: 'DEMANDE_001',
      },
      {
        id: 2,
        code: 'DEMANDE_002',
        apporteur: mockApporteurDomain,
        client: mockClientDomain,
        utilisateurCommercial: mockUserDomain,
        accord: mockDecisionDomain,
        schemaFinancier: mockSchemaFinancierDomain,
      },
    ];
    const mockResult: DemandePaginate = {
      list: mockDemandes,
      total: 10,
      offset: 0,
    } as DemandePaginate;

    const mockContainer: DemandePaginateContainer = {
      result: mockResult,
    } as DemandePaginateContainer;

    const criteriaForm = new FormGroup({});

    let received: DemandePaginate | undefined;

    //WHEN
    demandesApiSpy.searchByCriteria = jest.fn().mockReturnValue(of(mockContainer));

    service.searchDemandesByCriteria(criteriaForm).subscribe((res) => {
      received = res;
    });
    tick();
    //THEN
    expect(demandesApiSpy.searchByCriteria).toHaveBeenCalledWith(criteriaForm);
    expect(received).toEqual(mockResult);
  }));
});
````

## recherche-demandes.component.scss

````
.recherche-demande {
  &__resultat {
    &__body {
      display: block;
      overflow-x: auto;
    }

    &__table {
      overflow-x: auto;
      width: 100%;

      &__align {
        text-align: center;
      }

      &__numDemande {
        margin: auto 10px;
      }
    }
  }
}
````


## recherche-demandes.component.spec.ts

````
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RechercheDemandesComponent} from './recherche-demandes.component';
import {DemandeService} from '@core/service/demande/demande.service';
import {DemandeDataSource} from './demande.datasource';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
  DemandeDomain,
  FactureDomain,
  ApporteurDomain,
  SchemaFinancierDomain,
  ClientDomain,
  UserDomain,
  DecisionDomain,
} from '@leasa/rest-api-angular';
import {CurrencyUtils} from '@core/utils/currency.utils';

describe('RechercheDemandesComponent', () => {
  let component: RechercheDemandesComponent;
  let fixture: ComponentFixture<RechercheDemandesComponent>;
  let demandeServiceSpy: jest.Mocked<DemandeService>;
  let demandeDataSourceSpy: jest.Mocked<DemandeDataSource>;

  const mockApporteurDomain: ApporteurDomain = {
    id: 100,
    code: 'ABCD',
    libelle: 'Apporteur Mock',
    premierNumeroIdentification: 'SIREN123',
    loueur: {id: 1, code: 'L1', libelle: 'Test'},
  };

  const mockClientDomain: ClientDomain = {
    id: 200,
    numero: 'ABCD',
    raisonSociale: 'Client',
  };

  const mockUserDomain: UserDomain = {
    id: 300,
    prenom: 'U',
    nom: 'Mock',
  };

  const mockDecisionDomain: DecisionDomain = {
    id: 400,
    montantHT: 1234.56,
  };

  const mockSchemaFinancierDomain: SchemaFinancierDomain = {
    id: 500,
    loyerHT: 789.01,
  };

  const mockDemandes: DemandeDomain[] = [
    {
      id: 1,
      code: 'DEMANDE_001',
    },
    {
      id: 2,
      code: 'DEMANDE_002',
      apporteur: mockApporteurDomain,
      client: mockClientDomain,
      utilisateurCommercial: mockUserDomain,
      accord: mockDecisionDomain,
      schemaFinancier: mockSchemaFinancierDomain,
    },
  ];
  beforeEach(async () => {
    demandeServiceSpy = jest.mocked(DemandeService.prototype);
    demandeDataSourceSpy = jest.mocked(DemandeDataSource.prototype);

    demandeDataSourceSpy.searchDemande = jest.fn();
    demandeDataSourceSpy.reinit = jest.fn();
    await TestBed.configureTestingModule({
      imports: [RechercheDemandesComponent],

      providers: [{provide: DemandeService, useValue: demandeServiceSpy}],

      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RechercheDemandesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should init the component', () => {
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
  it('should search', () => {
    jest.spyOn(component, 'searchPage').mockImplementation(jest.fn());
    component.search();
    expect(component.searchPage).toHaveBeenCalledWith(0);
  });
  it('should call searchDemande on demandeDataSource with correct criteria and page index', () => {
    component.searchPage(2);
    expect(demandeDataSourceSpy.searchDemande).toHaveBeenCalledWith({currentProjection: 'projectionRechercheBack'}, 2);
  });
  it('should return parsed currency from CurrencyUtils', () => {
    const currencySpy = jest.spyOn(CurrencyUtils, 'parseToAngularDevise').mockReturnValue('€');
    const result = component.getCurrency('EUR');
    expect(currencySpy).toHaveBeenCalledWith('EUR');
    expect(result).toBe('€');
  });
});
````