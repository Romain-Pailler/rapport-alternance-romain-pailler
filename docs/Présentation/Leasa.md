---
sidebar_label: Leasa
sidebar_position: "4"
---

# Présentation technique du projet

## Contexte du projet

Leasa est une application web et mobile développée pour faciliter la mise en place de financements auprès des clients d'**Equasens** ou d'autres entreprises partenaires. Elle vise à simplifier et digitaliser le dépôt, le traitement et le suivi des demandes de financement.

## Type de service et contexte métier

Leasa s’inscrit dans un contexte métier lié aux services de financement, principalement dans le domaine de la santé. Elle est utilisée par :

- **Les commerciaux**, pour déposer des demandes de financement,
- **Les administrateurs des ventes**, pour la gestion de ces demandes,
- **Les clients finaux**, via une interface mobile simplifiée.

L'application est composée de **trois interfaces distinctes** :

- **Le front office** (application web) : utilisé principalement par les commerciaux pour le dépôt des demandes de financement.
- **Le back office** (application web) : réservé aux administrateurs des ventes pour la gestion des dossiers.
- **L'application mobile** (iOS et Android) : reprend la logique du front office dans une version simplifiée.

## Accéder à l'application

- **Front office** :  
  - [leasa.nanceo.fr](https://leasa.nanceo.fr)  

- **Back office** :  
  - [leasa.nanceo.fr/back](https://leasa.nanceo.fr/back)

- **Application mobile** :  
  - [Android (Play Store)](https://play.google.com/store/apps/details?id=com.nanceo.leasa)  
  - [iOS (App Store)](https://itunes.apple.com/fr/app/leasa-by-nanceo/id1192222008)

## Existant et contraintes

L’application a été développée **from scratch** (à partir de zéro), sans reprise d’un existant technique.


## Architecture générale 

![alt text](architecture_leasa.png)

Les commerciaux saisissent des demandes de financement décrivant l'objet du financement (matériel, quantité, montant, durée du financement, périodicité...), la demande est alors envoyée via web-service aux organismes financiers susceptibles de financer la demande.

En fonction de la réponse des organismes (toujours via web-service et de manière automatique), le dossier est constitué et finalisé (écritures comptables, récupération des factures d'achat, génération de la facture de vente...).
