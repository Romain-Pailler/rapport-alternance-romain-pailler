---
sidebar_label: Côté client
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Côté Client

## le form group
``` typescript
export class RechercheDemandesFormGroup {
  static build() {
    return new FormGroup({
      code: new FormControl(null as string | null),
    });
  }
}
```

## le composant html ajout du bouton

```html 
<form
      (ngSubmit)="search()"
      [formGroup]="formGroupDemandeCriteria"
      (reset)="reinit()"
    >
    <div class="recherche-demande__filtres__boutons">
        <button type="reset" mlUiButton variant="secondary">
          <ml-ui-icon icon="undo" class="recherche-demande__filtres__boutons__reinit"></ml-ui-icon>
        </button>
```

## le css

```scss
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
  ```

## le composant 

la fonction

``` typescript 
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
```

les tests