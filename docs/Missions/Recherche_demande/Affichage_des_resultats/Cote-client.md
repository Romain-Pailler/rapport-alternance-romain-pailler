---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

## Création du composant avec la CLI angular 

Afin d’ajouter une nouvelle page à l’application, j’ai commencé par générer un composant Angular. Ce composant constitue la structure de base de l’interface, en regroupant la logique métier (TypeScript), le template HTML, la feuille de style dédiée (SCSS) ainsi que les tests unitaires associés.

Pour cela, j’ai utilisé la CLI Angular avec la commande suivante :

```bash
ng generate component recherche-demandes
```

Cette commande a automatiquement généré les fichiers suivants :

* `recherche-demandes.component.ts` : fichier principal contenant la logique du composant (classe TypeScript)
* `recherche-demandes.component.html` : template HTML affichant les données et la structure visuelle
* `recherche-demandes.component.scss` : feuille de style spécifique à ce composant
* `recherche-demandes.component.spec.ts` : fichier de test unitaire permettant de valider le comportement du composant

:::tip
L’utilisation de la CLI permet de normaliser la structure des fichiers Angular, de gagner du temps, et de s'assurer que tous les éléments nécessaires sont bien créés dès le départ.
:::

Très bien ! Voici une version rédigée et claire pour cette partie sur le **routing**, avec une explication du pourquoi et du comment :

---

## Ajout dans le routing de l'application

Une fois le composant créé, il est nécessaire de le déclarer dans le système de **routing Angular**, afin de rendre la page accessible via une URL. Cela se fait dans le fichier `app-routing.module.ts`, qui centralise toutes les routes de l'application.

J’ai donc ajouté l’entrée suivante :

```typescript
{
  path: 'recherche-demandes',
  component: RechercheDemandesComponent,
  canActivate: [AuthGuard, MailGuard],
}
```

### Explication 

* `path: 'recherche-demandes'` : définit l'URL à laquelle le composant sera accessible (`/recherche-demandes`).
* `component: RechercheDemandesComponent` : associe cette route au composant que j’ai créé.
* `canActivate` : ajoute des **garde-fous de sécurité** (`AuthGuard` et `MailGuard`), qui empêchent l'accès à la page si certaines conditions ne sont pas remplies (par exemple : utilisateur non authentifié, ou email non validé).

:::tip
En Angular, le routing est indispensable pour permettre la navigation entre les différentes pages d’une application monopage (SPA — Single Page Application).
:::
Parfait, voici une rédaction claire et complète pour expliquer à quoi sert un fichier `.service.ts` en Angular, ainsi qu’une explication du code que tu as ajouté dans `demande.service.ts` :

---

## Ajout de la logique métier dans un service Angular

En Angular, les fichiers terminant par `.service.ts` sont utilisés pour **centraliser la logique métier** et **gérer les échanges avec les APIs** (backend). Ces services permettent de découpler les composants de la logique de traitement, rendant le code plus lisible, réutilisable et facile à tester.

Dans mon cas, j’ai ajouté une méthode `searchDemandesByCriteria` dans le fichier `demande.service.ts`. Cette méthode permet d’effectuer une recherche de demandes à partir de critères dynamiques (fournis via un formulaire qui sera utilisé par la suite  ).

### Code ajouté 

```typescript
public searchDemandesByCriteria(demandeCriteria: FormGroup): Observable<DemandePaginate> {
  return this.demandesApi
    .searchByCriteria(demandeCriteria)
    .pipe(map((demandesContainer: DemandePaginateContainer) => demandesContainer.result));
}
```

### Explication 

* `demandeCriteria: FormGroup` : correspond aux critères saisis par l’utilisateur dans un formulaire (par exemple, un filtre sur la date ou le statut).
* `this.demandesApi.searchByCriteria(...)` : appelle l’API REST côté serveur avec ces critères.
* `.pipe(map(...))` : permet de transformer la réponse obtenue. L’API retourne un objet de type `DemandePaginateContainer`, contenant des métadonnées et les résultats. Le `map()` extrait uniquement la liste des demandes (`result`), qui nous intéresse ici.
* Le tout retourne un `Observable<DemandePaginate>`, conforme à la logique réactive d’Angular (RxJS), pour permettre un traitement asynchrone.

