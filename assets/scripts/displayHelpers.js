class DisplayHelpers {
  listAffiliations = (dv) => {
    let affiliated = dv.pages('"People"')
      .where(p => p.Affiliation )
      .where((p) => this.subsetMatch(p, 'Affiliation', dv));
    dv.list(affiliated
      .sort(p => p.file.name, 'asc')
      .map(k => `[[${k.file.name}]]`)
    );
  }

  listNPCs = (dv) => {
    dv.list(dv.pages('"People"')
    .where((p) => {
      const isHome = this.subsetMatch(p, 'Home', dv);
      const isLocation = this.subsetMatch(p, 'Location', dv);
      const isWorkplace = this.subsetMatch(p, 'Workplace', dv);
      const isAlmaMater = this.subsetMatch(p, 'Alma Mater', dv);
      const isAffiliated = this.subsetMatch(p, 'Affiliation', dv);

      return isHome || isLocation || isWorkplace || isAlmaMater || isAffiliated;
    })
    .sort(p => p.file.name, 'asc')
    .map(k => `[[${k.file.name}]]`))
  }

  listPointsOfInterest = (dv) => {
    dv.list(
      dv.pages('"Locations"')
        .where((p) => {
          return this.subsetMatch(p, 'Location', dv)
        })
        .sort(p => p.file.name, 'asc')
        .map(k => `[[${k.file.name}]]`)
    )
  }


  subsetMatch = (p, property, dv) => {
    if(!p[property]) {
      return false;
    }

    let pageNames = [];
    let properties = p[property];

    console.log(p[property]);
    
    if(!Array.isArray(p[property])) {
      properties = [p[property]];
    }

    pageNames = properties.map((prop) => {
      if(prop.path) {
        return prop.path.split(/\/|\.md/);
      }
    })

    const pathParts = pageNames.flat();
    return pathParts.includes(dv.current().file.name)	   
  }
}
