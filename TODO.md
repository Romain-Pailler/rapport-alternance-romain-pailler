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

- ajouter screenshot ML-14952
- ajouter code dans ML-14952
- ajouter code dans ML-14747
-ajouter code + code source dans les annexes pour le ML-14950
- présenter ce qu'est ML-ui
- présenter ce qu'est ML-Rest-Api
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


presentation à rajouter de ml-ui 

Le module Monalisa UI est un module Angular qui a pour but de regrouper les composants communs entre le back et le front afin d'uniformiser les deux applications.

Aperçu
Pour obtenir un aperçu de storybook, aller sur http://172.20.4.11/storybook/ (inaccessible sur le vpn) OU aller sur https://agora.groupe.pharmagest.com/jenkins/job/monalisa/job/monalisa-ui/ puis :

Choisir la branche ou le tag (version) qui nous intéresse :

Dans le menu à gauche cliquer sur "storybook" :

Enjoy

Installation
Forker puis récupérer le dépôt sur Bitbucket à l'adresse suivante : https://agora.groupe.pharmagest.com/bitbucket/projects/ML/repos/monalisa-ui/browse

Une fois le dépôt récupéré, ouvrir IntelliJ et l'ajouter dans les modules : Clic droit sur un des modules déjà présent puis 'Open module settings'. Dans la fenêtre qui s'affiche, appuyer sur le + pour ajouter un nouveau module et choir 'New module' > 'Static Web'. Ensuite sélectionner le dossier monalisa-ui puis Finish.

Architecture du module
Le projet monalisa-ui est un projet Angular (version 8) composé de deux sous-projets : un projet ml-lib et un projet ml-test. Le premier contient toute la bibliothèque de composants et permet de générer la librairie @leasa/ui qui pourra être injectée dans le back ou le front. Le sous-projet "ml-test", quant à lui, permet de tester rapidement les composants lors du développement des composants de la partie librairie, il permet d'utiliser les composants pour se rendre compte du visuel et du comportement.

Configuration du projet
Structure du projet



Le fichier angular.json situé à la racine du projet permet la configuration des deux sous-projets, avec une config "projects" pour chacun.



Le projet "ml-lib" est de type library, ce qui lui permet de bénéficier de la configuration minimale pour permettre la création d'un package npm injectable dans d'autres projets Angular. Trois commandes sont configurées pour ce projet : build, test et lint.

Le projet "ml-test" est de type application, ce qui va permettre de servir l'application de test et de visualiser les composants développés dans la librairie. Deux commandes sont disponibles : build et serve.

















Tous les fichiers placés à la racine du module permettent la configuration commune des deux sous-projets (package.json, tsconfig.json, tslint.json ...). Le fichier package.json situé à la racine permet de spécifier les dépendances des deux sous-projets et contient scripts suivants :

start : permet de servir le projet ml-test
serve : équivalent au 'npm start'
build : permet de builder la librairie
build:prod : permet de builder la libraire en mode production (à utiliser pour générer la libraire en vue de sa publication)
test : lance les tests unitaires de la librairie
test:coverage : lance les tests unitaires avec couverture de code
docs:json : permet de générer la documentation de la librairie grâce à compodoc
storybook : permet de servir le projet storybook (projet vitrine de la librairie)
build:storybook : permet de générer le dossier storybook-static qui permet ensuite de consulter la vitrine
Architecture du sous-projet ml-lib
Le projet "ml-lib" est un projet Angular particulier qui permet de générer une librairie Angular injectable dans d'autres projets (projectType: library dans le fichier angular.json). Il contient donc des fichiers spécifiques permettant de définir la librairie :

