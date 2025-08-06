---
sidebar_label: Lettre de bienvenue
sidebar_position: "3"
tags: 
    - Feature
    - Template
---
# Template de mail pour la lettre de bienvenue

## Contexte

Depuis l’application, il est possible d’envoyer un email de bienvenue après la facturation d’un dossier.
Ce mail repose sur un template [Mustache](./../../Annexes/mustache.md), qui nécessite différentes données comme des dates ou des numéros de contrat. Avant de commencer, j’ai échangé avec Charlotte pour clarifier la structure du template et les données à lui fournir.

## Ticket 

![Screenshot du ticket Jira](/img/feature/ticket/lettre_bienvenue.png)

## Objectif

Mon objectif était d’améliorer l’existant. Le template de mail existait déjà, mais comportait plusieurs fautes d’orthographe et surtout, il manquait certaines données que les commerciaux devaient compléter manuellement.

J’ai donc ajouté automatiquement :

- Le code de la demande
- La raison sociale du client
- Le siren du client
- Les dates du Loyer Intercalaire
- La date de prelevement estimée

## Réalisations

La partie la plus technique a été de gérer l’affichage conditionnel de la date de prélèvement estimée.
En effet, cette date ne devait apparaître que si une seule facture était comptabilisée, et si son type était "loyer facture vente".
Il fallait aussi exclure les factures annulées par un avoir.
Pour répondre à ce besoin, j’ai créé un nouveau processus au sein de l’[architecture REST](./../../Annexes/archi_rest.png)

## Ce que j'ai appris

Ce développement m’a permis de consolider mes compétences sur :

- La gestion conditionnelle de données côté backend
- L’intégration de données métiers dans un template Mustache
- Ma compréhension du fonctionnement métier des demandes dans Leasa, notamment sur la manière dont les données sont liées entre les demandes et les factures

## Le code

### DemandeFactureProcessusImpl.java

Dans cette classe, j’ai ajouté une nouvelle méthode métier `getFacturesFiltreesLoyerSansAvoir` avec pour objectif clair : filtrer les factures d’une demande pour ne conserver **que celles qui sont réellement prises en compte dans le calcul de la date de prélèvement estimée**. 

Concrètement, j’ai commencé par récupérer uniquement les factures **comptabilisées** dans le système comptable [**Monalisa-Compta**](./../../Annexes/compta.md).  
Ensuite, j’ai exclu toutes celles ayant un **avoir** associé, car elles ne doivent pas être considérées dans le calcul.  
Enfin, j’ai appliqué un dernier filtre pour ne garder que les factures dont le sous-type correspond à **LOYER_FACTURE_VENTE**.
Cette méthode est utilisée dans le `MailBuilder` pour alimenter automatiquement le template de la lettre de bienvenue avec la bonne date, uniquement lorsque les conditions sont réunies.


```Java title="IDemandeFactureProcessus.java"
public interface DemandeFactureProcessus {
    /**
     *Filtre les factures d'une demande par sous type LoyerFactureVente qui sont comptabilisées sans avoir reliée à elles
     * @param demande
     * @return
     */
    List<Facture> getFacturesFiltreesLoyerSansAvoir(Demande demande);
}
```

```java title="DemandeFactureProcessusImpl.java"
public List<Facture> getFacturesFiltreesLoyerSansAvoir(final Demande demande) {
    final List<Facture> factures = demande.getFactures().stream()
            .filter(f -> f.getDateComptabilisation() != null)
            .collect(Collectors.toList());

    final List<Facture> facturesLoyerAvoir = factures.stream()
            .filter(f -> LOYER_AVOIR_VENTE.equals(f.getSousTypeFacture().getCode()))
            .collect(Collectors.toList());

    final Set<String> numerosFactureAvoirOrigine = facturesLoyerAvoir.stream()
            .map(Facture::getNumeroFactureOrigine)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    final List<Facture> facturesRestantes = factures.stream()
            .filter(f -> !numerosFactureAvoirOrigine.contains(f.getNumeroFacture()))
            .collect(Collectors.toList());

    return facturesRestantes.stream()
            .filter(f -> LOYER_FACTURE_VENTE.equals(f.getSousTypeFacture().getCode()))
            .collect(Collectors.toList());
}
```

