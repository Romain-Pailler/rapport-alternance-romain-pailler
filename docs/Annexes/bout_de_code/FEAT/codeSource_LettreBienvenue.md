---
sidebar_label: Code source - Lettre de bienvenue
sidebar_position: 1
tags: 
    - Feature
    - Template
    - Code
---

# Code source template lettre de bienvenue

## DemandeFactureProcessusImpl.java

```java
@Service
public class DemandeFactureProcessusImpl implements DemandeFactureProcessus {
    
    @Override
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
                .filter(f -> LOYER_FACTURE_VENTE.equals(f.getSousTypeFacture().getCode()) && ModePaiement.PRELEVEMENT.equals(f.getModePaiement()))
                .collect(Collectors.toList());
    }
}
```

## DemandeFactureProcessus.java

```java
public interface DemandeFactureProcessus {
    /**
     *Filtre les factures d'une demande par sous type LoyerFactureVente qui sont comptabilisées sans avoir reliée à elles
     * @param demande
     * @return
     */
    List<Facture> getFacturesFiltreesLoyerSansAvoir(Demande demande);
}
```

## MailBuilder.java

```java
@Component
@Slf4j
public class MailBuilder {
    
    public static final String BALISE_MJML_START = "<mj-section><mj-column><mj-text>";
    public static final String BALISE_MJML_END = "</mj-text></mj-column></mj-section>";
    
    public static final String EMAIL_HEADER_TEMPLATE = "email/email-header.mustache";
    public static final String EMAIL_FOOTER_TEMPLATE = "email/email-footer.mustache";
    public static final String LOUEUR_PROPERTY = "loueur";
    public static final String UTILISATEUR_PROPERTY = "utilisateur";
    public static final String YEAR_PROPERTY = "annee";
    public static final String LOGO_BANNER_LINK_PROPERTY = "logoBannerLink";
    public static final String LOGO_LINK_PROPERTY = "logoLink";
    public static final String BADGE_APPLE_LINK_PROPERTY = "appleBagdeLink";
    public static final String BADGE_GOOGLE_LINK_PROPERTY = "googleBadgeLink";
    public static final String IS_DEFAULT_PROPERTY = "isDefault";
    public static final String DATE_PRELEVEMENT = "datePrelevement";
    public static final String DATE_PRELEVEMENT_EXISTS = "datePrelevementExists";
    
    /**
     * Url public pour récuperer les resources
     */
    private final String mailPublicResources;
    private final CurrentUserProcessus currentUserProcessus;
    private final ILoueurProcessus loueurProcessus;
    private final IDemandeProcessus demandeProcessus;
    private final DemandeFactureProcessus demandeFactureProcessus;
    private final IAdresseEmailProcessus adresseEmailProcessus;
    private final TemplateTools templateTools;
    private final TemplateToolI18nLoueurLocale templateToolI18nLoueurLocale;
    
    @Autowired
    public MailBuilder(
            final CurrentUserProcessus currentUserProcessus,
            final ILoueurProcessus loueurProcessus,
            final IDemandeProcessus demandeProcessus,
            final IAdresseEmailProcessus adresseEmailProcessus,
            final TemplateTools templateTools,
            final TemplateToolI18nLoueurLocale templateToolI18nLoueurLocale,
            @Value("${openapi:openapi.mail-resource.public.server}") final String mailPublicResources,
            final DemandeFactureProcessus demandeFactureProcessus
    ) {
        this.currentUserProcessus = currentUserProcessus;
        this.loueurProcessus = loueurProcessus;
        this.demandeProcessus = demandeProcessus;
        this.templateTools = templateTools;
        this.mailPublicResources = mailPublicResources;
        this.templateToolI18nLoueurLocale = templateToolI18nLoueurLocale;
        this.demandeFactureProcessus = demandeFactureProcessus;
        this.adresseEmailProcessus = adresseEmailProcessus;
    }
 /**
     * Retourne le template d'e-mail de lettre de bienvenue pour l'utilisateur courant
     *
     * @return Le html correspondant au template
     */
    @Transactional(readOnly = true)
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
            facturesFiltreesLoyerFactureVente.stream().findFirst().ifPresent(facture -> context.put(DATE_PRELEVEMENT, dateFormat.format(facture.getDatePrelevementEstimee())));
        } else {
            context.put(DATE_PRELEVEMENT, DATE_PRELEVEMENT);
        }
        context.put(DATE_PRELEVEMENT_EXISTS, !facturesFiltreesLoyerFactureVente.isEmpty());
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

## template_fr.properties

```json
template.mail.signature.equipe=L'\u00E9quipe {{loueur.libelle}}
template.mail.signature.equipe_leasa=L'\u00E9quipe Leasa
template.mail.signature.cordialement=Cordialement.
template.mail.signature.telephone.fixe=Fixe
template.mail.signature.telephone.mobile=Mobile
template.mail.footer.retrouvez=Retrouvez Leasa o\u00F9 que vous soyez.
template.mail.footer.tooltip.ios=T\u00E9l\u00E9charger dans l'App Store
template.mail.footer.tooltip.android=Disponible sur Google Play
template.mail.footer.leasa_by_nanceo=\u00A9 {{annee}} Leasa by nanceo
template.mail.lettre_bienvenue.sujet=Redevance de mise \u00E0 disposition - Contrat {{codeDemande}} - {{client.raisonSociale}} - Siren : {{client.premierNumeroIdentification}}
template.mail.lettre_bienvenue.cher_client=Cher client,
template.mail.lettre_bienvenue.remerciement_financement=Nous vous remercions de nous avoir confi\u00E9 le financement de la solution commercialis\u00E9e par notre partenaire {{apporteur.raisonSociale}} et esp\u00E9rons que vous \u00EAtes satisfait de nos services.
template.mail.lettre_bienvenue.confirmation_contrat_echeances=Par la pr\u00E9sente, nous vous confirmons l\u2019entr\u00E9e en vigueur du contrat et vous informons que les \u00E9ch\u00E9ances seront pr\u00E9lev\u00E9es par {{bailleur.raisonSociale}} \u00E0 partir du {{dateDemarrage}}.
template.mail.lettre_bienvenue.piece_jointe_date_prelevement=Au titre de notre prestation d\u2019accompagnement, nous vous prions de trouver en pi\u00e8ce jointe la facture de mise \u00E0 disposition de la solution \u00E0 la p\u00E9riode du {{dateDebutPrelevement}} au {{dateFinPrelevement}}.
template.mail.lettre_bienvenue.piece_jointe=Au titre de notre prestation d\u2019accompagnement, nous vous prions de trouver en pi\u00e8ce jointe la facture de mise \u00E0 disposition de la solution.
template.mail.lettre_bienvenue.prelevement_prestation=Le pr\u00E9l\u00e8vement de cette prestation interviendra le {{datePrelevement}}.
template.mail.lettre_bienvenue.contacter_service_client=Pour toute question, merci de contacter le service client {{apporteur.loueur.raisonSociale}} qui se tient \u00E0 votre disposition :
template.mail.lettre_bienvenue.remerciement=Nous vous remercions de votre confiance, et vous prions d\u2019agr\u00E9er, cher client, l\u2019expression de nos salutations distingu\u00E9es.
template.mail.lettre_bienvenue.contact_telephone=du lundi au vendredi de 9h00 \u00E0 17h30 au num\u00E9ro gratuit {{numeroTelephone}}
template.mail.lettre_bienvenue.contact_mail=par mail {{mail}}
```

## lettre-bienvenue / body.mustache

```html
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
{{#datePrelevementExists}}
<p>
    {{#i18n}}template.mail.lettre_bienvenue.prelevement_prestation{{/i18n}}<br/>
</p>
{{/datePrelevementExists}}
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
