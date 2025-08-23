---
sidebar_label: Côté client
sidebar_position: 3
tags: 
    - Migration
    - Angular
---
# Bouton Réinitialiser - Côté Client

## Ajout d’un bouton de réinitialisation du formulaire de recherche

Dans le cadre de l’amélioration de l’expérience utilisateur de la page de recherche de demandes, un ticket a été créé pour intégrer un **bouton de réinitialisation** du formulaire. Ce bouton permet à l’utilisateur de réinitialiser rapidement tous les filtres et champs saisis dans le formulaire, sans avoir à le faire manuellement champ par champ.

La première étape a consisté à intégrer un bouton HTML avec l’attribut `type="reset"` à l’intérieur du `<form>`, afin qu’il déclenche automatiquement l’événement `reset`. Ce bouton est stylisé via le design system maison (`mlUiButton`) et utilise une icône "undo" pour en renforcer la signification visuelle.

## Explication du code

:::info
Le code source complet est disponible [ici](./../../../annexes/bout_de_code/Projet_recherche_demande/bouton_reinit)
:::

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

La directive `(reset)="reinit()"` permet de **lier cet événement HTML à une méthode `reinit()`** définie dans le composant Angular. Cette méthode va s’occuper de remettre à zéro les valeurs du `FormGroup`, et éventuellement relancer une recherche avec des critères par défaut si nécessaire.

### Style CSS associé

Pour respecter la charte graphique de l’application et garantir une bonne intégration visuelle du bouton de réinitialisation, une section de style SCSS a été ajoutée dans la feuille dédiée au composant. Elle utilise une structure en BEM pour conserver une organisation claire et modulaire des classes.

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

**Explication du style :**

* La classe `__filtres__boutons` utilise un `display: flex` combiné à un `justify-content: flex-end` pour **aligner les boutons à droite** dans le conteneur.
* La règle `button:first-of-type` cible ici le **bouton de réinitialisation**, qui est le premier dans l’ordre du DOM.
* À l’intérieur de ce bouton, l’élément `<ml-ui-icon>` se voit appliquer un `padding-right: 0` pour **supprimer l’espace superflu à droite de l’icône**, assurant ainsi une meilleure symétrie visuelle.

### Fonction de réinitialisation dans le composant

Le bouton de réinitialisation du formulaire de recherche appelle la méthode `reinit()` définie dans le composant Angular. Cette méthode permet de remettre à zéro l’état de l’interface et de la logique de recherche, afin de revenir à une situation initiale, sans filtre appliqué ni résultat affiché.

```typescript
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

#### Détail de la méthode

* `this.formGroupDemandeCriteria.reset();`
   Réinitialise tous les champs du formulaire à leur valeur initiale (souvent `null` ou vide), supprimant ainsi tous les filtres saisis par l'utilisateur.

* `this.demandeDataSource.reinit();`
   Vide ou réinitialise l’objet représentant les résultats de recherche (`DemandeDataSource`), ce qui empêche l’affichage de données obsolètes ou filtrées.

* `this.showSearchResult = false;`
   Masque la section de résultats, si elle était visible suite à une précédente recherche.

* `this.router.navigate([], { queryParams: {}, queryParamsHandling: '' });`
   Supprime tous les paramètres de l’URL associés à la recherche (comme des filtres ou des pages), en assurant que l’état de l’application est complètement nettoyé.

---

### Test unitaire de la fonction de réinitialisation

Un test unitaire a été mis en place pour s'assurer que la méthode `reinit()` se comporte comme prévu lorsqu'on clique sur le bouton de réinitialisation du formulaire.

```typescript
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

#### Ce que teste ce bloc

* **Déclenchement de la méthode `reinit()`** après le clic sur le bouton de type `reset`.
* **Réinitialisation du formulaire** via `formGroupDemandeCriteria.reset()`.
* **Réinitialisation de la source de données** grâce à `demandeDataSource.reinit()`.
* **Masquage des résultats de recherche** en vérifiant que `showSearchResult` est à `false`.
* **Nettoyage de l'URL** en s'assurant que `router.navigate()` est appelé sans paramètres (`queryParams` vidés).

Ce test garantit donc que le bouton de réinitialisation effectue bien toutes les actions nécessaires pour remettre l’interface dans un état propre et neutre.

---
