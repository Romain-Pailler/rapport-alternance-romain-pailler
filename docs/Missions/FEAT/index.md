---
sidebar_label: Une Feature ?
sidebar_position: "1"
tags: 
    - Feature
---

# Déroulement d’une nouvelle fonctionnalité

La mise en place d’une nouvelle fonctionnalité suit un processus itératif, structuré autour des **sprints** définis par l’équipe.

1. **Rédaction du ticket**  
   Tout débute par la rédaction d’un ticket par **Charlotte**, analyste fonctionnelle.  
Le contenu de ce ticket est déterminé à l’issue de **réunions** réunissant les **utilisateurs**, l’analyste fonctionnelle et le **Product Owner (PO)**. Ces échanges permettent de définir précisément les besoins métier des commerciaux, exprimés sous forme de règles, de cas d’usage et parfois accompagnés de maquettes.  
Le ticket est ensuite placé dans le **bac de sprint**, en attente d’être planifié.

2. **Prise en charge par un développeur**  
   Lors de la réunion de planification de sprint, les tickets sont répartis entre les développeurs. Celui ou celle chargé(e) d’un ticket commence par en analyser le contenu pour :

   * Comprendre le besoin exprimé,  
   * Identifier les impacts sur les entités métier et les couches techniques (REST, services, base de données),  
   * Lister les fichiers susceptibles d’être modifiés ou créés.

3. **Développement technique**  
   La phase de développement consiste à implémenter la solution répondant au besoin. Au besoin, il peut échanger avec Charlotte ou bien avec d'autres développeurs à ce sujet. Le **daily meeting** est fait pour exprimer les difficultés rencontrées afin de faciliter l'apport d'aide d'autres collègues.

4. **Tests et validation**  
   Une fois le code produit :

   * Des **tests unitaires** ou d’**intégration** sont ajoutés,  
   * Une **pull request** est créée,  
   * Une validation des pairs est nécessaire  
   * Un build Jenkins se lance et vérifie plusieurs choses (le build, les tests, le coverage des tests, l'indentation, la traduction, etc...),  
   * La personne chargée des **releases** intègre la nouvelle fonctionnalité dans une version,
   * Puis le ticket est envoyé à Julien, analyste testeur, qui valide la fonctionnalité sur l’environnement de test (souvent en béta).

## Un exemple de build Jenkins

![Build Jenkins](./../../../static/img/feature/build_jenkins.png)

---
