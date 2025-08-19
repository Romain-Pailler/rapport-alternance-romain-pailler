---
sidebar_label: Côté serveur
sidebar_position: "2"
tags: 
    - Migration
    - Java
    - Code
---
# Affichage résultat - Code source - Back

## DemandeDaoImpl.java

```java

    private List<Demande> setEntitesByProjection(final List<Demande> demandes, final DemandeCriteria demandeCriteria, final Utilisateur utilisateur) {
        
        if (demandeCriteria.getCurrentProjection() != null) {
            
            final List<List<Demande>> partitionDemandes = new PartitionManager<Demande>().add(demandes).getPartitions();
            final List<Demande> demandesToReturn = new ArrayList<>();
            
            for (final List<Demande> demandeList : partitionDemandes) {
                
                switch (demandeCriteria.getCurrentProjection()) {
                    case DemandeCriteria.PROJECTION_HISTORIQUE, DemandeCriteria.PROJECTION_STATISTIQUE_WITH_STATUT_HISTORIQUE -> setHistoriquesToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_STATISTIQUE_PAYE -> setPaiementsToDemandes(demandeList, new PaiementCriteria().setWithDateReglement(true));
                    case DemandeCriteria.PROJECTION_RECHERCHE_FRONT -> {
                        setConditionsAccordToDemandes(demandeList);
                        setValeurInterruptionToDemandes(demandeList, utilisateur);
                    }
                    case DemandeCriteria.PROJECTION_PORTEFEUILLE -> {
                        setTagsToDemandes(demandeList);
                        setGroupesApporteursToApporteurs(demandes);
                    }
                    case DemandeCriteria.PROJECTION_TAGS -> setTagsToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_FACTURES -> setFacturesToDemandes(demandeList);
                    case DemandeCriteria.PROJECTION_ETAT_PARC_VALEURS_INTERRUPTION_FRONT -> {
                        setValeurInterruptionToDemandes(demandeList, utilisateur);
                        setMateriels(demandes);
                    }
                    case DemandeCriteria.PROJECTION_TRANSFERABLE -> setDirigeantsClient(demandeList);
                    case DemandeCriteria.PROJECTION_RECHERCHE_BACK -> {
                        setProtections(demandeList);
                        setGroupesApporteursToApporteurs(demandeList);
                        setFacturesToDemandes(demandeList);
                    }
                    default -> {
                    }
                }
                
                demandesToReturn.addAll(demandeList);
            }
            
            return demandesToReturn;
        }
        return demandes;
    }

        private void setFacturesToDemandes(final List<Demande> demandes) {
        final Map<Long, List<Facture>> map = createQuery()
                .from(Q_DEMANDE)
                .leftJoin(Q_DEMANDE.factures, Q_FACTURE)
                .leftJoin(Q_FACTURE.entite, Q_ENTITE_FACTURE_ENTITE)
                .leftJoin(Q_FACTURE.loueur, Q_ENTITE_FACTURE_LOUEUR)
                .leftJoin(Q_FACTURE.sousTypeFacture, Q_SOUS_TYPE_FACTURE)
                .leftJoin(Q_FACTURE.sensFacture, Q_SENS_FACTURE)
                .where(Q_DEMANDE.in(demandes)).transform(
                        GroupBy.groupBy(Q_DEMANDE.id)
                                .as(GroupBy.list(Projections.bean(Facture.class,
                                        Q_FACTURE.id,
                                        Q_FACTURE.numeroFacture,
                                        Q_FACTURE.montantTotalHT,
                                        Q_FACTURE.dateComptabilisation,
                                        Projections.bean(EntiteFacture.class, Q_ENTITE_FACTURE_ENTITE.id,
                                                Q_ENTITE_FACTURE_ENTITE.premierNumeroIdentification).as(Q_FACTURE.entite),
                                        Projections.bean(EntiteFacture.class,
                                                Q_ENTITE_FACTURE_LOUEUR.id,
                                                Q_ENTITE_FACTURE_LOUEUR.premierNumeroIdentification).as(Q_FACTURE.loueur),
                                        Projections.bean(SensFacture.class, Q_SENS_FACTURE.id,
                                                Q_SENS_FACTURE.code).as(Q_FACTURE.sensFacture),
                                        Projections.bean(SousTypeFacture.class, Q_SOUS_TYPE_FACTURE.id,
                                                Q_SOUS_TYPE_FACTURE.code).as(Q_FACTURE.sousTypeFacture)))));
        
        demandes.forEach(d -> {
            List<Facture> factures = new ArrayList<>();
            if (map.containsKey(d.getId())) {
                factures = map.get(d.getId());
            }
            d.setFactures(factures.stream().filter(facture -> Objects.nonNull(facture.getId())).collect(Collectors.toList()));
        });
    }

```

