---
sidebar_label: "Leasa"
sidebar_position: 4
tags:
  - Présentation
---

# Leasa

## Contexte de développement

**Leasa** est une application web et mobile dédiée à la gestion des demandes de financement de biens, conçue pour répondre aux besoins des partenaires de **Nanceo** et **Healtlease**.

Développée **[from scratch](../glossaire/Vocab.md#développement-from-scratch)**, l’application a été pensée dès l’origine comme une solution modulaire, interconnectée et accessible depuis différents supports (ordinateur, tablette, smartphone), même si aujourd’hui 95 % des développements ciblent les PC.

## Architecture et fonctionnalités

L’application se compose de trois environnements fonctionnels principaux :

- **[Front-Office](../glossaire/Vocab.md#front-office)** : destiné aux commerciaux pour la création et le dépôt des demandes de financement  
- **[Back-Office](../glossaire/Vocab.md#back-office)** : dédié aux administrateurs et gestionnaires pour le suivi et la validation des dossiers  
- **Application mobile** : accessible aux commerciaux pour déposer leurs demandes, les suivres.

**Leasa** centralise toutes les informations relatives aux demandes (identité du client, nature du matériel, modalités de financement) et les transmet automatiquement aux organismes partenaires via un système de [web-services](../glossaire/Vocab.md#web-service).

:::info
Le schéma détaillé de l'architecture technique du backend se trouve [ici](../annexes/Presentation-projets/Architecture).
:::

## Objectifs et bénéfices

L’objectif principal de **Leasa** est de **réduire les délais de traitement** tout en **fiabilisant les échanges** entre les différentes parties prenantes (banques, [apporteurs](../glossaire/Vocab_metier.md#apporteur), [clients](../glossaire/Vocab_metier.md#client), commerciaux).  
En automatisant les étapes du cycle de financement, l’outil permet un gain de temps significatif, notamment lors de la constitution des dossiers et de la validation des accords de financement.

Avec une réponse obtenue dans la majorité des cas en moins de **4 minutes**, **Leasa** s’impose comme un outil performant et structurant pour les équipes commerciales et administratives.

## Schémas

### Schéma fonctionnel

Voici un schéma expliquant le but de Leasa : Comment un apporteur fait financer son matériel au client
![Schéma 1](/img/presentation/pres_nanceo1.png)

![Schéma 2](/img/presentation/pres_nanceo2.png)

![Schéma 3](/img/presentation/pres_nanceo3.png)

### Schéma architecture

![Schéma draw.io](/img/presentation/Schema-architecture-leasa.png)

#### Explications du schéma d'architecture

- **Côté client**  
  L’API consommée par le client est **générée automatiquement par [`rest-api`](../annexes/Presentation-projets/ml_rest_api)**.

- **Côté serveur**  
  L’API côté serveur est **écrite à la main** pour l'instant mais il sera possible à l'avenir de le générer grâce à `rest-api`.

- **Microservice Monalisa Compta**  
  Ce microservice est déployé via **image Docker** et utilise **OpenAPI** pour générer ses propres API. Il partage la même instance de base de données que `monalisa-rest`, mais avec **des bases distinctes**.  

- **Interactions avec les banques**  
  Le système interagit différemment selon les partenaires bancaires :
  - On échange les données au format **JSON** à 95%.  
  - Certaines anciennes banques utilisent encore des échanges **SOAP XML**, nécessitant un traitement particulier. 
  - Certaines banques reçoivent juste un **POST pour une demande**.
  - D'autres encore échangent des données afin de connaître leurs statuts ou autres.  

![Schéma infra](/img/presentation/architecture-infra-leasa.png)

---
