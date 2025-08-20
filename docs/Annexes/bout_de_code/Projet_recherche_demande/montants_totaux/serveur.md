---
sidebar_label: Côté serveur - Code source
sidebar_position: 2
tags:
  - Java
  - Code
---

# Code source

## DemandeDaoImpl.java

```java
  @Override
    public BigDecimal getMontantTotalHTBeforeAttenteDePaiement(
            List<Long> demandeIds,
            Utilisateur utilisateur,
            String sensFacture
    ) {
        final QDemande qDemandeMaster = new QDemande("demandeMaster");
        final QStatut qStatutMaster = new QStatut("statutMaster");
        final QStatut qStatutSub = QStatut.statut;
        
        final Integer ordreTimelineAttentePaiement = createQuery()
                .select(qStatutSub.ordreTimeline)
                .from(qStatutSub)
                .where(qStatutSub.code.eq(Statut.ATTENTE_PAIEMENT))
                .fetchFirst();
        
        if (SensFacture.ACHAT.equals(sensFacture)) {
            final QSchemaFinancier qSchemaFinancierMaster = new QSchemaFinancier("schemaFinancierMaster");
            final JPQLQuery<BigDecimal> query = createQuery()
                    .from(qDemandeMaster)
                    .leftJoin(qDemandeMaster.statut, qStatutMaster)
                    .leftJoin(qDemandeMaster.schemaFinancier, qSchemaFinancierMaster)
                    .where(qDemandeMaster.id.in(demandeIds))
                    .where(qStatutMaster.ordreTimeline.lt(ordreTimelineAttentePaiement))
                    .select(qSchemaFinancierMaster.montantHT.sum());
            
            return query.fetchFirst() != null ? query.fetchFirst() : BigDecimal.ZERO;
        } else {
            final QDecision qDecisionMaster = new QDecision("decisionMaster");
            final JPQLQuery<BigDecimal> query = createQuery()
                    .from(qDemandeMaster)
                    .leftJoin(qDemandeMaster.statut, qStatutMaster)
                    .leftJoin(qDemandeMaster.accord, qDecisionMaster)
                    .where(qDemandeMaster.id.in(demandeIds))
                    .where(qStatutMaster.ordreTimeline.lt(ordreTimelineAttentePaiement))
                    .select(qDecisionMaster.montantHT.sum());
            BigDecimal result = query.fetchFirst();
            return result != null ? result : BigDecimal.ZERO;
        }
    }
    
    
    @Override
    public BigDecimal getMontantTotalHTFactureAfterAttenteDePaiement(
            List<Long> demandeIds,
            Utilisateur utilisateur,
            String sensFactureCode,
            List<String> sousTypeFactureCodes
    ) {
        final QDemande qDemandeMaster = new QDemande("demandeMaster");
        final QSensFacture qSensFactureMaster = new QSensFacture("sensFactureMaster");
        final QStatut qStatutMaster = new QStatut("statutMaster");
        final QSousTypeFacture qSousTypeFactureMaster = new QSousTypeFacture("sousTypeFactureMaster");
        final QFacture qFactureMaster = new QFacture("factureMaster");
        
        final QStatut qStatutSub = new QStatut("statutSub");
        
        final JPQLQuery<Void> query = createQuery();
        final BigDecimal result = query
                .from(qDemandeMaster)
                .leftJoin(qDemandeMaster.statut, qStatutMaster)
                .leftJoin(qDemandeMaster.factures, qFactureMaster)
                .leftJoin(qFactureMaster.sensFacture, qSensFactureMaster)
                .leftJoin(qFactureMaster.sousTypeFacture, qSousTypeFactureMaster)
                .where(qDemandeMaster.id.in(demandeIds))
                .where(qStatutMaster.ordreTimeline.goe(createQuery()
                        .select(qStatutSub.ordreTimeline)
                        .from(qStatutSub)
                        .where(qStatutSub.code.eq("attentePaiement"))))
                .where(qSensFactureMaster.code.eq(sensFactureCode))
                .where(qFactureMaster.dateComptabilisation.isNotNull())
                .where(qSousTypeFactureMaster.code.in(sousTypeFactureCodes))
                .select(qFactureMaster.montantTotalHT.sum())
                .fetchFirst();
        
        return result != null ? result : BigDecimal.ZERO;
    }
```

## IdemandeDao.java