ng-package.json : Fichier qui permet à l'outil ng-packagr de générer la librairie à partir du fichier d'entrée spécifié (ici, il s'agit de src/public-api.ts)
package.json : définit le nom de la librairie, le dépôt dans lequel la librairie doit être publiée lorsque la commande 'npm publish' est utilisée, les dépendances nécessaires à la librairie et sa version.
src/public-api.ts : le fichier permettant de définir les éléments publiques de la librairie et donc accessibles lorsque la librairie est injectée dans un autre projet Angular






Le fichier src/ajs.public-api.ts contient un fichier contenant du code AngularJS. Il définit un module AngularJS nommé mlUIDowngradeModule qui contient tous les composants Angular de la librairie que l'on veut downgrader. Cela permettra de les utiliser dans du code AngularJS, côté back ou front dans le cadre d'une application hybride (voir page Migration AngularJS vers Angular). Il faudra donc ajouter manuellement tous les composants que l'on souhaite utiliser dans du code AngularJS dans ce fichier, et également penser à ajouter la version Angular dans les 'entryComponents' du module Angular principal (dans le fichier monalisa-ui.module.ts). Le contenu du fichier src/ajs.public-api.ts est importé dans le fichier src/public-api.ts afin de rendre public le module AngularJS. Ce module AngularJS pourra alors servir de dépendances dans le module AngularJS d'une application hybride Angular/AngularJS.

Le projet ml-lib contient également les fichiers nécessaires à l'écriture des tests unitaires. Chaque composant devra donc s'accompagner de son fichier de spec permettant le test du composant.











Note : Le projet ml-lib étant une librairie, il n'y a pas de fichier index.html, on ne peut pas servir le projet. Le module peut seulement être injecté dans un autre projet Angular. D'où l'utilité du projet ml-test.
Architecture du sous-projet ml-test
Le but du sous-projet est simplement de tester l'injection du package de la librairie @leasa/ui et le comportement des composants développés plus rapidement. Il s'agit d'un projet de type "application" classique comportant un fichier index.html. La configuration permettant l'injection du module commun est déjà géré.

Pour tester un composant, il suffit d'ajouter l'élément via son sélecteur dans le fichier ml-test/src/app.component.html (un exemple y est présent) et de paramétrer les données nécessaires dans le fichier ml-test/src/app.component.ts. Cela permet de se rendre compte directement du visuel et de vérifier rapidement que le composant fonctionne correctement.

Intégration du module dans un projet Angular
Génération et publication de la librairie
Pour générer le package npm de la librairie, il faut :

mettre à jour la version du package dans projects/ml-lib/package.json
builder le projet ml-lib grâce au script de build présent dans le fichier package.json : 'npm run build:prod'. Cette commande génère le dossier 'dist/monalisa-ui'
lancer la commande 'npm publish dist/monalisa-ui'. Cette commande va publier la librairie sur artifactory (seulement si la version a été mise à jour).
Dans les faits, seule l'étape de mise à jour de la version du package sera nécessaire lorsque l'on souhaitera publier une nouvelle version de la librairie (le reste étant fait grâce à Jenkins).

Le module npm généré et publié peut être retrouvé sur artifactory à l'adresse suivante (il faut être connecté pour y avoir accès) : https://artifactory.groupe.pharmagest.com/webapp/#/packages/npm/%2540leasa~2Fui/?state=eyJxdWVyeSI6eyJucG1OYW1lIjoiQGxlYXNhIn19

Intégration de la librairie dans un projet Angular
Pour intégrer la librairie dans un projet Angular, le projet doit :

être configuré pour rechercher les dépendances dans artifactory
avoir la même version d'Angular


Une fois ces vérifications faites, ajouter la librairie dans les dépendances du projet à l'aide de la commande 'npm install @leasa/ui'. Cela ajoutera la dépendance dans le fichier package.json, comme suit :





Importer le module dans les dépendances du projet (dans les imports du NgModule principal) :



Les composants Angular de la librairie peuvent alors être utilisé dans le code Angular de l'application.



Limitations :

Le fait d'intégrer la librairie de cette manière permet de récupérer la dernière version du package publié sur Artifactory. Cependant, lors du développement, il sera nécessaire d'avoir les modifications au fil du développement (en local) du package. Pour cela, la commande link de npm peut être utilisée. Elle permet de gérer une dépendance à un package local. Celui-ci sera mis à jour chaque fois que la source sera mise à jour également.



Dans la configuration de build (dans le fichier angular.json), ajouter une option permettant de préserver les liens, comme suit :





Créer une Run Configuration dans IntelliJ ou modifier la configuration permettant de servir le projet :



Ajouter une étape de build comme suit :



Cela va permettre de créer un lien symbolique vers le dossier monalisa-ui/dist/monalisa-ui du module commun et donc de voir les modifications effectuées (il sera néanmoins nécessaire de faire un npm run build dans le module commun pour mettre à jour le dossier dist/monalisa-ui).

Intégration et utilisation de la librairie dans la partie AngularJS d'un projet hybride
Pour utiliser les composants de la librairie commune dans du code AngularJS (dans une application hybride), il faut injecter la dépendance vers le module AngularJS de la librairie (mlUIDowngradeModule). Sur la branche  feature/ML-8899_Hybridation_Angular-AngularJS, cela a déjà été fait de cette manière :



Ici un module AngularJS a été créé spécialement pour gérer les component downgradé d'Angular vers AngularJS (voir documentation Migration AngularJS vers Angular).

Le module AngularJS de la librairie est importé dans les dépendances d'un module (qui lui même est importé dans le module de l'application). Les composants qui ont été downgradé et rendu public dans le fichier de la librairie (src/ajs.public-api.ts) pourront alors être utilisé dans le code AngularJS.

