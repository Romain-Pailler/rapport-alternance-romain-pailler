# A faire

# Consignes pour le rapport de stage d'alternance

- Présentation de l'entreprise et, surtout, du service de stage et de ses travaux.

- Expliquer le résultat à atteindre et la problématique, afin d'introduire les besoins et le travail effectif
- Cahier des charges & veille technologique si une veille a été réalisée
- Décrire l'existant et les travaux éventuels passés.

- Choix des technologies retenues et leurs origines, expliquer pourquoi un choix de techno plutôt qu'un autre avec un regard critique et synthétique (tableau de synthèse, tableau comparatif, etc.). Ne pas hésiter à comparer les mérites et désavantages par rapport à d'autres, en particulier ce qui a été vu en formation
- Outils méthodologiques (Trello ?, etc.)

- Schéma client(s) / serveur(s) / serveur(s) BD indiquer où les technologies employées le sont, pourquoi et quels sont les protocoles et formats d'échanges et de transferts.
- Définir les différents acteurs utilisant le travail, et quoi s'applique à qui
Bien indiquer ce qui sort de la formation.
Évolution % cahier des charges
- Objectifs réalisés
- Suite du travail/projet
- Intégrer un film de démonstration qui sera commenté pendant la soutenance.

https://alternance-hugo-jahnke.netlify.app/presentation.html#fonctionnement

https://rapport-alternance-romain-pailler.netlify.app/docs/Missions/FEAT/TemplateLettreBienvenue
(à voir avec clément) ??
https://weier-loris-rapport-alternance.netlify.app/


- ajouter code dans ML-14952
- ajouter code dans ML-14747
-ajouter code + code source dans les annexes pour le ML-14950
- présenter ce qu'est ML-Rest-Api besoin peut-être de voir ça avec toto
- mettre code source de ML-14620 dans les annexes
-[] faire vocab technique
-[] faire vocab métier
-[] ajouter code source dans les annexes
-[] relire les explications / ajouter les screens des tickets ??
-[] faire ajoutNbRésultats et calcul montants totaux vente et achat reste le backend
- expliquer le bug créer et comment je l'ai corriger 
- ajouter des liens dans chaque partie afin de rediriger vers le code source
- mettre beaucoup de contexte et réécrire beaucoup de tickets importants (premier filtre, résultats (ajouter l'image du skateboard), modif du dto pour l'ajout et calcul de montants totaux)

## expose

- faire schema utilisateur, besoins, cahier des charges
- schéma architecture 

ajouter tests dans partie cote serveur du premier ticket de la recherche de demande.

- modifier prés nanceo (détaillé) et ajouter healthlease 
- ajoute schéma des entités de la coopérative welcoop
- ajoute schéma des entités de equasens


nanceo : 
Nanceo
Les activités de la division Fintech de Pharmagest sont regroupées dans la filiale Nanceo. A l'origine, celle-ci a été créée afin de répondre au besoin de faire financer la location de matériel aux clients de Pharmagest.

Membre de l’association France FinTech, Nanceo met en place des solutions de location de biens pour des entreprises du secteur tertiaire. Elle a lancé l’application Leasa qui permet de faciliter et d'accélérer le process de demande de financement. La partie technique de l’application est assurée par l’équipe R&D Fintech de Pharmagest.

Pharmagest commercialise également son application Leasa sous marque blanche (d’autres entreprises achètent le logiciel pour leurs propres besoins et y applique leurs chartes graphiques).

Tiers



Apporteur

L'apporteur est un fournisseur de matériel. Il peut aussi être appelé Entité ou Partenaire.
Bailleur	Le bailleur représente une banque. C'est le bailleur qui donnera un accord de financement pour la demande.
Client	Le client est le tiers qui cherche à louer un matériel chez l'apporteur.
Loueur	
Le loueur est le tiers intermédiaire entre l'apporteur et le bailleur.
(ex : Nanceo, Healthlease, etc.)

Partenaires commerciales 	Aussi appelé Groupe d'apporteurs, c'est un ensemble d'apporteurs.
(ex : Xéroboutique est un partenaire commercial composé de Xéro SUD, Xéro Nord, Xéro OUEST, etc)
Rôle


Commercial apporteur	C'est le commercial chez l'apporteur. Il va déposer la demande de financement via le front office et suivre son évolution
(ex: ce sont les commerciaux qui travaillent chez Xéro).
Commercial back office (= Inside Sales)	Un Inside Sales est un commercial dit sédentaire, c'est lui qui gère le portefeuille des commerciaux terrain (Commercial loueur).
Il intervient dès qu'un accord est donné par un bailleur sur une demande.
Commercial loueur	C'est le commercial qui trouve le business
(ex : ce sont les commerciaux de terrains qui travaillent chez Nanceo)
Gestionnaire back office (=Chargé de portefeuille)	Le gestionnaire a pour rôle de mettre en place les contrats
Demande de financement	Accord	Accord de financement
Comptabilité/Trésorerie



CRE	Compte Rendu d'Evènements
Date écriture	= Date comptabilisation = MOV2_DATE_MOV (dans Pontprod) : Il s'agit de la date à laquelle la pièce sera enregistrée en comptabilité
Date enregistrement	= date à laquelle on saisie la facture... LP : je ne suis pas certain que cette date soit utile.
FAE	Facture à établir
Montant facturé au loueur	Il s'agit de la somme des factures et avoirs et extournes de sens ACHAT et de type ACQUISITION.
