---
sidebar_label: Bouton réinitialisation - Code source
sidebar_position: "3"
tags: 
    - Migration
    - Angular
    - Code
---

# Code source

## recherche-demandes.component.html

```html
<div class="page-header-leasa">
  <h1 i18n>Recherche demandes</h1>
</div>
<ml-ui-bloc [foldable]="true" [folded]="false">
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
          >{{ demande.code }}
          </ml-ui-chips>
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="statut">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Statut</th>
        <td ml-ui-cell *mlUiCellDef="let demande">{{ demande.statut.libelleBack }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="apporteur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Apporteur / Groupe d'apporteurs</th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.apporteur.libelle }}</b>
          <br> {{ demande.apporteur?.groupeApporteurs?.nom ? demande.apporteur?.groupeApporteurs?.nom : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="client">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Client / Siren / Registration number</th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.client.raisonSociale }}</b> <br /> {{ demande.client.siren }}</td>
      </ng-container>
      <ng-container mlUiColumnDef="bailleur">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Bailleur et référence</th>
        <td ml-ui-cell *mlUiCellDef="let demande"><b>{{ demande.accord?.bailleur.libelle ? (demande.accord?.bailleur.libelle) : '-' }}</b>
          <br /> {{ demande.accord?.reference ? (demande.accord?.reference) : '-' }}
        </td>
      </ng-container>
      <ng-container mlUiColumnDef="montantVenteAchatHT">
        <th ml-ui-header-cell *mlUiHeaderCellDef i18n>Achat HT / Vente HT</th>
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

## recherche-demandes.component.scss

```css
.recherche-demande {
  &__filtres {
    &__boutons {
      display: flex;
      justify-content: flex-end;

      button:first-of-type {
        ml-ui-icon {
          padding-right: 0;
        }
      }
    }
  }

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
```

## recherche-demandes.component.ts

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
import {RecherchePieceComptableFormGroup} from '../../comptabilite/recherche-piece-comptable/recherche-piece-comptable-form-group';
import {RechercheDemandesFormGroup} from './recherche-demandes-form-group';
import {ReactiveFormsModule} from '@angular/forms';
import {PAGINATE_DATASOURCE_PROPERTY} from '@core/utils/paginate-datasource-property';
import {ActivatedRoute, Router} from '@angular/router';
import {take} from 'rxjs';

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

## recherche-demandes.component.spec.ts

```ts
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
```
