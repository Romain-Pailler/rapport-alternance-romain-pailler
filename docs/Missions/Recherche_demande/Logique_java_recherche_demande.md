# expliquer comment marche la logique pour rechercher les demandes (existant)

## SearchService (recoit l'appel api)
````java
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
````

## DemandeSearchProcessus
````java

    @Override
    @Transactional(noRollbackFor = MonaLisaFunctionalException.class, readOnly = true)
    public List<Demande> searchByCriteria(final DemandeCriteria demandeCriteria, final boolean initialize) {
        final Utilisateur currentUser = currentUserProcessus.getCurrentUser();
        filterSearch(demandeCriteria, currentUser);
        
        final List<Demande> demandes = demandeDao.searchByCriteria(demandeCriteria, currentUser);
        
        for (final Demande demande : demandes) {
            if (demande != null) {
                if (initialize) {
                    Hibernate.initialize(demande.getDerogations());
                    Hibernate.initialize(demande.getTaches());
                    Hibernate.initialize(demande.getPaiements());
                    Hibernate.initialize(demande.getInfoCommissionBailleur());
                    Hibernate.initialize(demande.getTags());
                    if (demande.getAccord() != null) {
                        Hibernate.initialize(demande.getAccord().getConditions());
                        Hibernate.initialize(demande.getAccord().getBailleur());
                    }
                    for (final Tache tache : tacheProcessus.findByDemande(demande.getCode())) {
                        Hibernate.initialize(tache.getTypesTache());
                    }
                } else {
                    demande.setDerogations(derogationProcessus.findByCodeDemande(demande.getCode(), true));
                }
                
            }
        }
        
        return demandes;
    }
````
## DemandeDao.java

````java

    @Override
    public List<Demande> searchByCriteria(final DemandeCriteria demandeCriteria, final Utilisateur utilisateur) {
        
        final DemandeCriteria criteria = Objects.isNull(demandeCriteria) ? new DemandeCriteria() : demandeCriteria;
        
        checkUserAccess(criteria, utilisateur);
        
        final DemandeSearchBuilder demandeSearchBuilder = new DemandeSearchBuilder(createQuery(), criteria, utilisateur);
        
        if (criteria.getCodePreSelection() != null) {
            demandeSearchBuilder.addAllWhereWithoutStatuts();
        } else {
            demandeSearchBuilder.addAllWhere();
        }
        
        demandeSearchBuilder.distinct().offset().limit();
        
        addPreselections(criteria, demandeSearchBuilder);
        
        demandeSearchBuilder.addAllOrderBy();
        
        List<Demande> demandes = demandeSearchBuilder.fetch();
        
        demandes = filterByRule(demandes, criteria);
        
        return setEntitesByProjection(demandes, criteria, utilisateur);
    }
````

## DemandeSearchBuilder.java (enorme fichier qui permet de construire une requete avec tout les critères possibles implémenter au fur et à mesure des besoins)

````java
  public DemandeSearchBuilder addAllWhereWithoutStatuts() {
        return whereAvecDecisionAccord()
                .whereAvecRentFree()
                .whereApporteursId()
                .whereBailleurId()
                .whereCategoriesTache()
                .whereOriginesTache()
                .whereClientId()
                .whereCode()
                .whereCodes()
                .whereCoefficientNegocie()
                .whereCodeCIP()
                .whereCodeLoueur()
                .whereConditionDecision()
                .whereDateAccordBetween()
                .whereDateAttentePaiementBetween()
                .whereDateChangementStatutToBetween()
                .whereDateCreationBetween()
                .whereDateDecisionBetween()
                .whereDateFinContratBetween()
                .whereDateFinBailleurBetweenAndTypeSelection()
                .whereDatePaiementBetween()
                .whereDatePremierLoyerBailleurBetweenAndTypeSelection()
                .whereDatePremierLoyerBetween()
                .whereDateRefusBetween()
                .whereDecisionPubliable()
                .whereDemandesId()
                .whereDocumentLu()
                .whereLoueurId()
                .whereNumVirement()
                .whereRaisonSociale()
                .whereRefApporteur()
                .whereRefBailleur()
                .whereRetardPaiement()
                .wherePremierNumeroIdentification()
                .whereSecondNumeroIdentification()
                .whereStatutsDecision()
                .whereStatutsContrat()
                .whereTacheLue()
                .whereTacheOuverte()
                .whereTacheVisibiliteFront()
                .whereTags()
                .whereUtilisateurAdvFrontId()
                .whereUtilisateurApporteurId()
                .whereIncidentPaiement()
                .whereUtilisateurBoId()
                .whereUtilisateurCommercialId()
                .whereNumVirement()
                .whereLoueurId()
                .whereDatePremierLoyerGoeDateDebut()
                .whereDatePremierLoyerLoeDateFin()
                .whereClientId()
                .whereTransferable()
                .whereCodePeriodiciteBaremeApporteur()
                .whereDureePeriodiciteBaremeApporteur()
                .whereBaremeApporteurIsNot()
                .whereIsSansVerrou()
                .whereMontantDemandeInTranchesBaremeApporteur()
                .whereValeurInterruptionPubliee()
                .whereCodePortefeuille()
                .whereIdGroupeApporteur()
                .whereCodeSpecificiteApporteur()
                .whereCodesStatutFront()
                .whereESignature()
                .whereUtilisateurAdvBackApporteurId()
                .whereUtilisateurComBackApporteurId()
                .whereUtilisateurResponsableBackApporteurId()
                .whereHasAcompte()
                .whereMoisBooking()
                .whereEligibiliteProtection()
                .whereStatutProtection()
                .whereMandatSepaLoueurId();
    }
````