## DataSource personnalisée : centraliser le flux de données et la pagination

Pour alimenter la table **`ml-ui-table`** en données tout en gérant la pagination et les états de chargement, j’ai créé une classe `DemandeDataSource` qui implémente l’interface `DataSource<DemandeDomain>`.

### Pourquoi une DataSource ?

* **Responsabilité unique** : elle encapsule toute la logique de récupération, de transformation et de diffusion des données destinées au tableau, laissant le composant léger et centré sur l’UI.
* **Flux réactif** : en exposant des `Observable`, elle permet au template d’utiliser l’`async pipe` pour se mettre à jour automatiquement.
* **Nettoyage facilité** : `connect()` et `disconnect()` assurent l’ouverture et la fermeture propre des flux.

### Description des principaux membres

| Élément                                             | Rôle                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `BehaviorSubject<DemandeDomain[]> demandeSubject`   | Contient la liste courante de demandes à afficher.                                       |
| `BehaviorSubject<boolean> loadingSubject`           | Indique si une requête est en cours pour afficher un skeleton ou désactiver les boutons. |
| `BehaviorSubject<number> numberPageSubject`         | Conserve l’index de la page courante.                                          |
| `BehaviorSubject<number> numberTotalElementSubject` | Stocke le nombre total d’éléments retourné par l’API.                                    |
| `connect()`                                         | Retourne l’`Observable` alimentant directement la table.                                 |
| `disconnect()`                                      | Ferme les sujets pour éviter les fuites mémoire.                                         |

### La méthode `searchDemande`

```typescript
searchDemande(demandeCriteria: any, indexPage: number) {
  this.loadingSubject.next(true); // 1. active l’indicateur de chargement

  this.demandeService
    .searchDemandesByCriteria({ ...demandeCriteria, startPage: indexPage }) // 2. appel API
    .pipe(
      tap((demandes) => this.demandeSubject.next(demandes.list)),          // 3a. mise à jour des lignes
      tap((demandes) => this.numberPageSubject.next(demandes.offset - 1)), // 3b. index de page
      tap((demandes) => this.numberTotalElementSubject.next(demandes.total)), // 3c. total
      catchError(() => of([])),                                            // 4. tolérance aux erreurs
      finalize(() => this.loadingSubject.next(false))                      // 5. désactive le loading
    )
    .subscribe();                                                          // 6. déclenche l'exécution
}
```

1. **Activation du loader** : la vue affiche un skeleton.
2. **Appel du service** : fusion des critères utilisateur avec `startPage`.
3. **`tap()` en cascade** : met à jour la liste, la page courante et le nombre total d’éléments, ce qui alimente en temps réel la table et le paginator.
4. **`catchError()`** : en cas d’erreur, on renvoie une liste vide pour éviter de casser l’affichage.
5. **`finalize()`** : coupe proprement le loader, qu’il y ait succès ou échec.
6. **`subscribe()`** : indispensable pour exécuter la chaîne RxJS et déclencher les `tap()`.

> **Pourquoi la pagination « fonctionne grâce au subscribe » ?**
> Sans `subscribe()`, le flux reste « froid » (non exécuté). C’est l’abonnement qui lance réellement l’appel HTTP et propage les mises à jour vers les `BehaviorSubject`; le paginator, abonné à `numberPage$` et `numberTotalElement$`, se rafraîchit alors automatiquement.

### Réinitialisation

```typescript
reinit() {
  this.loadingSubject.next(false);
  this.demandeSubject.next([]);
  this.numberPageSubject.next(0);
  this.numberTotalElementSubject.next(this.NO_SEARCH);
}
```

Cette méthode vide les flux et rétablit l’état initial, pratique lorsqu’on ferme la page ou qu’on change complètement de critères.

:::tip
Grâce à cette `DataSource`, la table reste **synchrone** avec les données serveur, la pagination et l’état de chargement, tout en gardant le composant `RechercheDemandesComponent` simple et maintenable.
:::

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