````java
   
    /**
     * Calcule le montant total HT des demandes dont le statut est strictement antérieur
     * à « En attente de paiement », en fonction du sens facture (achat ou vente).
     * - Pour les factures de sens achat, le montant est issu du schéma financier.
     * - Pour les factures de sens vente, le montant est issu de la décision d'accord.
     *
     * @param demandeIds    les ids des demandes concernées
     * @param utilisateur l'utilisateur courant
     * @param sensFacture   
     * @return le montant total HT calculé, ou 0 si aucun résultat
     */
    BigDecimal getMontantTotalHTBeforeAttenteDePaiement(List<Long> demandeIds, Utilisateur utilisateur, String sensFacture);
    
    /**
     * Calcule le montant total HT des factures comptabilisées pour les demandes dont le statut
     * est « En attente de paiement » ou postérieur. Le calcul se base sur le sens et le sous-type
     * des factures sélectionnés.
     *
     * @param demandeIds    les ids des demandes concernées
     * @param utilisateur          l'utilisateur courant
     * @param sensFactureCode      le code du sens de facture (ex. : "ACHAT", "VENTE")
     * @param sousTypeFactureCodes la liste des codes de sous-types de facture à inclure
     * @return le montant total HT calculé, ou 0 si aucun résultat
     */
    BigDecimal getMontantTotalHTFactureAfterAttenteDePaiement(List<Long> demandeIds, Utilisateur utilisateur, String sensFactureCode, List<String> sousTypeFactureCodes);
}
````

## DemandeSearchResultDomain.java

````java

package com.pharmagest.monalisa.rest.processus.demande.domain;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Représente les montants totaux HT des factures achats et des ventes associés à un ensemble de demandes.
 *
 */
@Getter
@Setter
@AllArgsConstructor
public class DemandeSearchResultDomain {
    
    private BigDecimal montantTotalAchatHT;
    private BigDecimal montantTotalVenteHT;
}
````

## DemandeSearchProcessusImpl.java

````  @Override
    public DemandeSearchResultDomain getMontantSearchDemande(final DemandeCriteria criteria) {
        criteria.setPaginate(false);
        final List<Demande> demandes = searchByCriteria(criteria);
        final List<Long> demandeIds = demandes.stream().map(Demande::getId).toList();
        
        final BigDecimal montantTotalAchatHT = getMontantTotalAchatHTByCriteria(demandeIds);
        final BigDecimal montantTotalVenteHT = getMontantTotalVenteHTByCriteria(demandeIds);
        
        return new DemandeSearchResultDomain(montantTotalAchatHT, montantTotalVenteHT);
    }
    
    
    @Override
    public BigDecimal getMontantTotalAchatHTByCriteria(final List<Long> demandeIds) {
        return demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, currentUserProcessus.getCurrentUser(), SensFacture.ACHAT)
                .add(demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, currentUserProcessus.getCurrentUser(), SensFacture.ACHAT,
                        List.of(SousTypeFacture.ACQUISITION_AVOIR_ACHAT,SousTypeFacture.ACQUISITION_FACTURE_ACHAT, SousTypeFacture.ACQUISITION_EXTOURNE_ACHAT)));
    }
    
    @Override
    public BigDecimal getMontantTotalVenteHTByCriteria(final List<Long> demandeIds) {
        return demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, currentUserProcessus.getCurrentUser(), SensFacture.VENTE)
                .add(demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, currentUserProcessus.getCurrentUser(), SensFacture.VENTE,
                        List.of(SousTypeFacture.ACQUISITION_AVOIR_VENTE, SousTypeFacture.ACQUISITION_FACTURE_VENTE, SousTypeFacture.ACQUISITION_EXTOURNE_VENTE)));
    }
````

## IDemandeSearchProcessus.java

