---
sidebar_position: "5"
tags: 
    - Migration
    - Angular
    - Code
---
# Code source du ticket filtre partenaires

```ts 
import {Component, DestroyRef} from '@angular/core';
import {
  BlocModule,
  ButtonDirective,
  ChipsComponent,
  IconComponent,
  PaginatorComponent,
  SkeletonDirective,
  TableModule,
} from '@leasa/ui';
import {DemandeService} from '@core/service/demande/demande.service';
import {DemandeDataSource} from './demande.datasource';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@shared/shared.module';
import {CurrencyUtils} from '@core/utils/currency.utils';
import {RechercheDemandesFormGroup} from './recherche-demandes-form-group';
import {ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {filter, take} from 'rxjs';
import {GroupeApporteurDomain, Loueur} from '@leasa/rest-api-angular';
import {LoueurService} from '@shared/service/loueur/loueur.service';
import {GroupeApporteursService} from '@core/service/groupe-apporteurs/groupe-apporteurs.service';

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
  public groupePartenairesList: GroupeApporteurDomain[];
  public groupePartenairesDisabled = false;
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
    readonly groupeApporteurService: GroupeApporteursService,
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
      const codeLoueur = params['codeLoueur'];
      const idGroupeApporteur = params['idGroupeApporteur'];

      if (!codeLoueur && !idGroupeApporteur) {
        this.initAllLoueursAndGroupes();
      } else if (codeLoueur && !idGroupeApporteur) {
        this.loadLoueursThenGroupesByLoueur(codeLoueur);
      } else if (!codeLoueur && idGroupeApporteur) {
        this.initAllLoueursAndGroupes(() => {
          this.checkGroupePartenaires(+idGroupeApporteur);
        });
      } else if (codeLoueur && idGroupeApporteur) {
        this.loadLoueursThenGroupesByLoueur(codeLoueur, +idGroupeApporteur);
      }
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
   * Fonction déclenchée lors du changement de loueur.
   *
   * Réinitialise le champ `idGroupeApporteur` du formulaire à `null`
   * puis recharge les données des groupes de partenaires associés
   * en fonction du nouveau `codeLoueur` sélectionné.
   *
   * @param codeLoueur Le code du loueur sélectionné.
   */
  onLoueurChange(codeLoueur: string): void {
    this.formGroupDemandeCriteria.patchValue({idGroupeApporteur: null});
    this.loadLoueursThenGroupesByLoueur(codeLoueur);
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

  /**
   * Vérifie si l'id existe dans la liste des groupes partenaires.
   *
   * Si l'identifiant est trouvé, il est réinjecté dans le formGroup
   * via un `patchValue`
   * @param idGroupeApporteur L'identifiant du groupe de partenaires à vérifier.
   */
  private checkGroupePartenaires(idGroupeApporteur: number): void {
    const exists = this.groupePartenairesList.some((apporteur) => apporteur.id === idGroupeApporteur);

    if (exists) {
      this.formGroupDemandeCriteria.patchValue({idGroupeApporteur: idGroupeApporteur});
    }
  }

  /**
   * Initialise la liste complète des groupes partenaires en effectuant une recherche sans critère.
   *
   * Met à jour la propriété `groupePartenairesList` avec les résultats retournés
   * Un callback optionnel peut être exécuté une fois les données chargées.
   *
   * @param callback Fonction facultative appelée après la récupération des groupes.
   */
  private initAllLoueursAndGroupes(callback?: () => void): void {
    this.groupeApporteurService
      .searchByCriteria('')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groupes) => {
        this.groupePartenairesList = groupes;
        this.groupePartenairesDisabled = false;
        callback?.();
      });
  }

  /**
   * Charge les groupes de partenaires associés à un loueur donné, puis met à jour le formulaire en conséquence.
   *
   * À partir du `codeLoueur`, récupère le loueur correspondant, puis effectue une recherche
   * des groupes via `groupeApporteurService`.
   *
   * - Met à jour `groupePartenairesList` avec les résultats.
   * - Active ou désactive le champ des groupes selon la présence de résultats.
   * - Si un `idGroupeApporteur` est fourni :
   *   - Il est sélectionné dans le formulaire s’il existe dans les résultats.
   *   - Sinon, il est réinitialisé et la fonction `deleteIdGroupeApporteur` est appelée.
   *
   * @param codeLoueur Le code du loueur sélectionné.
   * @param idGroupeApporteur (Optionnel) L'identifiant du groupe apporteur à présélectionner si valide.
   */
  private loadLoueursThenGroupesByLoueur(codeLoueur: string, idGroupeApporteur?: number): void {
    let loueurSelected = this.getLoueurByCode(codeLoueur);
    const criteria: any = {
      idLoueur: loueurSelected?.id,
    };
    this.groupeApporteurService
      .searchByCriteria(criteria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groupes) => {
        this.groupePartenairesList = groupes;
        this.groupePartenairesDisabled = groupes.length === 0;
        if (idGroupeApporteur != null) {
          const exists = groupes.some((g) => g.id === idGroupeApporteur);
          if (exists) {
            this.formGroupDemandeCriteria.patchValue({idGroupeApporteur});
          } else {
            this.formGroupDemandeCriteria.patchValue({idGroupeApporteur: null});
          }
          if (!exists) {
            this.deleteIdGroupeApporteur();
          }
        }
      });
  }

  /**
   * Recherche un loueur dans la liste en fonction de son code.
   *
   * Parcourt la liste `loueurList` pour trouver un loueur dont le `code`
   * correspond à celui fourni en paramètre.
   *
   * @param codeLoueur Le code du loueur à rechercher.
   * @return Le loueur correspondant s’il est trouvé, sinon `undefined`.
   */
  private getLoueurByCode(codeLoueur: string): Loueur | undefined {
    return this.loueurList.find((loueur) => loueur.code === codeLoueur);
  }

  /**
   * Initialise la liste des loueurs à partir du service `loueurService`.
   *
   * Récupère les loueurs sélectionnés via la méthode `getLoueursSelected()`
   * et les stocke dans la liste `loueurList`.
   */
  private initLoueurs(): void {
    this.loueurList = this.loueurService.getLoueursSelected();
  }

  /**
   * Supprime le paramètre `idGroupeApporteur` de l'URL sans recharger la page.
   *
   * Clone les paramètres actuels de l'URL, supprime la clé `idGroupeApporteur`,
   * puis effectue une navigation avec les nouveaux paramètres en conservant le contexte de la route actuelle.
   */
  private deleteIdGroupeApporteur(): void {
    const currentParams = {...this.route.snapshot.queryParams};
    delete currentParams['idGroupeApporteur'];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      queryParamsHandling: '',
    });
  }
}
```
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
        <div class="uiu-1-8">
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
        <div class="uiu-1-5">
          <ml-ui-form-field>
            <ml-ui-label i18n>Loueur</ml-ui-label>
            <ml-ui-select formControlName="codeLoueur" (ngModelChange)="onLoueurChange($event)">
              <ml-ui-option [value]="null" i18n>- Tous les loueurs -</ml-ui-option>
              <ml-ui-option *ngFor="let loueur of loueurList" [value]="loueur.code">{{ loueur.libelle }}</ml-ui-option>
            </ml-ui-select>
          </ml-ui-form-field>
        </div>
        <div class="uiu-1-5">
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
      <div class="uig uis">
        <div class="uiu-1-5">
          <ml-ui-form-field>
            <ml-ui-label i18n>Groupe partenaires</ml-ui-label>
            <ml-ui-select formControlName="idGroupeApporteur" [disabled]="groupePartenairesDisabled">
              <ml-ui-option [value]="null" i18n>- Tous les groupes partenaires -</ml-ui-option>
              <ml-ui-option *ngFor="let groupePartenaire of groupePartenairesList" [value]="groupePartenaire.id">{{ groupePartenaire.nom }}</ml-ui-option>
            </ml-ui-select>
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
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RechercheDemandesComponent} from './recherche-demandes.component';
import {DemandeService} from '@core/service/demande/demande.service';
import {DemandeDataSource} from './demande.datasource';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Loueur} from '@models/Loueur';
import {LoueurService} from '@shared/service/loueur/loueur.service';
import {GroupeApporteursService} from '@core/service/groupe-apporteurs/groupe-apporteurs.service';
import {GroupeApporteurDomain} from '@leasa/rest-api-angular';

