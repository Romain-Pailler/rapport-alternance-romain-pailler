---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client
ajout des queryParams
## le form group ajoute refBailleur (expliquer ce que c'est)
``` typescript
import {FormControl, FormGroup, Validators} from '@angular/forms';

export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
      refBailleur: new FormControl(null as string | null),
    });
  }
}
```

## le composant html
ajout d'un input pour faire un filtre
```html 
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
```


les tests ajoute refBailleur

````
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
````