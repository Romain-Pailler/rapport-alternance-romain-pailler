
## demandeDao.java :

````java
  case DemandeCriteria.PROJECTION_RECHERCHE_BACK -> setProtections(demandeList);
                    case DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2 -> {
                        setProtections(demandeList);
                        setGroupesApporteursToApporteurs(demandeList);
                        setFacturesToDemandes(demandeList);
                    }
````           
retire le code suivant DemandeProjectionRechercheBackImpl.java     
````java
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
````
retire ça :  Q_STATUT.ordreTimeline)

créé nouveau fichier DemandeProjectionRechercheBackV2Impl.java

````java
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

public class DemandeProjectionRechercheBackV2Impl implements IProjection<Demande, DemandeSearchBuilder> {
    
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
    
    private static DemandeProjectionRechercheBackV2Impl INSTANCE = new DemandeProjectionRechercheBackV2Impl();
    
    private DemandeProjectionRechercheBackV2Impl() {
        
    }
    
    public static DemandeProjectionRechercheBackV2Impl getInstance() {
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
        return DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2;
    }
}
````


ajout dans ProjectionDemandeFactory.java // expliquer une factory

````java
 projections.add(DemandeProjectionRechercheBackV2Impl.getInstance());
````

ajout dans DemandeCriteria.java : 
````java
public static final String PROJECTION_RECHERCHE_BACK_V2 = "projectionRechercheBackV2";
````
dans le searchService.java 
````java
   if (DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2.equals(demandeCriteria.getCurrentProjection())) {
````

dans la fonction get
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
                    return Response.ok(new RestCollectionResult<>(mapper.mapList(demandes, RestDemandeSearch.class), demandeCriteria.getStartPage(), count)).build();
                } else {
                    final List<RestDemandeShort> restDemandes = setDetails(demandes, demandeCriteria, mapper.mapList(demandes, RestDemandeShort.class), from);
                    return Response.ok(new RestCollectionResult<>(restDemandes, demandeCriteria.getStartPage(), count)).build();
                }
            }
        }
    }
```