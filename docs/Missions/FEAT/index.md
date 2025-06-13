---
sidebar_label: Une Feature ?
sidebar_position: "1"
tags: 
    - Feature
---

# Déroulement d’une nouvelle fonctionnalité

La mise en place d’une nouvelle fonctionnalité suit un processus itératif, structuré autour des **sprints** définis par l’équipe.

1. **Rédaction du ticket**  
   Tout commence par la rédaction d’un ticket par Charlotte, analyste fonctionnelle. Ce ticket contient les besoins métiers des commerciaux exprimés sous forme de règles, de cas d’usage et parfois de maquettes. Il est ensuite versé dans le **bac de sprint**, en attente d’être pris en charge.

2. **Prise en charge par un développeur**  
   Lors de la réunion de planification de sprint, les tickets sont répartis entre les développeurs. Celui ou celle chargé(e) d’un ticket commence par en analyser le contenu pour :

   * Comprendre le besoin exprimé,  
   * Identifier les impacts sur les entités métier et les couches techniques (REST, services, base de données),  
   * Lister les fichiers susceptibles d’être modifiés ou créés.

3. **Développement technique**  
   Dans cette partie, le développeur doit résoudre le ticket et s'assurer que tout fonctionne. Au besoin, il peut échanger avec Charlotte ou bien avec d'autres développeurs à ce sujet. Le **daily meeting** est fait pour exprimer une aide pour éviter que le développeur perde trop de temps dans son développement.

4. **Tests et validation**  
   Une fois le code produit :

   * Des **tests unitaires** ou d’**intégration** sont ajoutés,  
   * Une **pull request** est créée,  
   * Une validation des pairs est nécessaire  
   * Un build Jenkins se lance et vérifie plusieurs choses (le build, les tests, le coverage des tests, bien indenté, bien traduit, etc...),  
   * Puis la branche est mergée sur la branche `develop` où la personne chargée de faire des **releases** mettra en place des nouvelles versions avec le développement dedans,  
   * Puis le ticket est envoyé à Julien, analyste testeur, qui valide la fonctionnalité sur l’environnement de test.
