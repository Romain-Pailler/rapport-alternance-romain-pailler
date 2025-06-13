---
sidebar_label: "Mustache"
sidebar_position: 5
tags:
  - Template
  - Java
---

# Présentation de Mustache

Dans le cadre du projet, le moteur de templates **Mustache** est utilisé pour la génération des courriels envoyés aux clients.

Mustache permet de créer des modèles de texte dans lesquels des variables dynamiques sont insérées au moment de l’envoi. Ces variables sont délimitées par des doubles accolades `{{ }}` et sont remplacées par les valeurs correspondantes issues des données métier de l’application.

Par exemple, un modèle peut contenir le texte suivant :

```mustache
Bonjour {{prenom}} {{nom}} !
```

Lors de l’exécution, si le contexte de données est :

```json
{
  "prenom": "Jean",
  "nom": "Dupont"
}
```

Le message généré sera :

```mustache
Bonjour Jean Dupont !
```