## DemandeProjectionRechercheBackImpl.java

```java
package com.pharmagest.monalisa.rest.dao.projection.impl.demande;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.QBean;
import com.pharmagest.monalisa.rest.dao.builder.DemandeSearchBuilder;
import com.pharmagest.monalisa.rest.dao.projection.IProjection;
import com.pharmagest.monalisa.rest.entity.Apporteur;
import com.pharmagest.monalisa.rest.entity.Bailleur;
import com.pharmagest.monalisa.rest.entity.Client;
import com.pharmagest.monalisa.rest.entity.Decision;
import com.pharmagest.monalisa.rest.entity.Demande;
import com.pharmagest.monalisa.rest.entity.Facturation;
import com.pharmagest.monalisa.rest.entity.Loueur;
import com.pharmagest.monalisa.rest.entity.QApporteur;
import com.pharmagest.monalisa.rest.entity.QBailleur;
import com.pharmagest.monalisa.rest.entity.QClient;
import com.pharmagest.monalisa.rest.entity.QDecision;
import com.pharmagest.monalisa.rest.entity.QDemande;
import com.pharmagest.monalisa.rest.entity.QFacturation;
import com.pharmagest.monalisa.rest.entity.QLoueur;
import com.pharmagest.monalisa.rest.entity.QSchemaFinancier;
import com.pharmagest.monalisa.rest.entity.QStatut;
import com.pharmagest.monalisa.rest.entity.QUtilisateur;
import com.pharmagest.monalisa.rest.entity.SchemaFinancier;
import com.pharmagest.monalisa.rest.entity.Statut;
import com.pharmagest.monalisa.rest.entity.Utilisateur;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;

public class DemandeProjectionRechercheBackImpl implements IProjection<Demande, DemandeSearchBuilder> {
    
    private static final QDemande Q_DEMANDE = QDemande.demande;
    private static final QSchemaFinancier Q_SCHEMA_FINANCIER = QSchemaFinancier.schemaFinancier;
    private static final QStatut Q_STATUT = new QStatut("statut");
    private static final QApporteur Q_APPORTEUR = QApporteur.apporteur;
    private static final QDecision Q_ACCORD = new QDecision("accord");
    private static final QBailleur Q_BAILLEUR_ACCORD = new QBailleur("bailleurAccord");
    private static final QLoueur Q_LOUEUR = QLoueur.loueur;
    private static final QFacturation Q_FACTURATION = QFacturation.facturation;
    private static final QUtilisateur Q_UTILISATEUR_COMMERCIAL = new QUtilisateur("utilisateurCommercial");
    private static final QClient Q_CLIENT = QClient.client;
    
    private static DemandeProjectionRechercheBackImpl INSTANCE = new DemandeProjectionRechercheBackImpl();
    
    private DemandeProjectionRechercheBackImpl() {
        
    }
    
    public static DemandeProjectionRechercheBackImpl getInstance() {
        return INSTANCE;
    }
    
    @Override
    public QBean<Demande> createProjection(final DemandeSearchBuilder builder) {
        
        builder.leftJoin(Q_DEMANDE.statut, Q_STATUT);
        builder.leftJoin(Q_DEMANDE.facturation, Q_FACTURATION);
        builder.leftJoin(Q_DEMANDE.accord, Q_ACCORD);
        builder.leftJoin(Q_ACCORD.bailleur, Q_BAILLEUR_ACCORD);
        builder.leftJoin(Q_DEMANDE.utilisateurCommercial, Q_UTILISATEUR_COMMERCIAL);
        builder.leftJoin(Q_DEMANDE.client, Q_CLIENT);
        builder.leftJoin(Q_DEMANDE.schemaFinancier, Q_SCHEMA_FINANCIER);
        builder.leftJoin(Q_DEMANDE.apporteur, Q_APPORTEUR);
        builder.leftJoin(Q_APPORTEUR.loueur, Q_LOUEUR);
        
        return Projections.bean(Demande.class,
                Q_DEMANDE.id,
                Q_DEMANDE.code,
                Q_DEMANDE.dateCreation,
                Q_DEMANDE.eligibleProtection,
                Projections.bean(Apporteur.class,
                        Q_APPORTEUR.id,
                        Q_APPORTEUR.code,
                        Q_APPORTEUR.libelle,
                        Projections.bean(Loueur.class,
                                Q_LOUEUR.id,
                                Q_LOUEUR.code,
                                Q_LOUEUR.libelle,
                                Q_LOUEUR.devise).as(Q_APPORTEUR.loueur)
                ).as(Q_DEMANDE.apporteur),
                Projections.bean(Statut.class,
                        Q_STATUT.id,
                        Q_STATUT.code,
                        Q_STATUT.ordreTimeline).as(Q_DEMANDE.statut),
                Projections.bean(Client.class,
                        Q_CLIENT.id,
                        Q_CLIENT.premierNumeroIdentification,
                        Q_CLIENT.raisonSociale).as(Q_DEMANDE.client),
                Projections.bean(SchemaFinancier.class,
                        Q_SCHEMA_FINANCIER.id,
                        Q_SCHEMA_FINANCIER.montantHT,
                        Q_SCHEMA_FINANCIER.loyerHT).as(Q_DEMANDE.schemaFinancier),
                Projections.bean(Facturation.class,
                        Q_FACTURATION.id,
                        Q_FACTURATION.montantHT,
                        Q_FACTURATION.loyerCalcule,
                        Q_FACTURATION.loyerContrat
                ).as(Q_DEMANDE.facturation),
                Projections.bean(Decision.class,
                        Q_ACCORD.id,
                        Q_ACCORD.montantHT,
                        Q_ACCORD.reference,
                        Projections.bean(Bailleur.class,
                                Q_BAILLEUR_ACCORD.id,
                                Q_BAILLEUR_ACCORD.code,
                                Q_BAILLEUR_ACCORD.libelle).as(Q_ACCORD.bailleur)
                ).as(Q_DEMANDE.accord),
                Projections.bean(Utilisateur.class,
                        Q_UTILISATEUR_COMMERCIAL.id,
                        Q_UTILISATEUR_COMMERCIAL.prenom,
                        Q_UTILISATEUR_COMMERCIAL.nom).as(Q_DEMANDE.utilisateurCommercial)
        
        );
    }
    
    @Override
    public String getProjectionName() {
        return DemandeCriteria.PROJECTION_RECHERCHE_BACK;
    }
```