Pour voir comment les composants Angular downgradé ves AngularJS doivent être utilisés dans du code AngularJS, voir Utiliser des composants Angular dans le code AngularJS.



Ajout de nouveaux composants à la librairie
Pour ajouter un nouveau composant dans la librairie, celui ci peut être généré à l'aide de la cli d'angular dans le dossier projects/ml-lib/src/components.

Générer le composant à l'aide de la commande suivante : ng generate component "mon component"
Tester en live ce composant avant sa publication dans la librairie : on peut utiliser le projet "ml-lib" en utilisant le composant dans AppComponent
Ajouter le composant dans le fichier public-api.ts pour le rendre disponible
Ajouter le aussi dans le fichier ajs.public-api.ts pour le rendre utilisable dans du code AngularJS.
Lancer le script 'npm run build' pour mettre à jour le dossier dist et pouvoir utiliser le composant côté back ou front


Visualisation des composants : Storybook
La librairie commune permet également d'établir une bibliothèque visuelle de nos composants grâce à l'outil Storybook : https://storybook.js.org/docs/basics/introduction/





Fonctionnement
Storybook fonctionne avec un socle basique qui permet de visualiser et de tester les composants indépendamment d'une application. On peut ensuite ajouter des addons permettant d'obtenir des fonctionnalités supplémentaires. Certains sont développés par Storybook et d'autres par la communauté.

