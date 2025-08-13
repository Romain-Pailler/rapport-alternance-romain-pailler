---
sidebar_label: Vocabulaire technique
sidebar_position: 2
tags: 
    - Glossaire
    - Vocabulaire
---

# Vocab technique

## AngularJS

Ancienne version du framework JavaScript développé par Google (versions 1.x), basé sur un modèle MVC (Modèle–Vue–Contrôleur).

## Angular 2+

Nouvelle génération du framework Angular (versions 2 et supérieures), entièrement réécrite en TypeScript.
Il adopte une architecture composants et facilite le développement d’applications web complexes.

## Back-end

Partie d’une application qui gère les données et la logique métier, généralement côté serveur.

## Back Office

Partie d’une application ou d’un système réservée aux administrateurs, gestionnaires ou équipes internes.
Elle permet de configurer, gérer et superviser les données, processus et utilisateurs, mais n’est pas accessible au grand public.

## Changelog

Document ou section listant **toutes les modifications apportées à un projet** (fonctionnalités ajoutées, corrections de bugs, optimisations…).  
Il sert de **traçabilité** entre les versions et aide l’équipe à savoir **quand et pourquoi un changement a été effectué**.  
Dans un projet comme **Leasa**, le changelog permet de suivre les évolutions d’AngularJS vers Angular 2+, ainsi que les tickets Jira corrigés ou ajoutés.

## Controller

Composant **côté serveur** qui reçoit les requêtes HTTP, **appelle la logique métier** (services/processus) et **renvoie une réponse** (JSON/XML).
Il sert de **point d’entrée** de l’API : il **valide les paramètres**, **oriente la requête** et **sérialise** le résultat (ex. un DTO) vers le client.
Dans notre logiciel, on les appelle les `Service`.

## Coverage

Indicateur de **couverture de tests** : pourcentage de code exécuté par les tests automatisés.
Dans notre équipe, 80% est le pourcentage minimal afin de valider nos Pull-Requests.
Un **coverage élevé** ne garantit pas l’absence de bug, mais aide à **détecter les zones non testées** et à **fiabiliser** les changements, vérifier dans les build jenkins.

## Développement from scratch

Concevoir et coder une application **à partir de zéro**, sans réutiliser une base existante.  
Implique de **poser l’architecture**, choisir la **stack technique**, définir les **conventions** (naming, tests, CI/CD) et livrer un **MVP** avant les évolutions.  
Avantage : forte **maîtrise du design** et absence de dette héritée ; inconvénient : **temps initial** plus important.

## DOM

Représentation **arborescente** d’une page web où chaque balise HTML est un **nœud** manipulable.  
Permet, via Typescript, de **lire/modifier** le contenu, les attributs et les styles, ou d’écouter des **événements** (click, input…).

## DTO

Un DTO (Data Transfer Object) est une classe qui sert à transférer des données entre différentes couches de l’application (par exemple entre le backend et le frontend) tout en **filtrant et organisant** les champs utiles.

## Effet de bord

Conséquence **non directement attendue** d’une opération, qui produit un **impact collatéral**.  
Les effets de bord compliquent les tests et le débogage, au début du développement il est donc impératif de bien savoir ce qu'on va modifié pas dans notre scope à nous mais sur l'ensemble du logiciel.

## Fork

Copie **indépendante** d’un dépôt Git sur notre espace, permettant d’**expérimenter** ou de **contribuer** sans impacter le dépôt original.  
Par hbaitude : *fork* → travailler sur une branche → **pull request** vers le dépôt source. 

## Front-end

Partie visible par l’utilisateur, appelé aussi côté client.

## Front Office

Partie **orientée utilisateur** d’une application.  .  
À l’inverse du **Back Office**, le front office expose des **fonctions opérationnelles** plutôt que d’administration.

## FullStack

Profil ou approche capable de développer **le front-end et le back-end** d’une application.  
Couvre typiquement : **UI** (Angular/TypeScript), **Rest** (Java/Spring), **base de données** (SQL), **CI/CD** et notions d’**hébergement**.  
Objectif : livrer des **fonctionnalités de bout en bout**, du composant front jusqu’à la persistance en base de données.

## Hibernate

Framework **Java** de mapping objet-relationnel (**ORM**) qui permet de manipuler les données d’une base SQL sous forme d’objets Java.  
Il automatise la traduction entre les classes Java et les tables de base de données.

## HTTP

Sigle de **HyperText Transfer Protocol** : protocole de communication utilisé sur le web pour échanger des données entre un client (navigateur, application) et un serveur.  
Il définit comment sont formatées les requêtes (GET, POST, etc.) et les réponses (codes 200, 404, etc.).

## Map

En Java, une **Map** est une structure de données qui associe une **clé** à une **valeur**.  
Chaque clé est unique et permet de retrouver rapidement la valeur correspondante.

## Microservice

Architecture logicielle où une application est découpée en **petits services indépendants**, chacun ayant une responsabilité spécifique.  
Ces services communiquent entre eux via des API.

## Projection

Dans un contexte de développement, une **projection** désigne une vue ou un format spécifique des données, on récupère unqiuement certains champs d'une entité depuis la base de données pour des raisons de performances. 

## Pull Request

Demande faite sur une plateforme de gestion de code (chez nous BitBucket) pour proposer des modifications.  
Elle permet aux autres développeurs de **relire, commenter et valider** le code avant qu’il ne soit intégré à la branche principale.

## REST

REST (*Representational State Transfer*) est un style d’architecture pour créer des API.  
Il repose sur des requêtes HTTP pour accéder ou modifier des ressources identifiées par des URL.  
Chaque ressource est généralement représentée en JSON ou XML.

## Route

En développement web, une **route** est l’association d’une **URL** et d’un **comportement** à exécuter.  
Elle détermine quelle fonction ou quel contrôleur doit être appelé quand un utilisateur accède à une adresse donnée.  
Exemple : `/utilisateurs/123` → affiche les informations de l’utilisateur ayant l’ID 123.

## Service

Un **service** est un composant qui contient de la **logique réutilisable** et qui peut être utilisé par d’autres parties de l’application.  
En Angular ou dans un backend Java, un service peut contenir des appels API, de la logique métier ou des fonctions utilitaires partagées.

## Template

Un **template** est un **modèle de présentation** qui définit une structure dans laquelle les données seront insérées.  
Il sert de “moule” pour l’affichage dynamique : le contenu change, mais la structure reste la même.

## Versioning

Le **versioning** est la gestion des différentes versions d’un code ou d’un document.

## Vue

**Vue.js** (ou simplement *Vue*) est un framework JavaScript progressif pour créer des interfaces utilisateur.  
Il permet de lier facilement données et affichage (data-binding) et de créer des composants réutilisables pour structurer l’application.

## Web-service

Une **vue** est la partie visible d’une application ou d’un site web, c’est-à-dire l’interface que l’utilisateur voit et avec laquelle il interagit.

## Wireframe

Un **wireframe** est une maquette fonctionnelle et simplifiée d’une interface utilisateur.  
Il sert à planifier l’emplacement des éléments (boutons, menus, tableaux…) avant de passer au design graphique complet.