````java
  
    /**
     * Calcule et retourne les montants totaux HT (achat et vente) des demandes correspondant aux critères de recherche
     * La pagination est désactivée afin de récupérer l'ensemble des demandes correspondant aux critères.
     *
     * @param criteria les critères de recherche des demandes
     * @return un objet {@link DemandeSearchResultDomain} contenant les montants totaux HT des achats et des ventes
     */
    DemandeSearchResultDomain getMontantSearchDemande(final DemandeCriteria criteria);
    
    /**
     * Calcule le montant total HT des factures d'achat
     * Le calcul comprend :
     * - les montants HT des factures dont le statut est antérieur à "attente de paiement"
     * - les montants HT des factures après "attente de paiement", ayant pour sous-types de factures acquisiton avoir, facture et extourne
     *
     * @param demandeIds la liste des identifiants de demandes provenant de demandeCriteria
     * @return le montant total HT des achats pour les demandes spécifiées
     */
    BigDecimal getMontantTotalAchatHTByCriteria(final List<Long> demandeIds);
    
    /**
     * Calcule le montant total HT des factures de vente
     * Le calcul comprend :
     * - les montants HT des factures dont le statut est antérieur à "attente de paiement"
     * - les montants HT des factures après "attente de paiement", ayant pour sous-types de factures acquisiton avoir, facture et extourne
     *
     * @param demandeIds la liste des identifiants de demandes provenant de demandeCriteria
     * @return le montant total HT des ventes pour les demandes spécifiées
     */
    BigDecimal getMontantTotalVenteHTByCriteria(final List<Long> demandeIds);
 ````

## SearchService.java

```java
    
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
                    final DemandeSearchResultDomain montantsDemandes = demandeSearchProcessus.getMontantSearchDemande(demandeCriteria);
                    return Response.ok(new RestRechercheDemandeResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count,montantsDemandes.getMontantTotalAchatHT(),montantsDemandes.getMontantTotalVenteHT())).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
```

## RestRechercheDemandeResult.java

```java
/**
 * (C)Pharmagest Interactive<br>
 */
package com.pharmagest.monalisa.rest.service.domain.demande;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

/**
 * Structure permettant de sérializer en Json ou Xml une Liste d'objets<br/>
 *
 * @param <T>
 */
@XmlRootElement(name = "result")
@XmlType(name = "", propOrder = { "total", "offset", "size", "items", "montantTotalAchatHT", "montantTotalVenteHT" })
@XmlAccessorType(XmlAccessType.NONE)
public class RestRechercheDemandeResult<T>
        implements Serializable {
    
    static final long serialVersionUID = -4840376102016714753L;
    
    @XmlAttribute
    private Long total = 0L;
    
    @XmlAttribute
    private Long offset = 0L;
    
    @XmlAttribute
    private BigDecimal montantTotalAchatHT = BigDecimal.ZERO;
    
    @XmlAttribute
    private BigDecimal montantTotalVenteHT = BigDecimal.ZERO;
    
    @JsonProperty("list")
    @XmlElementWrapper(name = "list")
    private List<T> items;
    
    public RestRechercheDemandeResult() {
        super();
    }
    
    /**
     * Constructeur adapté lorsque l'on retourne exactement la liste, avec un offset à 0 et total = taille de la liste
     *
     * @param lst
     */
    public RestRechercheDemandeResult(final List<T> lst) {
        super();
        this.setItems(lst);
        this.setOffset(0);
        this.setTotal(this.getSize());
        this.setMontantTotalAchatHT(BigDecimal.ZERO);
        this.setMontantTotalVenteHT(BigDecimal.ZERO);
    }
    
    /**
     * Constructeur adapté lorsque l'on retourne la liste, avec un offset et total spécifié directement dans le
     * constructeur
     *
     * @param lst
     */
    public RestRechercheDemandeResult(final List<T> lst, final Long offset, final Long total, final BigDecimal montantTotalAchatHT, final BigDecimal montantTotalVenteHT) {
        super();
        this.setItems(lst);
        this.setOffset(offset);
        this.setTotal(total);
        this.setMontantTotalAchatHT(montantTotalAchatHT);
        this.setMontantTotalVenteHT(montantTotalVenteHT);
    }
    public BigDecimal getMontantTotalVenteHT() {
        return montantTotalVenteHT;
    }
    public void setMontantTotalVenteHT(final BigDecimal montantTotalVenteHT) {
        this.montantTotalVenteHT = montantTotalVenteHT;
    }
    
    public long getTotal() {
        return total;
    }
    
    public void setTotal(final long total) {
        this.total = total;
    }
    
    public long getOffset() {
        return offset;
    }
    
    public void setOffset(final long offset) {
        this.offset = offset;
    }
    
    public BigDecimal getMontantTotalAchatHT() {
        return montantTotalAchatHT;
    }
    
    public void setMontantTotalAchatHT(final BigDecimal montantTotalAchatHT) {
        this.montantTotalAchatHT = montantTotalAchatHT;
    }
    
    @JsonGetter
    public int getSize() {
        return items.size();
    }
    
    @JsonSetter
    public void setSize(final int size) {
        // on ne fait rien, c'est pour que le désérializer JSon sache qu'il ne doit rien faire de la property size
    }
    
    public List<T> getItems() {
        return items;
    }
    
    public void setItems(final List<T> result) {
        this.items = result;
    }
}
```

