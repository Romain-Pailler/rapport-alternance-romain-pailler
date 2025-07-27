---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

## Objectif de la fonctionnalité

Cette évolution permet d’affiner les recherches de demandes en ajoutant un troisième critère : `codeLoueur`. Ce champ correspond à **l’identifiant du loueur** rattaché à la demande. Il s’agit généralement d’un acteur interne ou externe responsable de la mise à disposition du bien.

---

## Mise à jour du FormGroup

Le `FormGroup` définit la structure des champs présents dans le formulaire de recherche. Ici, on ajoute un champ `codeLoueur` de type `FormControl`, utilisé pour capturer la valeur saisie par l’utilisateur.

``` typescript
import {FormControl, FormGroup, Validators} from '@angular/forms';

export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')), // ce pattern prends en compte une lettre (majuscule ou minuscule) ou non et ensuite jusqu'a 6 chiffres
      refBailleur: new FormControl(null as string | null),
      codeLoueur: new FormControl(null as string | null),
    });
  }
}
```

### Détail :

* **`codeLoueur`** : champ libre (pas de contrainte de format), saisi manuellement par l’utilisateur.
* **Pourquoi l’ajouter** : permet de cibler les demandes en fonction du loueur rattaché.

---

## Ajout dans le composant HTML – Champ « Loueur »

Un **champ de sélection (dropdown)** a été ajouté au formulaire pour permettre à l’utilisateur de filtrer les demandes selon le **loueur associé**. Le champ est lié au `formControlName="codeLoueur"` défini dans le `FormGroup`.

### Code HTML :

```html  <div class="uiu-1-5">
          <ml-ui-form-field>
            <ml-ui-label i18n>Loueur</ml-ui-label>
            <ml-ui-select formControlName="codeLoueur">
              <ml-ui-option [value]="null" i18n>- Tous les loueurs -</ml-ui-option>
              <ml-ui-option *ngFor="let loueur of loueurList" [value]="loueur.code">{{ loueur.libelle }}</ml-ui-option>
            </ml-ui-select>
          </ml-ui-form-field>
        </div>
```

### Explication :

* **`<ml-ui-select>`** : composant personnalisable de type menu déroulant.
* **`formControlName="codeLoueur"`** : relie ce champ au `FormGroup`.
* **`loueurList`** : tableau d’objets contenant les données des loueurs disponibles (généralement chargé via un service).

  * Chaque `loueur` possède une propriété `code` (valeur du champ) et un `libelle` (affiché dans le menu).
* L’option par défaut (`[value]="null"`) permet de sélectionner *tous les loueurs*.

---

## Mise à jour du composant TypeScript – Chargement des loueurs

Pour permettre à l’utilisateur de filtrer les demandes par **loueur**, la liste des loueurs disponibles est désormais chargée dans le composant.

### Déclaration

```ts
public loueurList: Loueur[];
```

> Cette variable contiendra la liste des loueurs disponibles pour le champ de filtre dans le formulaire.

---

### Chargement des loueurs dans le `ngOnInit`

```ts
ngOnInit(): void {
  this.initDataSource();
  this.initLoueurs(); // ⬅️ Ajout du chargement des loueurs
  this.formGroupDemandeCriteria = RechercheDemandesFormGroup.build();
  // ...
}
```

> L’appel à `initLoueurs()` est effectué dès l’initialisation du composant pour peupler la liste.

---

### Fonction `initLoueurs()`

```ts
private initLoueurs(): void {
  this.loueurList = this.loueurService.getLoueursSelected();
}
```

* **Objectif** : récupérer les loueurs disponibles via le service `LoueurService`.
* **`getLoueursSelected()`** : méthode du service retournant une liste filtrée ou complète selon la logique métier.
* Le résultat est stocké dans `loueurList`, utilisé directement par la vue HTML pour remplir la liste déroulante.

---


 a ajouter dans le code source :
 ````typescript

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
    RouterLink,
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
  public loueurList: Loueur[];
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
    private loueurService: LoueurService,
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
    this.initLoueurs();
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
  private initLoueurs(): void {
    this.loueurList = this.loueurService.getLoueursSelected();
  }
}
````

````js
describe('RechercheDemandesComponent', () => {
  let component: RechercheDemandesComponent;
  let fixture: ComponentFixture<RechercheDemandesComponent>;
  let demandeServiceSpy: jest.Mocked<DemandeService>;
  let demandeDataSourceSpy: jest.Mocked<DemandeDataSource>;
  let loueurServiceSpy: jest.Mocked<LoueurService>;

  const activatedRouteStub: Partial<ActivatedRoute> = {
    snapshot: {
      queryParams: {},
    } as any,
    queryParams: of({}),
  };

  const routerStub: Partial<Router> = {
    navigate: jest.fn(),
  };
  let loueurs: Array<Loueur> = [
    {id: 687, code: 'NANCEO', libelle: 'Nanceo'} as Loueur,
    {id: 9871, code: 'HEALTHLEASE', libelle: 'Healthlease'} as Loueur,
  ];

  beforeEach(async () => {
    demandeServiceSpy = jest.mocked(DemandeService.prototype);
    demandeDataSourceSpy = jest.mocked(DemandeDataSource.prototype);
    loueurServiceSpy = jest.mocked(LoueurService.prototype);
    demandeDataSourceSpy.searchDemande = jest.fn();
    demandeDataSourceSpy.reinit = jest.fn();
    loueurServiceSpy.getLoueursSelected = jest.fn().mockReturnValue(loueurs);
    await TestBed.configureTestingModule({
      imports: [RechercheDemandesComponent],

      providers: [
        {provide: DemandeService, useValue: demandeServiceSpy},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: Router, useValue: routerStub},
        {provide: LoueurService, useValue: loueurServiceSpy},
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
    expect(component.loueurList).toEqual(loueurs);
  });

  it('should trigger searchDemande with correct criteria and call updateUrlWithNewPage if needed', fakeAsync(() => {
    const queryParams = {code: 'N12345', codeLoueur: 'NANCEO'};

    component['route'].queryParams = of(queryParams);
    const searchSpy = jest.spyOn(component.demandeDataSource, 'searchDemande');
    const updateUrlSpy = jest.spyOn(component as any, 'updateUrlWithNewPage');

    component.ngOnInit();
    tick();
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(searchSpy).toHaveBeenCalledWith({code: 'N12345', codeLoueur: 'NANCEO'}, 0);
    expect(updateUrlSpy).not.toHaveBeenCalledWith(0);
  }));

  it('should set showSearchResult to true and navigate with correct query params', fakeAsync(() => {
    jest.spyOn(component, 'search');
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());
    component.formGroupDemandeCriteria = new FormGroup({
      code: new FormControl('N12345'),
      refBailleur: new FormControl('123456X'),
      codeLoueur: new FormControl('HEALTHLEASE'),
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
        codeLoueur: 'HEALTHLEASE',
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
      codeLoueur: new FormControl('NANCEO'),
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
          codeLoueur: 'NANCEO',
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
        codeLoueur: 'NANCEO',
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