### Le mailBuilder

Pour compléter cette fonctionnalité, j’ai travaillé sur la génération du mail de bienvenue, envoyé au client lors de la mise en place de son contrat.

J’ai implémenté la méthode `getTemplateLettreBienvenue`, qui commence par charger toutes les données nécessaires depuis la demande (`Demande`) via les processus métiers.  Elles sont ensuite stockées dans un contexte sous forme de Map (String, Object) qui sera utilisé par les templates [Mustache](./../../annexes/mustache).

Parmi les données injectées dans le template, on retrouve :  

- Les coordonnées du bailleur, de l’apporteur et du client
- La date de démarrage du contrat  
- Les coordonnées du loueur (téléphone, email)  
- Le code de la demande  

J’utilise ensuite `getFacturesFiltreesLoyerSansAvoir` pour déterminer la date de prélèvement estimée, uniquement si une facture éligible est trouvée.  
Si un loyer intercalaire existe, j’ajoute également les dates de début et de fin de cette période.


Enfin, la signature est configurée selon les règles internes et l’ensemble des données est injecté dans les templates Mustache pour générer le sujet, le corps et la signature du mail, en adaptant le contenu selon la présence ou non d’une date de prélèvement.

``` Java title="MailBuilder.java"
 public Mail getTemplateLettreBienvenue(final Long demandeId) {
        final Demande demande = demandeProcessus.load(demandeId);
        
        Map<String, Object> context = new HashMap<>();
        context.put("bailleur", demande.getAccord().getBailleur());
        context.put("apporteur", demande.getApporteur());
        DateFormat dateFormat = new SimpleDateFormat(DateUtils.DAY_MONTH_YEAR_FORMAT);
        context.put("dateDemarrage", dateFormat.format(demande.getFacturation().getDatePremierLoyer()));
        context.put("codeDemande", demande.getCode());
        context.put("client", demande.getClient());
        context.put("numeroTelephone", demande.getApporteur().getLoueur().getTelephone());
        context.put("mail", adresseEmailProcessus.findByIdLoueurAndType(demande.getApporteur().getLoueur().getCode(), EXPEDITEUR_SERVICE_CLIENT.toString()).getEmail());
        
        final List<Facture> facturesFiltreesLoyerFactureVente = demandeFactureProcessus.getFacturesFiltreesLoyerSansAvoir(demande);
        
        if (facturesFiltreesLoyerFactureVente.size() == 1) {
            facturesFiltreesLoyerFactureVente.stream().findFirst().ifPresent(facture -> context.put("datePrelevement", dateFormat.format(facture.getDatePrelevementEstimee())));
        } else {
            context.put("datePrelevement", "datePrelevement");
        }
        boolean dateExists = demande.getFacturation() != null &&
                demande.getFacturation().getLoyerIntercalaire() != null &&
                demande.getFacturation().getLoyerIntercalaire().getDateDebut() != null && demande.getFacturation().getLoyerIntercalaire().getDateFin() != null;
        ;
        
        context.put("dateDebutPrelevementExists", dateExists);
        if (dateExists) {
            context.put("dateDebutPrelevement", dateFormat.format(demande.getFacturation().getLoyerIntercalaire().getDateDebut()));
            context.put("dateFinPrelevement", dateFormat.format(demande.getFacturation().getLoyerIntercalaire().getDateFin()));
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put(YEAR_PROPERTY, DateTime.now().year().get());
        data.put(SIGNATURE_UTILISATEUR, Boolean.FALSE);
        data.put(SIGNATURE_EQUIPE_LOUEUR, Boolean.TRUE);
        data.put(SIGNATURE_EQUIPE_LEASA, Boolean.FALSE);
        addLoueurProperty(demande.getApporteur().getLoueur(), data);
        return new Mail()
                .setSujet(templateTools.generateFromTemplate("email/lettre-bienvenue/objet.mustache", context))
                .setContenu(templateTools.generateFromTemplate("email/lettre-bienvenue/body.mustache", context))
                .setSignature(templateToolI18nLoueurLocale.generateFromTemplate(EMAIL_FOOTER_TEMPLATE, data, demande.getApporteur().getLoueur()));
    }
```

