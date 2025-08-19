---
sidebar_label: Bug – Impact sur l’ancienne page
sidebar_position: 1
tags:
  - Bug
  - Angular
---

# Bug – Impact de la nouvelle recherche sur l’ancienne page

## Objectif

La nouvelle page de recherche des demandes (développée sous Angular 2+) devait interroger le serveur avec des données optimisées.  
Initialement, elle utilisait la même "projection" (configuration de données) que l’ancienne page.  
Résultat : les modifications apportées à cette projection ont aussi modifié le comportement de l’ancienne page, créant des effets de bord.

---

## Ticket

![Screenshot du ticket](/img/recherche_demande/fix_resultats_vide.png)

---

## Liens vers les explications détaillées

- [Voir le code côté serveur (Java)](./cote_serveur.md)

- [Voir le code côté client (Angular)](./cote_client.md)

---

## Résultat
L’ancienne page conserve son fonctionnement, tandis que la nouvelle page utilise une configuration de données optimisée et indépendante.

---
