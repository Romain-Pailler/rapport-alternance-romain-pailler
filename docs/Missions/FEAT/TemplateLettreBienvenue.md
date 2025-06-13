---
sidebar_label: Lettre de bienvenue
sidebar_position: "2"
tags: 
    - Feature
    - Template
---
# Template de mail pour la lettre de bienvenue

## Contexte

Il est possible depuis l'application d'envoyer un email de bienvenue après la facturation d'un dossier.
Ce template est codé en .mustache (à voir avec clément) qui à besoin de données telles que des dates ou des numéro de contrat

## Objectif

L'objectif ici est d'améliorer l'existant. Le template de mail existe mais avec des fautes d'ortographes et des données nécessaires manquantes que les commerciaux devaient remplir manuellement.
Les données manquantes :

- Le code de la demande
- La raison sociale du client
- Le siren du client
- Les dates du Loyer Intercalaire
- La date de prelevement estimée

## Réalisations

La partie la plus technique à été d'afficher ou non la date de prélévement estimée car la DP dépend d'une seule facture comptabilisée donc je devais vérifier que la facture était comptabilisée, que son type soit de loyer facture vente. Il peut avoir des factures comptabilisées qui sont annulés car elles ont des avoir;

J'ai du créer un nouveau processus : explication des 3 couches de Leasa

## Ce que j'ai appris

## Le code

### DemandeFactureProcessusImpl.java

Dans cette classe, j’ai ajouté une nouvelle méthode métier getFacturesFiltreesLoyerSansAvoir. Celle-ci permet de filtrer les factures d’une demande afin de ne conserver que celles qui sont comptabilisées dans le système comptable (Monalisa-Compta) et qui ne possèdent pas d'avoir associé. En effet, lorsqu’une facture est associée à un avoir, elle ne doit pas être prise en compte dans le calcul, d’où la nécéssitéde cette fonction utilisé dans le mailBuilder.

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

Dans cette partie, j’ai ajouté la génération du mail de bienvenue, envoyé au client lors de la mise en place de son contrat.

La méthode getTemplateLettreBienvenue permet de récupérer l’ensemble des informations nécessaires à la génération du mail. Les données sont d’abord chargées à partir de la demande (Demande) via le processus métier. Elles sont ensuite stockées dans un contexte sous forme de Map (String, Object) qui sera utilisé par les templates [Mustache](./../../annexes/mustache).

Plusieurs informations sont extraites, notamment :

Les coordonnées du bailleur, de l’apporteur et du client ;

La date de démarrage du contrat de facturation ;

Le numéro de téléphone et l’adresse email du loueur, récupérés via le processus adresseEmailProcessus ;

Le code de la demande.

Ensuite, le processus demandeFactureProcessus.getFacturesFiltreesLoyerSansAvoir est appelé pour filtrer les factures, afin de récupérer une éventuelle date de prélèvement estimée s’il n’existe qu’une seule facture éligible. Dans le cas contraire, une valeur par défaut est utilisée.

Un contrôle est également réalisé pour vérifier l'existence d'un loyer intercalaire, et renseigner, si besoin, les dates de début et de fin de cette période dans le contexte.

Enfin, la signature du mail est configurée selon les règles de gestion internes, et l'ensemble des données est injecté dans les templates Mustache pour générer :

Le sujet du mail via objet.mustache,

Le contenu principal via body.mustache,

La signature via le templateToolI18nLoueurLocale.

Les fichiers .properties contiennent les différents libellés traduits qui sont insérés dans le corps du message grâce à la syntaxe Mustache.

Le template Mustache permet, selon la présence ou non des dates de prélèvements, d’afficher dynamiquement le bon contenu pour le client.

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

``` mustache
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