## SearchServiceIT.java

````java
 @Test
    public void itShouldSearchDemandesWithProjectionRechercheBack() {
        skipNextLaunch();
        
        // GIVEN
        final Facture factureAchat = FactureBuilder
                .create(this.randomDataGenerator)
                .build();
        
        final Facture factureVente = FactureBuilder
                .create(this.randomDataGenerator)
                .build();
        
        final Decision accord = DecisionBuilder.create(this.randomDataGenerator).withMontantHT(300).build();
        final SchemaFinancier schemaFinancier = SchemaFinancierBuilder.create(this.randomDataGenerator).withMontant(Long.valueOf(400)).build();
        final Statut statutAttentePaiement = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT).build();
        final Demande demande = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withUtilisateurCommercial(utilisateurBack)
                .withFactures(factureAchat, factureVente)
                .withAccord(accord)
                .withSchemaFinancier(schemaFinancier)
                .build();
        
        dbObjectExecuteWithReset(dataSource, utilisateurBack, demande,statutAttentePaiement);
        
        // WHEN
        Response response = getJerseyTarget()
                .path("demandes/search")
                .queryParam("currentProjection", DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2)
                .request(MediaType.APPLICATION_JSON_TYPE)
                .header(Constantes.AUTH_KEY_TOKEN,
                        SecurityHelper.createValidToken(
                                utilisateurBack.getEmail(),
                                utilisateurBack.getPassword()))
                .header(Constantes.AUTH_KEY_FROM, Constantes.AUTH_PARAM_BACK)
                .get();
        
        // THEN
        assertThat(response).hasCodeRetourOk();
        
        RestRechercheDemandeResult<RestDemandeSearch> result =
                response.readEntity(new GenericType<RestRechercheDemandeResult<RestDemandeSearch>>() {
                });
        
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems()).allSatisfy(rest -> {
            assertThat(rest.getId()).isEqualTo(demande.getId());
            assertThat(rest.getCode()).isEqualTo(demande.getCode());
        });
        assertThat(result.getMontantTotalAchatHT()).isEqualByComparingTo(schemaFinancier.getMontantHT());
        assertThat(result.getMontantTotalVenteHT()).isEqualByComparingTo(accord.getMontantHT());
    }
````

## DemandeDao_getMontantTotalHTAchatBeforeAttenteDePaiementByCriteriaIT.java

````java
package com.pharmagest.monalisa.rest.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import javax.sql.DataSource;
import javax.transaction.Transactional;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.pharmagest.monalisa.common.dbobject.*;
import com.pharmagest.monalisa.configtest.DaoTestConfiguration;
import com.pharmagest.monalisa.rest.dao.IDemandeDao;
import com.pharmagest.monalisa.rest.entity.*;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;
import com.pharmagest.monalisa.rest.tools.CommonAction;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DaoTestConfiguration.class)
@Transactional
public class DemandeDao_getMontantTotalHTAchatBeforeAttenteDePaiementByCriteriaIT extends CommonAction {
    
    @Autowired
    DataSource dataSource;
    
    @Autowired
    IDemandeDao demandeDao;
    
    private Utilisateur utilisateur;
    private SchemaFinancier schemaFinancier1;
    private Demande demandePerimetre;
    private Demande demandeHorsPerimetre;
    
