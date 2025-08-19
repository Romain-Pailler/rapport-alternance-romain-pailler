---
sidebar_label: "Présentation de Monalisa UI"
sidebar_position: 1
tags:
  - UI
  - Angular
  - Librairie
---

# Monalisa UI

## Objectif du projet

Le projet **Monalisa UI** vise à créer une **librairie commune de composants Angular** pour uniformiser l'interface des applications front-office et back-office développées au sein des équipes.

Ce module permet de :

- Réutiliser des composants graphiques partagés,
- Harmoniser les interfaces entre plusieurs applications,
- Faciliter la maintenance du code.

**À terme, tous les composants front/back seront centralisés dans ce module.**

:::info
Pour la page de recherche de demandes, tout les éléments sont des composants de la biliothèque
:::

---

## Aperçu rapide

Monalisa UI inclut un **storybook** permettant de visualiser et tester les composants (uniquement via l'intranet de l'entreprise) :

> _[Capture d’écran de l’interface Storybook ou de Jenkins à insérer ]_

---

## Architecture du projet

Monalisa UI est basé sur **Angular 2+**, et contient deux sous-projets :

- `ml-lib` : la librairie de composants `@leasa/ui`.
- `ml-test` : une application de test pour visualiser rapidement les composants développés.

> 🗂️ _[À insérer ici un schéma d’arborescence simple du projet : dossier racine → ml-lib + ml-test + .storybook]_  

---

## Utilisation typique


### Intégration dans un projet Angular

1. Installer la librairie depuis Artifactory :  
   `npm install @leasa/ui`

2. L’importer dans le `AppModule`.

---

## Support d’AngularJS

Certains composants peuvent être **downgradés** pour être utilisés dans du code AngularJS grâce au module `mlUIDowngradeModule`.

![Schéma du downgrade de composant](/img/ml-ui-downgrade.png)
