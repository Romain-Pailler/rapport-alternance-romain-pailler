---
sidebar_label: Côté serveur
sidebar_position: "2"
tags: 
    - Migration
    - Java
---

# Côté Java

commencer par ajouter une condition dans le searchService.java :

``` java
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
                if (DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2.equals(demandeCriteria.getCurrentProjection())) {
                    return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count)).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
```

ici ajout de setGroupesApporteursToApporteurs et setFacturesToDemandes :

``` java
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
```

ajout de montantTotalHt, dateComptabilisation, ajout du sens facture et sous type facture 

``` java
    
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

ajout dans demandeprojectionrecherchebackImpl.java (expliquer ce qu'est une projection) :

``` java
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
                        Q_STATUT.code).as(Q_DEMANDE.statut),
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
```

dto restDemandeSearch.java expliquer ce que c'est 

``` java
package com.pharmagest.monalisa.rest.service.domain.demande;

import java.math.BigDecimal;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import lombok.Getter;
import lombok.Setter;

import com.pharmagest.monalisa.rest.service.domain.RestBafDetail;
import com.pharmagest.monalisa.rest.service.domain.RestClientMinimal;
import com.pharmagest.monalisa.rest.service.domain.RestClientShort;
import com.pharmagest.monalisa.rest.service.domain.RestDecisionShort;
import com.pharmagest.monalisa.rest.service.domain.RestSchemaFinancierShort;
import com.pharmagest.monalisa.rest.service.domain.RestStatutShort;
import com.pharmagest.monalisa.rest.service.domain.apporteur.RestApporteurShortWithGroupe;
import com.pharmagest.monalisa.rest.service.domain.utilisateur.RestUtilisateurShort;

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

mapping.xml :

``` xml
 <converter type="com.pharmagest.monalisa.rest.service.mapper.DemandeSearchConverter">
                <class-a>com.pharmagest.monalisa.rest.entity.Demande</class-a>
                <class-b>com.pharmagest.monalisa.rest.service.domain.demande.RestDemandeSearch</class-b>
            </converter>
```

demandeSearchConverter.java :

``` java
package com.pharmagest.monalisa.rest.service.mapper;

import com.github.dozermapper.core.CustomConverter;
import com.github.dozermapper.core.MappingException;
import com.pharmagest.monalisa.rest.entity.Demande;
import com.pharmagest.monalisa.rest.mapper.mapstruct.StatutShortMapper;
import com.pharmagest.monalisa.rest.processus.IFactureProcessus;
import com.pharmagest.monalisa.rest.service.domain.RestBailleurDetail;
import com.pharmagest.monalisa.rest.service.domain.RestClientMinimal;
import com.pharmagest.monalisa.rest.service.domain.RestDecisionShort;
import com.pharmagest.monalisa.rest.service.domain.RestGroupeApporteurShort;
import com.pharmagest.monalisa.rest.service.domain.RestLoueurMinimal;
import com.pharmagest.monalisa.rest.service.domain.apporteur.RestApporteurShortWithGroupe;
import com.pharmagest.monalisa.rest.service.domain.demande.RestDemandeSearch;
import com.pharmagest.monalisa.rest.service.domain.utilisateur.RestUtilisateurShort;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

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

dans FactureProcessusImpl.java : 

``` java
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

après les tests