L'outil se présente sous la forme d'un site web sur lequel on peut accéder à une bibliothèque de composants référencés. Pour qu'un composant soit référencé, celui ci doit être décrit dans un fichier à l'aide de Story (extension .stories.ts). Ce fichier va permettre de décrire le composant. A cela peut s'ajouter une documentation qui peut facilement être générée grâce à l'outil compodoc (https://compodoc.app/).

Pour chaque composant décrit, on pourra obtenir un visuel dans un onglet nommé "Canvas". Cet onglet pourra s'enrichir d'un panel de sous-onglets en fonction des addons ajoutés au Storybook (exemple : addons permettant de modifier les paramètres des composants, de voir le code source etc..). D'autres onglets peuvent également enrichir la description d'un composant à l'aide d'addons.

Note : Certains addons permettent donc d'obtenir plus de fonctionnalités sur la partie Canvas (visualisation) alors que d'autres permettent d'ajouter des onglets supplémentaires, autre que visuel (documentation par exemple).



Cet outil permet aussi de générer une version statique du site qui peut ensuite être déployée sur un serveur HTTP.

Configuration du projet
Toute la configuration de la partie Storybook se fait dans le dossier .storybook présent à la racine du projet monalisa-ui. Dans ce dossier, on va retrouver des fichiers permettant de configurer l'endroit où chercher les fichiers de description (.stories.ts), le fichier généré par l'outil compodoc, les addons à utiliser etc.



Voici les fichiers principaux que contient ce dossier :

main.js : il s'agit du fichier de configuration principal. Il permet notamment de spécifier où seront stockés les fichiers de stories et de référencer les addons à utiliser
preview.ts : permet de configurer de façon globale les décorateurs et les paramètres des stories qui permettent de configurer les addons ou la manière de décrire les composants (voir doc pour plus d'informations : https://storybook.js.org/docs/basics/writing-stories/#parameters )
Un dossier utils a été ajouté à ce dossier. Il contient notamment un script (add-optionnal.compodoc.js) qui va mettre à jour la documentation générée via compodoc (en effet, un bug dans celle-ci ne marque pas correctement les Inputs/Outputs comme optionnel lorsque le ? est utilisé dans la classe). Pour générer la documentation (fichier json décrivant la librairie), l'outil compodoc est utilisé et un script est présent dans le fichier package.json pour lancer la commande. Cette commande est lancée automatiquement lors du lancement du storybook, permettant d'avoir une documentation à jour.



Addons déjà ajoutés :

Actions : Permet de réagir à des évènements et d'ajouter des logs (exemple : ajouter un message dans la console au click sur un bouton)
Docs : permet d'avoir un onglet Docs qui reprend les informations sorties avec compodoc
Knobs : permet de modifier les inputs des composants directement depuis l'interface
Links : permet de créer des liens entre les stories pour créer une navigation (pas utilisé)
Notes : ajoute un onglet Notes dans lequel on peut ajouter des informations sur le composant que l'on décrit (pas utilisé)
Storysource : ajoute un onglet permettant de visualiser le code source de la story que l'on consulte
Viewport : permet de créer différentes tailles d'écran permettant ainsi de visualiser le côté responsive du composant
Backgrounds : permet de modifier la couleur de fond de la partie canvas


Les fichiers permettant de décrire les composants (.stories.ts) seront placés directement à côté du composant décrit. Par exemple, pour un composant on aura la structure suivante dans la librairie :





Lancer le Storybook
Pour lancer le storybook, un script a été ajouté dans le fichier package.json. Pour le lancer, il suffit donc de lancer la commande suivante :

npm run storybook
Cette commande va lancer un autre script npm permettant de générer la doc avec compodoc, puis va ouvrir le storybook dans le navigateur.



Une configuration peut être ajouté à IntelliJ :





Générer le dossier statique du Storybook
Pour générer le dossier static du Storybook, lancer le script npm suivant :

npm run build:storybook
Ce script va permettre de créer un dossier storybook-static dans lequel se trouve la version statique (à déployer sur un serveur HTTP).

Définition des fichiers de description : Stories
Documentation officielle : https://storybook.js.org/docs/basics/writing-stories/

Un fichier de stories va permettre de décrire le composant. Dans ce fichier on retrouvera une ou plusieurs stories permettant de décrire différents comportements pour un composant. Le mot "Story" est le nom utilisé pour désigner la brique qui permet de documenter un composant.

Ajout d'une entrée dans la bibliothèque
Pour ajouter un élément à la liste des composants (sur la la partie navigation du Storybook), chaque fichier de stories décrivant un composant doit contenir un export nommé 'default'. Celui-ci va permettre de définir le nom du composant, de charger les dépendances Angular du composant, de configurer les addons pour les stories du composant etc.



Voici un exemple :



Côté code, on définit l'export default





Côté Storybook, l'arborescence suivante est générée :





Ici on définit :

un titre (Si le titre contient un / cela va créer une arborescence) : il s'agit en général du nom du composant + un préfixe définissant le chemin dans l'arborescence que l'on souhaite définir
le component que l'on va décrire dans ce fichier
les décorateurs (ici Knobs) et des métadatas sur le module Angular afin que le component décrit ait accès à ses dépendances
les paramètres des addons
La configuration des addons est spécifique à chacun et peut parfois nécessiter l'ajout du décorateur.

Ajout d'une story
Une fois cet export réalisé, il faut passer à la définition de story. Chaque story va consister en un export qui va s'ajouter dans l'arborescence :







Ici on a ajouté une story nommée Default. Elle s'est rajoutée sous l'arborescence 'Buttons/ActivableList' que l'on avait défini précédemment dans ce même fichier.

Une story doit être une fonction qui retourne un objet contenant :

component : le component doit de nouveau être ajouté (limitation actuelle avec Angular qui oblige à le répéter)
template : un template dans lequel on va utiliser le component (une ou plusieurs fois, avec éventuellement d'autres éléments pour structurer l'affichage)
props : la liste des propriétés que l'on veut ensuite utiliser dans la partie template
Le nom de la variable utilisée pour l'export va permettre de définir le nom de la story.

On peut ensuite ajouter des informations supplémentaires à la story grâce à la syntaxe Default.story :

parameters : paramétrage de certains addons pour la story en question (voir doc addon)
name : le nom de la story si on le souhaite différent du nom de la variable utilisé pour l'export


Note : dans cet exemple, on voit que les données utilisées dans les props proviennent de variable définies ailleurs dans le fichier, cela permet d'utiliser les mêmes données pour plusieurs Story par exemple.



Exemple d'une autre story :







Il est possible de rajouter autant de story que l'on souhaite pour un composant, avec pour chacune des configurations différentes.



Pour chaque fichier de stories, un onglet Docs est accessible. Cet onglet va reprendre la documentation sortie à l'aide de compodoc. Cette documentation se présente de la manière suivante :

une section qui affiche le visuel de la première Story définie dans le fichier (ici Default)
une section qui présente les Inputs, Outputs et les méthodes de la classe du composant
une section Stories reprenant visuellement le reste des stories ajoutées au fichier


Utilisation de l'addon Actions
L'addon action va permettre d'ajouter des logs dans la console du panneau Actions lorsqu'un évènement surgit, par exemple au clic sur un bouton.



Par exemple sur la story Default, on a ajouté une action au click sur un bouton de la façon suivante :



Côté code,

on définit une action lorsque la méthode onClickElement.

Elle sera appelée à l'aide la méthode "action('nom de l'action')" :



Côté Storybook,

lorsque l'on va cliquer sur un bouton, cela va donner la sortie suivante :





Voir https://github.com/storybookjs/storybook/tree/master/addons/actions

Utilisation de l'addon Knobs
Cet addon permet de modifier directement les variables définies dans l'objet props. Pour cela, cet addon va permettre de créer des variables Knobs de différents types (chaines de caractères, booléen etc..) qu'on va ensuite retrouver dans le panneau dédié à Knobs. On va alors pouvoir modifier la valeur de la variable et visualiser les répercussions directement dans la partie Canvas.



L'interface de cette addon se présente de cette manière :



Côté code source de la story :





On voit dans cet exemple que l'on a définit des variables de plusieurs types :

deux chaines de caractères à l'aide de la méthode text(nomVariable, valeur)
deux booléens à l'aide de la méthode boolean(nomVariable, valeur)
Côté Storybook, on va retrouver cette information de cette manière :





On va alors pouvoir modifier les valeurs des variables comme on le souhaite depuis l'interface



Voir https://github.com/storybookjs/storybook/tree/master/addons/knobs



Utilisation de l'addon Storysource
Cet addon permet d'avoir accès au code source de la story. Cela peut être utile pour savoir comment celle-ci a été construite, pour voir les paramètres utilisés, etc.

La story actuellement consultée s'affiche en surbrillance dans le code source du panneau Story.



Exemple :





Voir https://github.com/storybookjs/storybook/tree/master/addons/storysource

Utilisation de l'addon Viewport
Cet addon permet de définir plusieurs tailles de canvas qui pourront être utilisées. Ces tailles sont définies dans le fichier de configuration preview.ts









Voir https://github.com/storybookjs/storybook/tree/master/addons/viewport

Utilisation de l'addon Backgrounds
Il permet de définir plusieurs couleurs de fond qui pourront être utilisées dans le Canvas. Cela peut permettre de voir le rendu sur différents fonds. Les couleurs disponibles sont actuellement définies dans le fichier preview.ts









Voir https://github.com/storybookjs/storybook/tree/master/addons/backgrounds

Reste à faire
Voici la liste des choses qu'il reste à mettre en place pour pouvoir intégrer définitivement la librairie au front et au back :

Gestion des traductions
Ajout automatique des composants dans le fichier public-api.ts
Migration des anciens components dans le module commun (réécriture en Angular avec limitation des dépendances)
Présentation Webex (départ Candice)