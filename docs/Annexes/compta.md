---
sidebar_label: "Monalisa-Compta"
sidebar_position: 4
tags:
  - Architecture
  - Microservices
  - Comptabilité
---

# Présentation du microservice Monalisa-Compta

## Objectif

**Monalisa-Compta** est un microservice chargé d’assurer l’interface entre l’application **Leasa** et différents systèmes d’information comptables. Son rôle principal est de transformer des **CRE** (Comptes Rendus d’Événements) métiers en **écritures comptables** exploitables par ces systèmes tiers, en respectant les règles de gestion propres à chacun.

## Fonctionnement

1. **Transmission des CRE**  
   Leasa génère un CRE à partir d’une facture ou d’un événement métier, et l’envoie au microservice Monalisa-Compta.  
   Ces CRE sont définis selon un schéma OpenAPI standardisé.

2. **Paramétrage comptable**  
   Le microservice s’appuie sur un ensemble de règles configurables pour interpréter les CRE. Chaque règle tient compte :
   - du **code du CRE**,
   - du **code du montant à évaluer**,
   - des **règles spécifiques de comptabilisation**.

   Le résultat est une ou plusieurs **lignes d’écritures comptables**, générées dynamiquement.

3. **Généricité et extension**  
   Le système est conçu pour mutualiser l’implémentation entre différents microservices comptables. Une **couche générique** de transformation est utilisée, puis des **hooks** permettent d'adapter les écritures au SI cible (comme Sage par exemple).

## Exemple de processus
- Un CRE est généré côté Leasa lors de la validation d’une facture.
- Il est envoyé à Monalisa-Compta.
- En fonction du paramétrage, plusieurs lignes d’écriture sont générées.
- Ces écritures sont ensuite transmises vers le système comptable final.

## Conclusion

Ce microservice constitue une brique essentielle pour le traitement automatisé et normé des opérations comptables entre Leasa et les autres applications financières. Son architecture orientée événement permet une grande souplesse et une interopérabilité avec des systèmes tiers divers.

