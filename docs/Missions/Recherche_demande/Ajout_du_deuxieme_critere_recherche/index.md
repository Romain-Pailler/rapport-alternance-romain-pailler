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

:::info

Le code source de ce ticket se trouve [ici](../../../annexes/bout_de_code/Projet_recherche_demande/filtre_refBailleur.md)
:::

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

#### Explication

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

#### Code HTML associé

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

#### Explication

* Le champ est encapsulé dans un composant de mise en forme `<ml-ui-form-field>` utilisé dans l’interface pour uniformiser l’apparence.
* Le label "Référence bailleur" est internationalisé via l’attribut `i18n`.
* Le champ `<input>` est un champ texte simple relié au `FormControl` via `formControlName="refBailleur"`.
* L'attribut `(keydown.space)="$event.preventDefault()"` empêche la saisie d'espaces, ce qui peut éviter des erreurs de validation ou des références mal formatées.

---