## IFactureProcessusImpl.java

```java
/**
     * Calcule le montant total hors taxes des factures d'achat
     *
     * @param factures la liste des factures à traiter
     * @return la somme des montants HT des factures d'achat valides
     */
    BigDecimal computeMontantTotalAchat(List<Facture> factures);
    
    /**
     * Calcule le montant total hors taxes des factures de vente
     * 
     * @param factures la liste des factures à traiter
     * @return la somme des montants HT des factures de vente valides
     */
    BigDecimal computeMontantTotalVente(List<Facture> factures);
```

## FactureProcessusImpl.java

```java
 @Override
    public BigDecimal computeMontantTotalAchat(List<Facture> factures) {
        return computeTotalBySens(factures, SensFacture.ACHAT);
    }
    
    @Override
    public BigDecimal computeMontantTotalVente(List<Facture> factures) {
        return computeTotalBySens(factures, SensFacture.VENTE);
    }
    
    private BigDecimal computeTotalBySens(List<Facture> factures, String sensRecherche) {
        final Set<String> CODES_SOUS_TYPES_FATURE_AUTORISES =
                Set.of(SousTypeFacture.ACQUISITION_FACTURE_ACHAT, SousTypeFacture.ACQUISITION_FACTURE_VENTE, SousTypeFacture.ACQUISITION_AVOIR_ACHAT,
                        SousTypeFacture.ACQUISITION_AVOIR_VENTE, SousTypeFacture.ACQUISITION_EXTOURNE_ACHAT, SousTypeFacture.ACQUISITION_EXTOURNE_VENTE);
        
        BigDecimal total = BigDecimal.ZERO;
        if (CollectionUtils.isEmpty(factures)) {
            return BigDecimal.ZERO;
        }
        return factures.stream()
                .filter(facture -> facture.getDateComptabilisation() != null
                        && facture.getSousTypeFacture() != null
                        && CODES_SOUS_TYPES_FATURE_AUTORISES.contains(facture.getSousTypeFacture().getCode())
                        && facture.getMontantTotalHT() != null
                        && facture.getSensFacture() != null
                        && sensRecherche.equals(facture.getSensFacture().getCode()))
                .map(Facture::getMontantTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
```

