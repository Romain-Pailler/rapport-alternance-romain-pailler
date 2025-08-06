---
sidebar_label: Filtre Référence Bailleur
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Deuxième filtre de recherche

## Ajout d’un champ `refBailleur` dans le formulaire de recherche (Côté client)

Dans le cadre de l'amélioration du formulaire de recherche des demandes, un champ supplémentaire `refBailleur` a été introduit afin de permettre aux utilisateurs de filtrer les résultats en fonction de la référence du bailleur associé à la demande. Ce champ est désormais pris en compte à la fois dans l'interface utilisateur et dans les paramètres de requête de l'URL (queryParams).

## Ticket 

![Screenshot du ticket Jira](/img/recherche_demande/ticket_filtre_ref_bailleur.png)

### Formulaire de recherche – Définition du `FormGroup`

Le fichier `RechercheDemandesFormGroup.ts` a été modifié pour ajouter le champ `refBailleur` :
``` ts
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

#### Explication :

* `code` : champ préexistant servant à filtrer les demandes par leur identifiant. Le pattern permet une lettre optionnelle suivie de chiffres.
* `refBailleur` : **nouveau champ** destiné à saisir la référence du bailleur (par exemple un identifiant unique fourni par l’administration ou un organisme payeur). Ce champ ne possède pas de validateur spécifique mais accepte une chaîne de caractères.

### Gestion des `queryParams` dans l'URL

Lors de la soumission du formulaire de recherche (`ngSubmit`), les champs du formulaire sont convertis en `queryParams` afin de permettre :

* le partage d’URL avec les filtres appliqués ;
* la persistance des critères entre les navigations ;
* une meilleure indexation dans le navigateur.

Ce champ `refBailleur` est donc intégré aux paramètres envoyés à l'URL via `this.router.navigate(...)`.

---

### Composant HTML – Ajout d’un champ de saisie pour la **référence bailleur**

Un champ de saisie a été ajouté dans le formulaire HTML du composant pour permettre à l’utilisateur de saisir une **référence bailleur**. Ce champ est lié au `FormGroup` vu précédemment via la directive `formControlName="refBailleur"`.

#### Code HTML associé :

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


#### Explication :

* Le champ est encapsulé dans un composant de mise en forme `<ml-ui-form-field>` utilisé dans l’interface pour uniformiser l’apparence.
* Le label "Référence bailleur" est internationalisé via l’attribut `i18n`.
* Le champ `<input>` est un champ texte simple relié au `FormControl` via `formControlName="refBailleur"`.
* L'attribut `(keydown.space)="$event.preventDefault()"` empêche la saisie d'espaces, ce qui peut éviter des erreurs de validation ou des références mal formatées.

---



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