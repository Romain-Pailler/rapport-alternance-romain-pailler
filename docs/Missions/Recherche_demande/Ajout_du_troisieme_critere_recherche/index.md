---
sidebar_label: Filtre Loueurs
sidebar_position: "1"
tags: 
    - Migration
    - Angular
---
# Troisième filtre de recherche - Côté Client

## Objectif de la fonctionnalité

Cette évolution permet d’affiner les recherches de demandes en ajoutant un troisième critère : `codeLoueur`. Ce champ correspond à **l’identifiant du loueur** rattaché à la demande.

## Ticket

![Screenshot du ticket Jira](/img/recherche_demande/ticket_filtre_loueur.png)

---
:::info
Le code source se trouve [ici](../../../annexes/bout_de_code/Projet_recherche_demande/filtre_loueurs)
:::

## Mise à jour du FormGroup

Le `FormGroup` définit la structure des champs présents dans le formulaire de recherche. Ici, j'ai ajouté un champ `codeLoueur` de type `FormControl`, utilisé pour capturer la valeur saisie par l’utilisateur.

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

### Détail

* **`codeLoueur`** : champ libre (pas de contrainte de format), saisi manuellement par l’utilisateur.
* **Pourquoi l’ajouter** : permet de cibler les demandes en fonction du loueur rattaché.

---

## Ajout dans le composant HTML – Champ « Loueur »

J'ai ajouté un **champ de sélection (dropdown)** au formulaire pour permettre à l’utilisateur de filtrer les demandes selon le **loueur associé**. Le champ est lié au `formControlName="codeLoueur"` défini dans le `FormGroup`.

### Code HTML

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

### Explication

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

## Résultat

<video controls width="100%">
  <source src="/videos/filtre_loueurs.mp4" type="video/mp4"/>
  Votre navigateur ne supporte pas la vidéo HTML5.
</video>

---