## SearchService.java

```java
@Service
@Slf4j
@Produces(MediaType.APPLICATION_JSON)
public class SearchService {
    
    private final IDemandeProcessus demandeProcessus;
    private final IDemandeSearchProcessus demandeSearchProcessus;
    private final IDerogationProcessus derogationProcessus;
    private final ITacheProcessus tacheProcessus;
    private final IPushCycleProcessus pushCycleProcessus;
    private final MonalisaBeanMapper mapper;
    
    @Autowired
    public SearchService(final IDemandeProcessus demandeProcessus,
            final IDemandeSearchProcessus demandeSearchProcessus,
            final IDerogationProcessus derogationProcessus,
            final ITacheProcessus tacheProcessus,
            final IPushCycleProcessus pushCycleProcessus,
            final MonalisaBeanMapper mapper) {
        
        this.demandeProcessus = demandeProcessus;
        this.demandeSearchProcessus = demandeSearchProcessus;
        this.derogationProcessus = derogationProcessus;
        this.tacheProcessus = tacheProcessus;
        this.pushCycleProcessus = pushCycleProcessus;
        this.mapper = mapper;
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response search(@Context final UriInfo info, @HeaderParam(Constantes.AUTH_KEY_FROM) final String from) {
        final DemandeCriteria demandeCriteria = new DemandeCriteria(info.getQueryParameters(), from);
        
        if (demandeCriteria.getVersion().equals(DemandeCriteria.Version.V2)) {
            final Long count = demandeSearchProcessus.countAllByCriteria(demandeCriteria);
            final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria);
            return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeShort.class), demandeCriteria.getStartPage(), count)).build();
        } else {
            final Boolean withProjection = demandeCriteria.getWithProjection() != null && demandeCriteria.getWithProjection();
            final Boolean initialize = !withProjection;
            
            final Long count = demandeSearchProcessus.countAllByCriteria(demandeCriteria);
            if (DemandeCriteria.PROJECTION_ETAT_PARC_VALEURS_INTERRUPTION_FRONT.equals(demandeCriteria.getCurrentProjection())) {
                final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria);
                final List<RestDemandeEtatParc> restDemandes = demandeSearchProcessus.convertSearchResults(demandes);
                return Response
                        .ok(new RestEtatParcDureeContrat(restDemandes, demandeCriteria.getStartPage(), count, demandeProcessus.getMaxDureeContratByCriteria(demandeCriteria)))
                        .build();
            } else {
                final List<Demande> demandes = demandeSearchProcessus.searchByCriteria(demandeCriteria, initialize);
                if (DemandeCriteria.PROJECTION_RECHERCHE_BACK.equals(demandeCriteria.getCurrentProjection())) {
                    return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count)).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
```

