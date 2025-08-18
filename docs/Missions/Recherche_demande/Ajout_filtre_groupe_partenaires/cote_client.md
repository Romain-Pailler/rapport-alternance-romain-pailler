---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Ajout du critère "Groupe partenaires" - Côté Client

## Mise à jour du FormGroup – `RechercheDemandesFormGroup`

Pour intégrer le critère **Groupe partenaires**, j’ai ajouté un nouveau champ `idGroupeApporteur` dans le `FormGroup` utilisé pour la recherche de demandes.

### FormGroup

```ts
import {FormControl, FormGroup, Validators} from '@angular/forms';

export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null, Validators.pattern('[a-zA-Z]?[0-9]{1,6}')),
      refBailleur: new FormControl(null as string | null),
      codeLoueur: new FormControl(null as string | null),
      idGroupeApporteur: new FormControl(null as number | null),
    });
  }
}
```

### Explications

* Le champ `idGroupeApporteur` correspond à l’identifiant d’un groupe de partenaires mais aussi aux paramètres de critères côté serveur.
* Sa valeur par défaut est `null`, ce qui signifie que je considère "tous les groupes partenaires".
* Le `FormGroup` reste le point central pour récupérer et envoyer les valeurs des critères de recherche depuis mon composant.

---

## Mise à jour du template HTML – `recherche-demandes.component.html`

J’ai ajouté le critère "Groupe partenaires" sous forme de `select`, lié au champ `idGroupeApporteur`.

```html
<div class="uig uis">
  <div class="uiu-1-5">
    <ml-ui-form-field>
      <ml-ui-label i18n>Groupe partenaires</ml-ui-label>
      <ml-ui-select formControlName="idGroupeApporteur" [disabled]="groupePartenairesDisabled">
        <ml-ui-option [value]="null" i18n>- Tous les groupes partenaires -</ml-ui-option>
        <ml-ui-option *ngFor="let groupePartenaire of groupePartenairesList" [value]="groupePartenaire.id">
          {{ groupePartenaire.nom }}
        </ml-ui-option>
      </ml-ui-select>
    </ml-ui-form-field>
  </div>
</div>
```

### Explications

* J’ai lié le `select` au champ `idGroupeApporteur` du `FormGroup` avec `formControlName`.
* La liste des groupes (`groupePartenairesList`) est récupérée dynamiquement via mon service `GroupeApporteursService`.
* J’utilise `[disabled]` pour désactiver le champ si aucun groupe n’est disponible.
* L’option `[value]="null"` représente mon choix par défaut : "Tous les groupes partenaires".

---

## Gestion des interactions côté TypeScript – `recherche-demandes.component.ts`

### Variables que j’ai ajoutées

```ts
public groupePartenairesList: GroupeApporteurDomain[];
public groupePartenairesDisabled = false;
```

### Injection des services

Pour gérer la récupération des groupes partenaires, j’ai injecté :

```ts
readonly groupeApporteurService: GroupeApporteursService;
```

---

### Initialisation avec les query parameters

Lors de l’initialisation (`ngOnInit`), je lis les paramètres d’URL et j’adapte le formulaire selon les cas possibles :

```ts
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
```

* J’ai prévu ces quatre cas pour gérer toutes les combinaisons possibles entre le loueur et le groupe partenaires.
* En fonction de la présence du codeLoueur et d'un idGroupeApporteur je filtre la liste de groupe partenaires.
* Ma fonction `checkGroupePartenaires` vérifie si l’identifiant existe dans la liste avant de l’injecter dans le formulaire.

---

### Réaction au changement de loueur

```ts
onLoueurChange(codeLoueur: string): void {
  this.formGroupDemandeCriteria.patchValue({idGroupeApporteur: null});
  this.loadLoueursThenGroupesByLoueur(codeLoueur);
}
```

* Quand l’utilisateur change de loueur, je réinitialise le champ `idGroupeApporteur`.
* Je recharge dynamiquement la liste des groupes partenaires associés au nouveau loueur.

---

### Chargement des groupes partenaires

#### Initialisation globale

```ts
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
```

* Cette fonction me permet de récupérer tous les groupes partenaires disponibles.

#### Chargement par loueur

```ts
private loadLoueursThenGroupesByLoueur(codeLoueur: string, idGroupeApporteur?: number): void {
  let loueurSelected = this.getLoueurByCode(codeLoueur);
  const criteria: any = { idLoueur: loueurSelected?.id };
  
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
          this.deleteIdGroupeApporteur();
        }
      }
    });
}
```

* Avec `loadLoueursThenGroupesByLoueur()`, je récupère uniquement les groupes liés au loueur sélectionné.
* Si un `idGroupeApporteur` est fourni et valide, je le patch dans le formulaire, sinon je supprime le filtre.

---

### Gestion de l’URL

```ts
private deleteIdGroupeApporteur(): void {
  const currentParams = {...this.route.snapshot.queryParams};
  delete currentParams['idGroupeApporteur'];
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: currentParams,
    queryParamsHandling: '',
  });
}
```

* Cette méthode me permet de supprimer un paramètre `idGroupeApporteur` invalide de l’URL, afin de ne pas conserver un filtre incorrect après un changement de loueur.

---

## Conclusion

Avec l’ajout du critère **Groupe partenaires**, j’ai pu :

* Permettre une recherche plus fine en combinant loueurs et groupes partenaires.
* Réinitialiser automatiquement le groupe lors d’un changement de loueur.
* Synchroniser le formulaire avec l’URL pour que les recherches soient partageables et cohérentes.
* Garantir une UX fluide grâce à la gestion dynamique et réactive des listes de partenaires.

---