    @Before
    public void setUp() {
        final Loueur loueur = LoueurBuilder.create(this.randomDataGenerator, Loueur.NANCEO).build();
        final GroupeApporteur groupeApporteur = GroupeApporteurBuilder.create(this.randomDataGenerator).build();
        final Apporteur apporteur = ApporteurBuilder.create(this.randomDataGenerator).withLoueur(loueur).withGroupeApporteur(groupeApporteur).build();
        utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator).withRoles(
                RoleBuilder.create(this.randomDataGenerator, Role.SUPER_ADMIN)
                        .withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                        .build()
        ).withApporteurs(apporteur).build();
        final Statut statutAttentePaiement = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT).build();
        final Statut statutOK = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ACCORD).build();
        final Statut statutHorsCritere = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ANNULE).build();
        
        // Deux schemas financiers avec montants différents
        schemaFinancier1 = SchemaFinancierBuilder.create(this.randomDataGenerator).withMontant(Long.valueOf(1000)).build();
        final SchemaFinancier schemaFinancier2 = SchemaFinancierBuilder.create(this.randomDataGenerator).withMontant(Long.valueOf(2000)).build();
        
        demandePerimetre = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withStatut(statutOK)
                .withSchemaFinancier(schemaFinancier1)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        demandeHorsPerimetre = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withStatut(statutHorsCritere)
                .withSchemaFinancier(schemaFinancier2)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        dbObjectExecuteWithReset(dataSource, demandePerimetre, demandeHorsPerimetre, loueur, groupeApporteur, apporteur, utilisateur, statutOK, statutHorsCritere, schemaFinancier1, schemaFinancier2, statutAttentePaiement);
    }
    @Test
    public void itShouldReturnMontantTotalHTAchatForDemandesBeforeAttenteDePaiement() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(demandePerimetre.getId(), demandeHorsPerimetre.getId());
        
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, utilisateur, SensFacture.ACHAT);
        
        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(schemaFinancier1.getMontantHT());
    }
    
    @Test
    public void itShouldReturnZeroWhenNoDemandesMatch() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(Long.valueOf("123456"));
        
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, utilisateur, SensFacture.ACHAT);
        
        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
````

## DemandeDao_getMontantTotalHTAfterAttenteDePaiementByCriteriaIT.java

````java
package com.pharmagest.monalisa.rest.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.sql.DataSource;
import javax.transaction.Transactional;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.pharmagest.monalisa.common.dbobject.*;
import com.pharmagest.monalisa.configtest.DaoTestConfiguration;
import com.pharmagest.monalisa.rest.dao.IDemandeDao;
import com.pharmagest.monalisa.rest.entity.*;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;
import com.pharmagest.monalisa.rest.tools.CommonAction;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DaoTestConfiguration.class)
@Transactional
public class DemandeDao_getMontantTotalHTAfterAttenteDePaiementByCriteriaIT extends CommonAction {
    
    @Autowired
    DataSource dataSource;
    
    @Autowired
    IDemandeDao demandeDao;
    
    
    private Utilisateur utilisateur;
    private Demande demandeWithFactures;
    private Demande demandeWithoutFactures;
    
    @Before
    public void setUp() {
        final Loueur loueur = LoueurBuilder.create(this.randomDataGenerator, Loueur.NANCEO).build();
        final GroupeApporteur groupeApporteur = GroupeApporteurBuilder.create(this.randomDataGenerator).build();
        final Apporteur apporteur = ApporteurBuilder.create(this.randomDataGenerator).withLoueur(loueur).withGroupeApporteur(groupeApporteur).build();
        utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator).withRoles(
                RoleBuilder.create(this.randomDataGenerator, Role.SUPER_ADMIN)
                        .withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                        .build()
        ).withApporteurs(apporteur).build();
        