## RestDemandeSearch.java

```java

@XmlType(name = "")
@XmlRootElement(name = "demande")
@XmlAccessorType(XmlAccessType.FIELD)
@Getter
@Setter
public class RestDemandeSearch {
    private Long id;
    private String code;
    private RestStatutShort statut;
    private RestUtilisateurShort utilisateurCommercial;
    private RestClientMinimal client;
    private Date dateCreation;
    private BigDecimal montantHT;
    private RestDecisionShort accord;
    private RestApporteurShortWithGroupe apporteur;
    private BigDecimal montantAchatContratHT;
    private BigDecimal montantVenteContratHT;
    private RestBafDetail bonAFacturer;
    private RestSchemaFinancierShort schemaFinancier;
    private RestClientShort loueur;
    private Date datePaiement;
    private String devise;
    private BigDecimal montantTotalAchatHT;
    private BigDecimal montantTotalVenteHT;
    private BigDecimal montantLoyerHT;
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return "RestDemandeSearch{id:" + getId() + ", code: " + getCode() + "}";
    }
}
```

## DemandeSearchConverter.java 

```java

@Component
public class DemandeSearchConverter implements CustomConverter {
    @Autowired
    private StatutShortMapper statutShortMapper;
    
    private final IFactureProcessus factureProcessus;
    
    @Autowired
    public DemandeSearchConverter(StatutShortMapper statutShortMapper, @Lazy IFactureProcessus factureProcessus) {
        this.statutShortMapper = statutShortMapper;
        this.factureProcessus = factureProcessus;
    }
    
    @Override
    public Object convert(final Object destination, final Object source, final Class destinationClass, final Class sourceClass) {
        
        if (source == null) {
            return null;
        }
        
        if (!(source instanceof Demande)) {
            throw new MappingException("DemandeSearchConverter : type source non supporté : " + source.getClass());
        }
        
        final Demande demande = (Demande) source;
        final RestDemandeSearch restDemandeSearch = destination == null ? new RestDemandeSearch() : (RestDemandeSearch) destination;
        
        restDemandeSearch.setId(demande.getId());
        restDemandeSearch.setCode(demande.getCode());
        restDemandeSearch.setDateCreation(demande.getDateCreation());
        
        if (demande.getUtilisateurCommercial() != null) {
            RestUtilisateurShort user = new RestUtilisateurShort();
            user.setId(demande.getUtilisateurCommercial().getId());
            user.setFullName(demande.getUtilisateurCommercial().getFullName());
            restDemandeSearch.setUtilisateurCommercial(user);
        }
        
        if (demande.getStatut() != null) {
            restDemandeSearch.setStatut(statutShortMapper.toRestDto(demande.getStatut()));
        }
        if (demande.getClient() != null) {
            RestClientMinimal client = new RestClientMinimal();
            client.setId(demande.getClient().getId());
            client.setRaisonSociale(demande.getClient().getRaisonSociale());
            client.setSiren(demande.getClient().getSiren());
            restDemandeSearch.setClient(client);
        }
        if (demande.getAccord() != null) {
            RestDecisionShort accord = new RestDecisionShort();
            RestBailleurDetail bailleur = new RestBailleurDetail();
            bailleur.setLibelle(demande.getAccord().getBailleur().getLibelle());
            accord.setBailleur(bailleur);
            accord.setReference(demande.getAccord().getReference());
            restDemandeSearch.setAccord(accord);
            
        }
        if (demande.getApporteur() != null) {
            RestApporteurShortWithGroupe restApporteur = new RestApporteurShortWithGroupe();
            restApporteur.setId(demande.getApporteur().getId());
            restApporteur.setCode(demande.getApporteur().getCode());
            restApporteur.setLibelle(demande.getApporteur().getLibelle());
            
            if (demande.getApporteur().getLoueur() != null) {
                RestLoueurMinimal loueur = new RestLoueurMinimal();
                loueur.setCode(demande.getApporteur().getLoueur().getCode());
                restDemandeSearch.setDevise(demande.getApporteur().getLoueur().getDevise().toString());
                restApporteur.setLoueur(loueur);
            }
            
            if (demande.getApporteur().getGroupeApporteurs() != null && !demande.getApporteur().getGroupeApporteurs().isEmpty()
                    && demande.getApporteur().getGroupeApporteurs().get(0) != null) {
                
                RestGroupeApporteurShort groupe = new RestGroupeApporteurShort();
                groupe.setId(demande.getApporteur().getGroupeApporteurs().get(0).getId());
                groupe.setNom(demande.getApporteur().getGroupeApporteurs().get(0).getNom());
                restApporteur.setGroupeApporteurs(groupe);
            }
            
            restDemandeSearch.setApporteur(restApporteur);
        }
        
        final Integer ordreTimeline = demande.getStatut() != null ? demande.getStatut().getOrdreTimeline() : null;
        
        if (ordreTimeline != null && ordreTimeline < 19) {
            if (demande.getSchemaFinancier() != null) {
                restDemandeSearch.setMontantTotalAchatHT(demande.getSchemaFinancier().getMontantHT());
                restDemandeSearch.setMontantLoyerHT(demande.getSchemaFinancier().getLoyerHT());
            }
            if (demande.getAccord() != null) {
                restDemandeSearch.setMontantTotalVenteHT(demande.getAccord().getMontantHT());
            }
        } else if (ordreTimeline != null) {
            if (demande.getFacturation() != null) {
                restDemandeSearch.setMontantLoyerHT(demande.getFacturation().getLoyerContrat());
            }
            BigDecimal totalAchat = factureProcessus.computeMontantTotalAchat(demande.getFactures());
            BigDecimal totalVente = factureProcessus.computeMontantTotalVente(demande.getFactures());
            restDemandeSearch.setMontantTotalAchatHT(totalAchat);
            restDemandeSearch.setMontantTotalVenteHT(totalVente);
        }
        
        return restDemandeSearch;
    }
}
```

