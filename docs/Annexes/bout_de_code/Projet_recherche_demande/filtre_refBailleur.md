
## recherche-demandes-form-group.ts 

```ts
export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
      refBailleur: new FormControl(null as string | null),
    });
  }
}
```

## recherche-demandes.component.html

```ts
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
        <div class="uiu-1-6">
          <ml-ui-form-field>
            <ml-ui-label i18n>Référence bailleur</ml-ui-label>
            <input
              type="text"
              formControlName="refBailleur"
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
          <a [routerLink]="['/ajs/dossier/'+demande.code+'/synthese']">
            <ml-ui-chips
              variant="dark"
              [color]="demande.apporteur.loueur.code | brandColor"
              class="recherche-demande__resultat__table__numDemande"
            >{{ demande.code }}
            </ml-ui-chips>
          </a>
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
```

```ts
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
  afterEach(() => {
    jest.clearAllMocks();
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
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(false);
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
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(searchSpy).toHaveBeenCalledWith({code: 'N12345'}, 0);
    expect(updateUrlSpy).not.toHaveBeenCalledWith(0);
  }));

  it('should set showSearchResult to true and navigate with correct query params', fakeAsync(() => {
    jest.spyOn(component, 'search');
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());
    component.formGroupDemandeCriteria = new FormGroup({
      code: new FormControl('N12345'),
      refBailleur: new FormControl('123456X'),
    });

    let button = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');

    button.click();
    tick();

    expect(component.search).toHaveBeenCalled();
    expect(component['showSearchResult']).toBe(true);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: component['route'],
      queryParams: {
        code: 'N12345',
        refBailleur: '123456X',
        page: 0,
      },
      queryParamsHandling: 'merge',
    });
  }));

  it('should not perform search when form is invalid', fakeAsync(() => {
    jest.spyOn(component, 'search');
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());

    component.formGroupDemandeCriteria = new FormGroup({
      code: new FormControl('AZ123456789', Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // même config que RechercheDemandesFormGroup.build()
      refBailleur: new FormControl('123456X'),
    });

    const markAllAsTouchedSpy = jest.spyOn(component.formGroupDemandeCriteria, 'markAllAsTouched');

    fixture.detectChanges();

    // Act
    const button = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    button.click();
    tick();

    // Assert
    expect(component.formGroupDemandeCriteria.invalid).toBe(true);
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  }));

  it('should navigate with updated page query param', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());

    Object.defineProperty(component['route'], 'snapshot', {
      configurable: true,
      get: () => ({
        queryParams: {
          currentProjection: 'projectionRechercheBackV2',
          code: 'N12345',
          refBailleur: '123456X',
        },
      }),
    });

    component.searchPage(2);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: component['route'],
      queryParams: {
        currentProjection: 'projectionRechercheBackV2',
        code: 'N12345',
        refBailleur: '123456X',
        page: 2,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('should return parsed currency from CurrencyUtils', () => {
    const result = component.getCurrency('EURO');
    expect(result).toBe('EUR'); // le pipe côté html le trasnforme en €
  });

  it('should reset the form, reinit the datasource, hide results, and clear query params', fakeAsync(() => {
    jest.spyOn(component, 'reinit');

    const resetSpy = jest.spyOn(component.formGroupDemandeCriteria, 'reset');
    const reinitSpy = jest.spyOn(component.demandeDataSource, 'reinit');
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());

    let button = fixture.debugElement.nativeElement.querySelector('button[type="reset"]');

    button.click();
    tick();

    expect(component.reinit).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
    expect(reinitSpy).toHaveBeenCalled();
    expect(component['showSearchResult']).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: component['route'],
      queryParams: {},
      queryParamsHandling: '',
    });
  }));
});
```