        final Statut statutOK = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT)
                .build();
        
        final Statut  statutHorsCritere = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ETUDE)
                .build();
        
        final SousTypeFacture sousTypeFacture = SousTypeFactureBuilder.create(this.randomDataGenerator, SousTypeFacture.ACQUISITION_FACTURE_ACHAT)
                .build();
        
        final SensFacture sensFacture = SensFactureBuilder.create(this.randomDataGenerator, SensFacture.ACHAT)
                .build();
        final Date dateComptabilisation = Calendar.getInstance().getTime();
        
        final Facture factureAchat = FactureBuilder.create(this.randomDataGenerator)
                .withDateComptabilisation(dateComptabilisation)
                .withSousTypeFacture(sousTypeFacture)
                .withSensFacture(sensFacture)
                .build();
        final SensFacture sensFactureVente = SensFactureBuilder.create(this.randomDataGenerator, SensFacture.VENTE).build();
        
        final Facture factureVente = FactureBuilder.create(this.randomDataGenerator)
                .withDateComptabilisation(dateComptabilisation)
                .withSousTypeFacture(SousTypeFactureBuilder.create(this.randomDataGenerator, SousTypeFacture.ACQUISITION_FACTURE_VENTE).build())
                .withSensFacture(sensFactureVente)
                .build();
        
        demandeWithFactures = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withFactures(factureAchat,factureVente)
                .withStatut(statutOK)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        demandeWithoutFactures = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withStatut(statutHorsCritere)
                .withUtilisateurCommercial(utilisateur)
                .build();
        dbObjectExecuteWithReset(dataSource, demandeWithFactures, demandeWithoutFactures);
    }
    @Test
    public void itShouldReturnMontantTotalHTAchatForDemandesAfterAttenteDePaiement() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(demandeWithFactures.getId(), demandeWithoutFactures.getId());
        
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, utilisateur, SensFacture.ACHAT,
                List.of(SousTypeFacture.ACQUISITION_AVOIR_ACHAT,SousTypeFacture.ACQUISITION_FACTURE_ACHAT, SousTypeFacture.ACQUISITION_EXTOURNE_ACHAT));
        
        // THEN
        final BigDecimal expectedMontantHT = demandeWithFactures.getFactures().stream()
                
                .filter(facture -> SensFacture.ACHAT.equals(facture.getSensFacture().getCode()))
                .flatMap(singleFacture -> singleFacture.getLignesFacture().stream())
                .map(lf -> lf.getMontantHT()).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(expectedMontantHT);
    }
    
    @Test
    public void itShouldReturnZeroWhenNoDemandesMatchAchat() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(Long.valueOf(12345));

        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, utilisateur, SensFacture.ACHAT,
                List.of(SousTypeFacture.ACQUISITION_AVOIR_ACHAT,SousTypeFacture.ACQUISITION_FACTURE_ACHAT, SousTypeFacture.ACQUISITION_EXTOURNE_ACHAT));

        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }
    @Test
    public void itShouldReturnMontantTotalHTVenteForDemandesAfterAttenteDePaiement() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(demandeWithFactures.getId(), demandeWithoutFactures.getId());
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, utilisateur, SensFacture.VENTE,
                List.of(SousTypeFacture.ACQUISITION_AVOIR_VENTE, SousTypeFacture.ACQUISITION_FACTURE_VENTE, SousTypeFacture.ACQUISITION_EXTOURNE_VENTE));

        // THEN
        final BigDecimal expectedMontantHT = demandeWithFactures.getFactures().stream()
                .filter(facture -> SensFacture.VENTE.equals(facture.getSensFacture().getCode()))
                .flatMap(singleFacture -> singleFacture.getLignesFacture().stream())
                .map(lf -> lf.getMontantHT()).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(expectedMontantHT);
    }

    @Test
    public void itShouldReturnZeroWhenNoDemandesMatchVente() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(Long.valueOf(12345));

        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTFactureAfterAttenteDePaiement(demandeIds, utilisateur, SensFacture.VENTE,
                List.of(SousTypeFacture.ACQUISITION_AVOIR_VENTE, SousTypeFacture.ACQUISITION_FACTURE_VENTE, SousTypeFacture.ACQUISITION_EXTOURNE_VENTE));

        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
````

## DemandeDao_getMontantTotalHTVenteBeforeAttenteDePaiementByCriteriaIT.java

````java
package com.pharmagest.monalisa.rest.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import javax.sql.DataSource;
import javax.transaction.Transactional;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.pharmagest.monalisa.common.dbobject.*;
import com.pharmagest.monalisa.configtest.DaoTestConfiguration;
import com.pharmagest.monalisa.rest.dao.IDemandeDao;
import com.pharmagest.monalisa.rest.entity.*;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;
import com.pharmagest.monalisa.rest.tools.CommonAction;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DaoTestConfiguration.class)
@Transactional
public class DemandeDao_getMontantTotalHTVenteBeforeAttenteDePaiementByCriteriaIT extends CommonAction {
    
    @Autowired
    DataSource dataSource;
    
    @Autowired
    IDemandeDao demandeDao;
    
    private Utilisateur utilisateur;
    private Decision accord1;
    private Demande demandeDansPerimetre;
    private Demande demandeHorsPerimetre;
    
    @Before
    public void setUp() {
        final Loueur loueur = LoueurBuilder.create(this.randomDataGenerator, Loueur.NANCEO).build();
        final GroupeApporteur groupeApporteur = GroupeApporteurBuilder.create(this.randomDataGenerator).build();
        final Apporteur apporteur = ApporteurBuilder.create(this.randomDataGenerator).withLoueur(loueur).withGroupeApporteur(groupeApporteur).build();
        utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator).withRoles(
                RoleBuilder.create(this.randomDataGenerator, Role.SUPER_ADMIN)
                        .withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                        .build()
        ).withApporteurs(apporteur).build();
        