``` properties
template.mail.lettre_bienvenue.sujet=Redevance de mise \u00E0 disposition - Contrat {{codeDemande}} - {{client.raisonSociale}} - Siren : {{client.premierNumeroIdentification}}
template.mail.lettre_bienvenue.cher_client=Cher client,
template.mail.lettre_bienvenue.remerciement_financement=Nous vous remercions de nous avoir confi\u00E9 le financement de la solution commercialis\u00E9e par notre partenaire {{apporteur.raisonSociale}} et esp\u00E9rons que vous \u00EAtes satisfait de nos services.
template.mail.lettre_bienvenue.confirmation_contrat_echeances=Par la pr\u00E9sente, nous vous confirmons l\u2019entr\u00E9e en vigueur du contrat et vous informons que les \u00E9ch\u00E9ances seront pr\u00E9lev\u00E9es par {{bailleur.raisonSociale}} \u00E0 partir du {{dateDemarrage}}.
template.mail.lettre_bienvenue.piece_jointe_date_prelevement=Au titre de notre prestation d\u2019accompagnement, nous vous prions de trouver en pi\u00e8ce jointe la facture de mise \u00E0 disposition de la solution \u00E0 la p\u00E9riode du {{dateDebutPrelevement}} au {{dateFinPrelevement}}.
```

``` html
<p>
    {{#i18n}}template.mail.lettre_bienvenue.cher_client{{/i18n}}<br/>
</p>
<p>
    {{#i18n}}template.mail.lettre_bienvenue.remerciement_financement{{/i18n}}<br/>
</p>
<p>
    {{#i18n}}template.mail.lettre_bienvenue.confirmation_contrat_echeances{{/i18n}}<br/>
</p>
<p>
    {{#dateDebutPrelevementExists}}
        {{#i18n}}template.mail.lettre_bienvenue.piece_jointe_date_prelevement{{/i18n}}
    {{/dateDebutPrelevementExists}}
    {{^dateDebutPrelevementExists}}
        {{#i18n}}template.mail.lettre_bienvenue.piece_jointe{{/i18n}}
    {{/dateDebutPrelevementExists}}
    <br/>
</p>
<p>
    {{#i18n}}template.mail.lettre_bienvenue.prelevement_prestation{{/i18n}}<br/>
</p>
<p>
    {{#i18n}}template.mail.lettre_bienvenue.contacter_service_client{{/i18n}}<br/>
</p>
<ul>
    <li>{{#i18n}}template.mail.lettre_bienvenue.contact_telephone{{/i18n}}</li>
    <li>{{#i18n}}template.mail.lettre_bienvenue.contact_mail{{/i18n}}</li>
</ul>
<p>
    {{#i18n}}template.mail.lettre_bienvenue.remerciement{{/i18n}}<br/>
</p>
```

### Résultats

Le cas où une facture est de sous-type facture vente avec un mode de paiement 'PRELEVEMENT' comptabilisée
![screenshoot du mail de bienvenue](./../../../static/img/feature/mail_1_facture.png)

Le cas où deux facture ou plus sont de sous-type Facture Vente avec un mode de paiement 'PRELEVEMENT' comptabilisée

![screenshoot du mail de bienvenue](./../../../static/img/feature/mail_2_factures.png)

Le cas où aucune facture n'est de sous-type Loyer Facture Vente avec un mode de paiement 'PRELEVEMENT' comptabilisée

![screenshoot du mail de bienvenue](./../../../static/img/feature/mail_0_facture.png)

### Conclusion

Ce développement m’a permis de découvrir un domaine que je n’avais encore jamais abordé : la création de **templates de mails**.  
J’ai pu constater à quel point cet outil peut être utile pour nos utilisateurs finaux, qui doivent régulièrement communiquer avec leurs clients par email.  
En automatisant et en structurant ce type de messages, on leur fait gagner du temps tout en garantissant une présentation professionnelle et cohérente.

---