## mapping.xml

```java
 <converter type="com.pharmagest.monalisa.rest.service.mapper.DemandeSearchConverter">
                <class-a>com.pharmagest.monalisa.rest.entity.Demande</class-a>
                <class-b>com.pharmagest.monalisa.rest.service.domain.demande.RestDemandeSearch</class-b>
 </converter>
```

## DemandeDao_SearchDemandeWithProjectionRechercheBackIT.java : 

```java 

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DaoTestConfiguration.class)
@Transactional
public class DemandeDao_SearchDemandesWithProjectionRechercheBackIT extends CommonAction {
    @Autowired
    DataSource dataSource;
    @Autowired
    IDemandeDao demandeDao;
    
    @Test
    public void itShouldSearchDemandesWithProjectionRechercheBackAndLoadFactures() {
        // GIVEN
        final Loueur loueur = LoueurBuilder.create(this.randomDataGenerator).build();
        final Apporteur apporteur = ApporteurBuilder.create(this.randomDataGenerator).withLoueur(loueur).build();
        final GroupeApporteur groupeApporteur = GroupeApporteurBuilder.create(this.randomDataGenerator).withApporteurs(apporteur).build();
        
        final Utilisateur utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator).withRoles(
                RoleBuilder.create(this.randomDataGenerator, Role.SUPER_ADMIN).withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                        .build()).withApporteurs(apporteur).build();
        
        final Demande demande = DemandeBuilder.create(this.randomDataGenerator).withApporteur(apporteur).withUtilisateurCommercial(utilisateur).build();
        final EntiteFacture entite = EntiteFactureBuilder.create(this.randomDataGenerator).build();
        final SensFacture sens = SensFactureBuilder.createSensVente(this.randomDataGenerator).build();
        final SousTypeFacture sousType = SousTypeFactureBuilder.create(this.randomDataGenerator, SousTypeFacture.ACQUISITION_FACTURE_VENTE).build();
        
        final Facture facture =
                FactureBuilder.create(this.randomDataGenerator).withDemande(demande).withEntiteFacture(entite).withSensFacture(sens).withSousTypeFacture(sousType).build();
        
        dbObjectExecuteWithReset(dataSource, groupeApporteur, demande, utilisateur, entite, loueur, sens, sousType, facture);
        
        final DemandeCriteria criteria = new DemandeCriteria().setCode(demande.getCode()).setCurrentProjection(DemandeCriteria.PROJECTION_RECHERCHE_BACK);
        
        // WHEN
        List<Demande> result = demandeDao.searchByCriteria(criteria, utilisateur);
        
        // THEN
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        
        Demande resultDemande = result.get(0);
        
        assertThat(resultDemande.getApporteur()).isNotNull();
        assertThat(resultDemande.getApporteur().getLoueur()).isEqualTo(loueur);
        assertThat(resultDemande.getApporteur().getGroupeApporteurs()).isNotEmpty();
        assertThat(resultDemande.getApporteur().getGroupeApporteurs()).usingElementComparatorOnFields("id", "nom").contains(groupeApporteur);
        
        assertThat(resultDemande.getFactures()).isNotNull();
        assertThat(resultDemande.getFactures()).hasSize(1);
        
        Facture resultFacture = resultDemande.getFactures().get(0);
        assertThat(resultFacture.getId()).isEqualTo(facture.getId());
        assertThat(resultFacture.getNumeroFacture()).isEqualTo(facture.getNumeroFacture());
        assertThat(resultFacture.getMontantTotalHT()).isEqualTo(facture.getMontantTotalHT());
        
        assertThat(resultFacture.getDateComptabilisation()).isEqualToIgnoringMillis(facture.getDateComptabilisation());
        
        assertThat(resultFacture.getEntite()).isNotNull();
        assertThat(resultFacture.getEntite().getId()).isEqualTo(entite.getId());
        
        assertThat(resultFacture.getLoueur()).isNotNull();
        
        assertThat(resultFacture.getSensFacture()).isNotNull();
        assertThat(resultFacture.getSensFacture().getCode()).isEqualTo(sens.getCode());
        
        assertThat(resultFacture.getSousTypeFacture()).isNotNull();
        assertThat(resultFacture.getSousTypeFacture().getId()).isEqualTo(sousType.getId());
    }
}
```