        final Statut statutOK = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ACCORD).build();
        final Statut statutHorsCritere = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ANNULE).build();
        final Statut statutAttentePaiement = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT).build();
        // Deux accords avec montants différents
        accord1 = DecisionBuilder.create(this.randomDataGenerator).withMontantHT(1000).build();
        final Decision  accord2 = DecisionBuilder.create(this.randomDataGenerator).withMontantHT(2000).build();
        
        demandeDansPerimetre = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withStatut(statutOK)
                .withAccord(accord1)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        demandeHorsPerimetre = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(apporteur)
                .withStatut(statutHorsCritere)
                .withAccord(accord2)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        dbObjectExecuteWithReset(dataSource, demandeDansPerimetre, demandeHorsPerimetre, loueur, groupeApporteur, apporteur, utilisateur, statutAttentePaiement, statutOK, statutHorsCritere, accord1,
                accord2);
    }
    @Test
    public void itShouldReturnMontantTotalHTAchatForDemandesBeforeAttenteDePaiement() {
        // GIVEN
        List<Long> demandeIds = Arrays.asList(demandeDansPerimetre.getId(), demandeHorsPerimetre.getId());
        
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, utilisateur, SensFacture.VENTE);
        
        
        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(accord1.getMontantHT());
    }
    
    @Test
    public void itShouldReturnZeroWhenNoDemandesMatch() {
        List<Long> demandeIds = Arrays.asList(Long.valueOf(123456));
        // WHEN
        BigDecimal result = demandeDao.getMontantTotalHTBeforeAttenteDePaiement(demandeIds, utilisateur, SensFacture.VENTE);
        
        // THEN
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
````

## DemandeSearchProcessus_getMontantTotalAchatHTByCriteriaIT.java

````java
package com.pharmagest.monalisa.rest.processus.demande;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.sql.DataSource;

import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.pharmagest.monalisa.common.dbobject.*;
import com.pharmagest.monalisa.configtest.ProcessusTestContext;
import com.pharmagest.monalisa.core.processus.user.CurrentUserProcessus;
import com.pharmagest.monalisa.rest.entity.*;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;

@RunWith(SpringJUnit4ClassRunner.class)
public class DemandeSearchProcessus_getMontantTotalAchatHTByCriteriaIT extends ProcessusTestContext {
    
    @Autowired
    DataSource dataSource;
    
    @Autowired
    IDemandeSearchProcessus demandeSearchProcessus;
    
    @Autowired
    CurrentUserProcessus currentUserProcessus;
    
    private Utilisateur utilisateur;
    private Demande demandeBefore;
    private Demande demandeAfter;
    private SchemaFinancier schemaFinancier;
    
    @Before
    public void setUp()
            throws Exception {
        // Création utilisateur avec droits
        final Role role = RoleBuilder.create(this.randomDataGenerator, "ROLE_RECHERCHE_DOSSIERS")
                .withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                .build();
        utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator)
                .withApporteurs()
                .withRoles(role)
                .build();
        
        // Statuts
        final Statut statutBefore = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ETUDE).build();
        final Statut statutAfter = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT).build();
        
        // Sens / sous-type facture
        final SousTypeFacture sousTypeFacture = SousTypeFactureBuilder.create(this.randomDataGenerator, "ACQUISITION_FACTURE_ACHAT").build();
        final SensFacture sensFacture = SensFactureBuilder.create(this.randomDataGenerator, SensFacture.ACHAT).build();
        
        final Date dateComptabilisation = Calendar.getInstance().getTime();
        
        schemaFinancier = SchemaFinancierBuilder.create(this.randomDataGenerator).build();
        final Facture factureAfter = FactureBuilder.create(this.randomDataGenerator)
                .withDateComptabilisation(dateComptabilisation)
                .withSousTypeFacture(sousTypeFacture)
                .withSensFacture(sensFacture)
                .build();
        
        // Demandes
        demandeBefore = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(utilisateur.getApporteurs().stream().findFirst().orElseThrow())
                .withSchemaFinancier(schemaFinancier)
                .withStatut(statutBefore)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        demandeAfter = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(utilisateur.getApporteurs().stream().findFirst().orElseThrow())
                .withFactures(factureAfter)
                .withStatut(statutAfter)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        dbObjectExecuteWithReset(dataSource, demandeBefore, demandeAfter);
    }
    @Test
    public void itShouldReturnTotalMontantHTAchat() {
        currentUserProcessus.loginUser(utilisateur);
        List<Long> demandeIds = Arrays.asList(demandeAfter.getId(), demandeBefore.getId());
        
        BigDecimal total = demandeSearchProcessus.getMontantTotalAchatHTByCriteria(demandeIds);
        
        final BigDecimal expectedMontantHTAfter = demandeAfter.getFactures().stream()
                .flatMap(singleFacture -> singleFacture.getLignesFacture().stream())
                .map(lf -> lf.getMontantHT()).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        final BigDecimal expectedMontantHT = expectedMontantHTAfter.add(schemaFinancier.getMontantHT());
        Assertions.assertThat(total).isNotNull();
        Assertions.assertThat(total).isEqualByComparingTo(expectedMontantHT);
    }
}

