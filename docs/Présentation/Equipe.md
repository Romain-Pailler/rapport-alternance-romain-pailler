---
id: Equipe
title: L'équipe projet
sidebar_label: L'équipe
sidebar_position: 4
---

# L'équipe du projet Leasa

```mermaid
graph TD
  W2P["W2P"]
  NICOLASLAFON["Nicolas LAFON<br/>Directeur Fintech"]
  BENOIT["Benoit HERPIN<br/>Product Owner"]
  NICOLAS["Nicolas LANTOINE<br/>UX/UI Designer"]
  JEROME["Jerome TAMBORINI<br/>Team Manager / Architecte"]
  ANTHONY["Anthony TRAUT<br/>Tech Leader"]
  CHARLOTTE["Charlotte DA FONSECA FERNANDES<br/>Analyste Fonctionnel"]
  JULIEN["Julien PAYOT<br/>Analyste Testeur"]

  FREDERIC["Frederic AUBRY<br/>Développeur"]
  ADAM["Adam SOOGA<br/>Développeur"]
  CLEMENT["Clement CHARTON<br/>Développeur"]
  ROMAIN["Romain PAILLER<br/>Alternant"]

  W2P --> BENOIT
  NICOLASLAFON --> JEROME

  JEROME --> CHARLOTTE
  JEROME --> JULIEN
  JEROME --> ANTHONY

  JEROME --> FREDERIC
  JEROME --> ADAM
  JEROME --> CLEMENT

  ADAM --> ROMAIN