## SearchServiceIT.java

```java
 @Test
    public void itShouldSearchDemandesWithProjectionRechercheBack() {
        skipNextLaunch();
        
        // GIVEN
        final Demande demande = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withUtilisateurCommercial(utilisateurBack)
                .build();
        dbObjectExecuteWithReset(dataSource, utilisateurBack, demande);
        
        // WHEN
        Response response = getJerseyTarget()
                .path("demandes/search")
                .queryParam("currentProjection", DemandeCriteria.PROJECTION_RECHERCHE_BACK)
                .request(MediaType.APPLICATION_JSON_TYPE)
                .header(Constantes.AUTH_KEY_TOKEN,
                        SecurityHelper.createValidToken(
                                utilisateurBack.getEmail(),
                                utilisateurBack.getPassword()))
                .header(Constantes.AUTH_KEY_FROM, Constantes.AUTH_PARAM_BACK)
                .get();
        
        // THEN
        assertThat(response).hasCodeRetourOk();
        
        RestCollectionResult<RestDemandeSearch> result =
                response.readEntity(new GenericType<RestCollectionResult<RestDemandeSearch>>() {});
        
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems()).allSatisfy(rest -> {
            assertThat(rest.getId()).isEqualTo(demande.getId());
            assertThat(rest.getCode()).isEqualTo(demande.getCode());
        });
    }
```