````

## DemandeSearchProcessus_getMontantTotalVenteHTByCriteriaIT.java

````java
package com.pharmagest.monalisa.rest.processus.demande;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.sql.DataSource;

import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.pharmagest.monalisa.common.dbobject.*;
import com.pharmagest.monalisa.configtest.ProcessusTestContext;
import com.pharmagest.monalisa.core.processus.user.CurrentUserProcessus;
import com.pharmagest.monalisa.rest.entity.*;
import com.pharmagest.monalisa.rest.entity.criteria.DemandeCriteria;

@RunWith(SpringJUnit4ClassRunner.class)
public class DemandeSearchProcessus_getMontantTotalVenteHTByCriteriaIT extends ProcessusTestContext {
    
    @Autowired
    DataSource dataSource;
    
    @Autowired
    IDemandeSearchProcessus demandeSearchProcessus;
    
    @Autowired
    CurrentUserProcessus currentUserProcessus;
    
    private Utilisateur utilisateur;
    private Demande demandeBefore;
    private Demande demandeAfter;
    private Decision accord;
    
    @Before
    public void setUp()
            throws Exception {
        final Role role = RoleBuilder.create(this.randomDataGenerator, "ROLE_RECHERCHE_DOSSIERS")
                .withDroits(DroitBuilder.create(this.randomDataGenerator, Droit.RECHERCHER_TOUS_DOSSIERS).build())
                .build();
        utilisateur = UtilisateurBuilder.createUtilisateurFront(this.randomDataGenerator)
                .withApporteurs()
                .withRoles(role)
                .build();
        
        // Statuts
        final Statut statutBefore = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ETUDE).build();
        final Statut statutAfter = StatutBuilder.create(this.randomDataGenerator, Statut.StatutEnum.ATTENTE_PAIEMENT).build();
        
        // Sens / sous-type facture
        final SousTypeFacture sousTypeFacture = SousTypeFactureBuilder.create(this.randomDataGenerator, "ACQUISITION_FACTURE_VENTE").build();
        final SensFacture sensFacture = SensFactureBuilder.create(this.randomDataGenerator, SensFacture.VENTE).build();
        
        final Date dateComptabilisation = Calendar.getInstance().getTime();
        
        accord = DecisionBuilder.create(this.randomDataGenerator).build();
        final Facture factureAfter = FactureBuilder.create(this.randomDataGenerator)
                .withDateComptabilisation(dateComptabilisation)
                .withSousTypeFacture(sousTypeFacture)
                .withSensFacture(sensFacture)
                .build();
        
        // Demandes
        demandeBefore = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(utilisateur.getApporteurs().stream().findFirst().orElseThrow())
                .withAccord(accord)
                .withStatut(statutBefore)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        demandeAfter = DemandeBuilder.create(this.randomDataGenerator)
                .withApporteur(utilisateur.getApporteurs().stream().findFirst().orElseThrow())
                .withFactures(factureAfter)
                .withStatut(statutAfter)
                .withUtilisateurCommercial(utilisateur)
                .build();
        
        dbObjectExecuteWithReset(dataSource, demandeBefore, demandeAfter);
    }
    @Test
    public void itShouldReturnTotalMontantHTVente() {
        currentUserProcessus.loginUser(utilisateur);
        List<Long> demandeIds = Arrays.asList(demandeBefore.getId(), demandeAfter.getId());
        
        BigDecimal total = demandeSearchProcessus.getMontantTotalVenteHTByCriteria(demandeIds);
        
        final BigDecimal expectedMontantHTAfter = demandeAfter.getFactures().stream()
                .flatMap(singleFacture -> singleFacture.getLignesFacture().stream())
                .map(lf -> lf.getMontantHT()).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        final BigDecimal expectedMontantHT = expectedMontantHTAfter.add(accord.getMontantHT());
        Assertions.assertThat(total).isNotNull();
        Assertions.assertThat(total).isEqualByComparingTo(expectedMontantHT);
    }
}
````
