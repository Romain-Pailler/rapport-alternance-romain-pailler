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

**Monalisa-Compta** est un microservice chargé d’assurer l’interface entre l’application **Leasa** et le système d’information comptable de l'entreprise **Sage**. Son rôle principal est d'interpréter des **CRE** (Comptes Rendus d’Événements) métiers en **écritures comptables** exploitables par ce système tier, en respectant les règles de gestion propres à chacun.

## Fonctionnement

1. **Transmission des CRE**  
   Leasa génère un CRE à partir d’une facture ou d’un événement métier, et l’envoie au microservice Monalisa-Compta.  
   Ces CRE sont définis selon un schéma OpenAPI standardisé.

2. **Paramétrage comptable**  
   Le microservice s’appuie sur un ensemble de règles configurables pour interpréter les CRE. Chaque règle tient compte :
   - du **code du CRE**,
   - du **code du montant à évaluer**,
   - des **règles spécifiques de comptabilisation** (Type, Sens Achat ou Vente).

   Le résultat est une ou plusieurs **lignes d’écritures comptables** (HT, TTC, TVA), générées dynamiquement au format compréhensible vers Sage.

3. **Généricité et extension**  
   Le système est conçu pour mutualiser l’implémentation entre différents microservices comptables. Une **couche générique** de transformation est utilisée afin d'adapter les écritures au SI cible (Sage).

## Exemple de processus

- Un CRE est généré côté Leasa lors d'une comptabilisation d’une facture.
- Il est envoyé à Monalisa-Compta.
- En fonction du paramétrage, plusieurs lignes d’écriture sont générées.
- Ces écritures sont ensuite transmises vers **Sage**.

## Conclusion

Ce microservice constitue une brique essentielle pour le traitement automatisé et normé des opérations comptables entre Leasa et l'application comptable du groupe. Son architecture permet une grande souplesse et une interopérabilité avec des systèmes tiers divers.

---
