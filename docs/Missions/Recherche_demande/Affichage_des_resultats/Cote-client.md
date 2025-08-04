---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Affichage des résultats - Côté Client

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

### Explication du service

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
---

## Composant `RechercheDemandesComponent`

:::info

Le code source du composant est disponible [ici](./../../../annexes/bout_de_code/affichage_resultats/cote_client)

:::

### Méthode `ngOnInit()`

```ts
ngOnInit(): void {
  this.initDataSource();
}
```

Cette méthode du cycle de vie Angular est appelée **automatiquement à l’affichage du composant**. Elle appelle la fonction `initDataSource`.

---

### Méthode `initDataSource()`

```ts
private initDataSource() {
  this.demandeDataSource = new DemandeDataSource(this.demandeService);
  ...
}
```

Elle :

* crée une nouvelle instance de `DemandeDataSource`
* s’abonne à trois flux (`numberPage$`, `numberTotalElement$`, `loading$`) pour mettre à jour dynamiquement les variables du composant à chaque changement :

  * `numberPage` : mise à jour de la page affichée
  * `numberTotalElement` : mise à jour du nombre total de résultats
  * `searchLoading` : pour afficher un indicateur de chargement (skeleton)

> Le `takeUntilDestroyed()` évite les fuites mémoire en coupant l’abonnement automatiquement lorsque le composant est détruit.

---

### Méthode `search()`

```ts
search() {
  this.showSearchResult = true;
  this.searchPage(0);
}
```

Cette méthode est appelée lorsqu’un utilisateur clique sur le bouton **Rechercher**.
Elle :

1. rend visibles les résultats (`showSearchResult = true`)
2. déclenche une recherche à partir de la **première page**

---

### Méthode `searchPage(index: number)`

```ts
searchPage(index: number) {
  const criteria: any = {
    currentProjection: 'projectionRechercheBack',
  };
  this.demandeDataSource.searchDemande(criteria, index);
}
```

Elle exécute une **recherche avec pagination**, en appelant la méthode `searchDemande()` du `DataSource`, avec :

* les **critères de recherche** (ici une projection par défaut)
* l’**index de la page** demandée

---

### Méthode `getCurrency(devise: string)`

```ts
getCurrency(devise: string) {
  return CurrencyUtils.parseToAngularDevise(devise);
}
```

Méthode utilitaire utilisée dans le HTML pour formater les montants en fonction de la devise.
Par exemple, `"EUR"` est transformé pour être correctement interprété par le `currency` pipe d’Angular.

--

## Structure du fichier HTML : `recherche-demandes.component.html`

Le template HTML de cette page Angular repose sur deux grands blocs visuels :

1. Un bloc pour les **filtres de recherche**,
2. Un bloc pour l’**affichage des résultats**, avec une table et une pagination.

---

### **Premier bloc – Filtres de recherche**

```html
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
```

Ce bloc contient les **éléments d’interaction utilisateur**, en particulier le bouton « Rechercher ».
Celui-ci déclenche la méthode `search()` dans le composant TypeScript.
Le bloc est repliable, mais toujours déplié par défaut (`[folded]="false"`).

> La partie "Filtres" pourra ensuite être enrichie avec des champs de formulaire (input, select, date, etc.).

---

### **Second bloc – Résultats de la recherche**

Ce bloc ne s'affiche **que si une recherche est lancée**, contrôlé par `*ngIf="showSearchResult"` (ici via `[class.hide]`).

#### **Affichage du tableau**

```html
<table ml-ui-table [dataSource]="demandeDataSource" ...>
  ...
</table>
```

La table est alimentée automatiquement par la `DataSource` Angular. Elle affiche les colonnes définies dans le composant TypeScript (`columns = [...]`), et chaque colonne est associée à un champ de l’objet `demande`.

Les colonnes les plus importantes sont :

* **N° Dossier** : affiché sous forme de chip colorée.
* **Statut**, **Apporteur**, **Client**, **Bailleur** : informations d’identification.
* **Montants** : vente, achat et loyer HT, formatés via le pipe `currency` en fonction de la devise.
* **Dates** : dépôt et paiement, avec affichage au format `dd/MM/yyyy`.
* **Commercial apporteur** : affiche le nom complet du commercial lié.

#### **Chargement en cours (Skeleton)**

```html
<div *mlUiSkeleton="searchLoading; template: 'table'; ..."></div>
```

Lorsque les résultats sont en cours de chargement (`searchLoading` à `true`), un **squelette visuel** est affiché à la place du tableau.

---

#### **Aucun résultat**

```html
<div [class.hide]="numberTotalElement > 0 || searchLoading" i18n>
  Aucun résultat pour cette recherche.
</div>
```

Ce message est affiché uniquement si :

* Aucun résultat n’a été trouvé (`numberTotalElement <= 0`)
* ET que la recherche n’est plus en cours (`searchLoading == false`)

---

#### **Pagination**

```html
<ml-ui-paginator
  [length]="numberTotalElement"
  [pageSize]="10"
  [indexPage]="numberPage"
  (page)="searchPage($event + 1)"
  ...
></ml-ui-paginator>
```

Ce composant permet de naviguer dans les pages de résultats.
Il est alimenté dynamiquement avec :

* le nombre total d’éléments (`numberTotalElement`)
* la page en cours (`numberPage`)
* et une taille de page fixe (10)

Lors d’un changement de page, il appelle `searchPage()` dans le composant TypeScript, avec l’index correspondant.

## demande.service.spec.ts

```ts
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
  ```

## demande.service.ts

``` ts
public searchDemandesByCriteria(demandeCriteria: FormGroup): Observable<DemandePaginate> {
    return this.demandesApi
      .searchByCriteria(demandeCriteria)
      .pipe(map((demandesContainer: DemandePaginateContainer) => demandesContainer.result));
  }
```

## messages.en_EN.json

```json
 "5390649178523111901": "Financial application search",
    "4655471430282005775": "Application number",
    "297600783847769458": "Suppliers / Suppliers groupck",
    "3374708419980534575": "Client / Siren / Registration number ",
    "4154092245707467191": "Funder and référence ",
    "5252146544424526556": "Purchase excl. VAT / Sales excl.VAT ",
    "44406838033108295": "Rent excl.VAT ",
    "2074819151343358437": "Submitted on ",
    "1614649226369080187": "Paid on ",
    "7306143457890530917": "Supplier sales person ",
```