describe('RechercheDemandesComponent', () => {
  let component: RechercheDemandesComponent;
  let fixture: ComponentFixture<RechercheDemandesComponent>;
  let demandeServiceSpy: jest.Mocked<DemandeService>;
  let demandeDataSourceSpy: jest.Mocked<DemandeDataSource>;
  let loueurServiceSpy: jest.Mocked<LoueurService>;
  let groupePartenairesSpy: jest.Mocked<GroupeApporteursService>;

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
  let groupePartenaires: GroupeApporteurDomain[] = [
    {
      id: 86,
      code: 'XEROBOUTIQUE',
      nom: 'Xeroboutique',
      loueur: loueurs[0],
    } as GroupeApporteurDomain,
    {id: 96, code: 'ATLANCE', nom: 'Atlance'} as GroupeApporteurDomain,
  ];

  beforeEach(async () => {
    demandeServiceSpy = jest.mocked(DemandeService.prototype);
    demandeDataSourceSpy = jest.mocked(DemandeDataSource.prototype);
    loueurServiceSpy = jest.mocked(LoueurService.prototype);
    groupePartenairesSpy = jest.mocked(GroupeApporteursService.prototype);
    demandeDataSourceSpy.searchDemande = jest.fn();
    demandeDataSourceSpy.reinit = jest.fn();
    loueurServiceSpy.getLoueursSelected = jest.fn().mockReturnValue(loueurs);
    groupePartenairesSpy.searchByCriteria = jest.fn().mockReturnValue(of(groupePartenaires));
    await TestBed.configureTestingModule({
      imports: [RechercheDemandesComponent],

      providers: [
        {provide: DemandeService, useValue: demandeServiceSpy},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: Router, useValue: routerStub},
        {provide: LoueurService, useValue: loueurServiceSpy},
        {provide: GroupeApporteursService, useValue: groupePartenairesSpy},
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
    const spyInitAllLoueursAndGroupes = jest.spyOn(component as any, 'initAllLoueursAndGroupes');
    const spyCheckGroupePartenaires = jest.spyOn(component as any, 'checkGroupePartenaires');
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
    expect(component.groupePartenairesList).toEqual(groupePartenaires);
    expect(spyInitAllLoueursAndGroupes).toHaveBeenCalled();
    expect(spyCheckGroupePartenaires).not.toHaveBeenCalled();
  });

  it('should trigger searchDemande with correct criteria and call updateUrlWithNewPage if needed', fakeAsync(() => {
    const queryParams = {code: 'N12345', codeLoueur: 'NANCEO', idGroupeApporteur: 86};

    component['route'].queryParams = of(queryParams);
    const searchSpy = jest.spyOn(component.demandeDataSource, 'searchDemande');
    const updateUrlSpy = jest.spyOn(component as any, 'updateUrlWithNewPage');
    const loadLoueursThenGroupesByLoueurSpy = jest.spyOn(component as any, 'loadLoueursThenGroupesByLoueur');
    const getLoueurByCodeSpy = jest.spyOn(component as any, 'getLoueurByCode');
    component.ngOnInit();
    tick();
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(loadLoueursThenGroupesByLoueurSpy).toHaveBeenCalledWith('NANCEO', 86);
    expect(getLoueurByCodeSpy).toHaveBeenCalledWith('NANCEO');
    expect(searchSpy).toHaveBeenCalledWith({code: 'N12345', codeLoueur: 'NANCEO', idGroupeApporteur: 86}, 0);
    expect(component.formGroupDemandeCriteria.value.codeLoueur).toBe('NANCEO');
    expect(component.formGroupDemandeCriteria.value.idGroupeApporteur).toBe(86);
    expect(updateUrlSpy).not.toHaveBeenCalledWith(0);
  }));

  it('should set showSearchResult to true and navigate with correct query params', fakeAsync(() => {
    jest.spyOn(component, 'search');
    const navigateSpy = jest.spyOn(component['router'], 'navigate').mockImplementation(jest.fn());
    component.formGroupDemandeCriteria = new FormGroup({
      code: new FormControl('N12345'),
      refBailleur: new FormControl('123456X'),
      codeLoueur: new FormControl('HEALTHLEASE'),
      idGroupeApporteur: new FormControl(86),
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
        idGroupeApporteur: 86,
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
      idGroupeApporteur: new FormControl(86),
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
  it('should trigger searchDemande with incorrect idGroupeApporteur', fakeAsync(() => {
    const queryParams = {codeLoueur: 'NANCEO', idGroupeApporteur: 6546};

    component['route'].queryParams = of(queryParams);
    const updateUrlSpy = jest.spyOn(component as any, 'updateUrlWithNewPage');
    const loadLoueursThenGroupesByLoueurSpy = jest.spyOn(component as any, 'loadLoueursThenGroupesByLoueur');
    const getLoueurByCodeSpy = jest.spyOn(component as any, 'getLoueurByCode');
    const deleteIdGroupeApporteurSpy = jest.spyOn(component as any, 'deleteIdGroupeApporteur');
    component.ngOnInit();
    tick();
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(loadLoueursThenGroupesByLoueurSpy).toHaveBeenCalledWith('NANCEO', 6546);
    expect(getLoueurByCodeSpy).toHaveBeenCalledWith('NANCEO');
    expect(component.formGroupDemandeCriteria.value.codeLoueur).toBe('NANCEO');

    expect(updateUrlSpy).not.toHaveBeenCalledWith(0);
    expect(deleteIdGroupeApporteurSpy).toHaveBeenCalled();
  }));
  it('should trigger searchDemande without codeLoueur', fakeAsync(() => {
    const queryParams = {idGroupeApporteur: 86};

    component['route'].queryParams = of(queryParams);
    const initAllLoueursAndGroupesByLoueurSpy = jest.spyOn(component as any, 'initAllLoueursAndGroupes');
    component.ngOnInit();
    tick();
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(initAllLoueursAndGroupesByLoueurSpy).toHaveBeenCalled();
    expect(component.groupePartenairesList).toEqual(groupePartenaires);
    expect(component.formGroupDemandeCriteria.value.idGroupeApporteur).toBe(86);
  }));
  it('should trigger searchDemande without idGroupeApporteur', fakeAsync(() => {
    const queryParams = {codeLoueur: 'NANCEO'};

    component['route'].queryParams = of(queryParams);
    const loadLoueursThenGroupesByLoueurSpy = jest.spyOn(component as any, 'loadLoueursThenGroupesByLoueur');

    component.ngOnInit();
    tick();
    expect(component.numberTotalElement).not.toBeNull();
    expect(component['showSearchResult']).toBe(true);
    expect(loadLoueursThenGroupesByLoueurSpy).toHaveBeenCalled();
    expect(component.groupePartenairesList).toEqual(groupePartenaires);
    expect(component.formGroupDemandeCriteria.value.codeLoueur).toBe('NANCEO');
  }));
});
```