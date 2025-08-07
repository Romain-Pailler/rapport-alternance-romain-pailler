```java title='DemandeDaoImpl.java'
case DemandeCriteria.PROJECTION_RECHERCHE_BACK -> setProtections(demandeList);
case DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2 -> {
            setProtections(demandeList);
            setGroupesApporteursToApporteurs(demandeList);
            setFacturesToDemandes(demandeList);
    }
```
ticket 
code complet 
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
                    case DemandeCriteria.PROJECTION_RECHERCHE_BACK -> setProtections(demandeList);
                    case DemandeCriteria.PROJECTION_RECHERCHE_BACK_V2 -> {
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
