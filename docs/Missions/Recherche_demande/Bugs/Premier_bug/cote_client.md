recherche-demandes.component.ts

modifie : 
````
searchPage(index: number) {
    const criteria: any = {
      currentProjection: 'projectionRechercheBackV2', au lieu de projectionRechercheBackV2
    };
    this.demandeDataSource.searchDemande(criteria, index);
  }
````