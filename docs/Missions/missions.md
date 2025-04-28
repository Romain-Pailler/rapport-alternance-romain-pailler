---
sidebar_label: Mes missions
sidebar_position: "1"
---

# Présentation des Missions

Dans le cadre de mon alternance au sein de Nanceo, j'ai été recruté principalement pour réaliser un travail de **migration technique** d'écrans existants. Mon objectif était de contribuer activement à la modernisation de l'application interne en migrant progressivement des composants développés sous AngularJS vers Angular moderne (2+).

Cette partie sera donc séparée en trois grandes catégories :

- **1. Les nouvelles fonctionnalités**
- **2. Les corrections**
- **3. L'analyse fonctionnelle**

---

# Migration d'AngularJS vers Angular (2+) : enjeux et importance

## AngularJS : une technologie obsolète

AngularJS[^1] a été l’un des premiers *frameworks*[^2] front-end très populaires pour créer des applications web dynamiques (des **Single Page Applications (SPA)**[^3]). Cependant, ce framework lancé en 2010 est désormais considéré comme obsolète. Google, son éditeur, a annoncé la fin du support officiel d’AngularJS fin 2021, ce qui signifie l’absence de mises à jour ni de correctifs de sécurité depuis janvier 2022.

De son côté, **Angular**[^4] (souvent appelé Angular 2+ pour les versions ultérieures) est la refonte complète du framework par Google, sortie dès 2016. Angular repose sur une architecture par **composants**[^5] et utilise **TypeScript**[^6] comme langage, ce qui apporte des améliorations majeures en termes de performance, de maintenabilité et de fonctionnalités.

Contrairement à AngularJS, Angular est régulièrement mis à jour (nouvelles versions stables tous les six mois environ) et bénéficie d’un support actif de la part de Google et de sa communauté.

## Dette technique et risques liés à AngularJS

Continuer d’utiliser AngularJS aujourd’hui équivaut à accumuler de la **dette technique**[^7]. Ce concept désigne le coût futur que représente le maintien de solutions technologiques dépassées ou de raccourcis de développement pris par le passé. Plus le temps passe sans migrer, plus l'impact de cette dette augmente.

Les principaux risques associés au maintien d'AngularJS sont :

- **Sécurité** : absence de correctifs de sécurité critiques.
- **Maintenance difficile** : rareté des développeurs AngularJS et bugs connus non corrigés.
- **Compatibilité et pérennité** : risques d'incompatibilité avec les évolutions web modernes.
 
![Illustration de la dette technique et de la nécessité de migration](dette_technique_migration.png)

## Avantages de migrer vers Angular (2+)

Migrer une application AngularJS vers Angular moderne offre plusieurs bénéfices majeurs :

- **Maintenabilité** : code mieux structuré grâce à l'architecture *modulaire*[^8].
- **Performance** : gain en vitesse et en réactivité grâce à la compilation anticipée (AOT).
- **Technologies modernes** : adoption de TypeScript, PWA[^9], CLI, et gestion d'état moderne.
- **Support et communauté** : accès à des ressources mises à jour régulièrement.
- **Réduction de la dette technique** : meilleure qualité du code et préparation des évolutions futures.

## Conclusion

La migration d’AngularJS vers Angular 2+ est indispensable pour garantir la **sécurité**, la **pérennité** et la **performance** des applications web modernes. Mon rôle durant l'alternance a été d’apporter une contribution technique essentielle en réalisant cette migration, tout en respectant les contraintes métier et techniques du projet Leasa.

---

## Notes de bas de page

[^1]: **AngularJS** : Framework JavaScript front-end lancé par Google en 2010 (versions 1.x), basé sur le modèle MVC avec data-binding bidirectionnel.
[^2]: **Framework** : Cadre applicatif offrant des outils, composants et conventions pour faciliter le développement logiciel.
[^3]: **SPA (Single Page Application)** : Application web monopage ne nécessitant pas de rechargements complets, pour une navigation fluide.
[^4]: **Angular (2+)** : Refondation complète d'AngularJS publiée en 2016, avec une architecture basée sur TypeScript et les composants.
[^5]: **Composant (Component)** : Élément indépendant regroupant logique, vue et style d'une partie d'une application Angular.
[^6]: **TypeScript** : Surcouche de JavaScript développée par Microsoft, apportant le typage statique et des outils de développement robustes.
[^7]: **Dette technique** : Coût futur induit par l'usage de solutions techniques obsolètes ou sous-optimales.
[^8]: **Architecture modulaire** : Organisation du code en modules ou composants autonomes facilitant la maintenance et l’évolution.
[^9]: **PWA (Progressive Web App)** : Application web enrichie pour offrir une expérience proche d'une application mobile native (installation, hors-ligne, notifications).
