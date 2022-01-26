class DisplayHelpers {
  listAffiliations = (dv) => {
    let affiliated = dv.pages('"People"')
      .where(p => p.Affiliation )
      .where(p => p.Affiliation.path )
      .where((p) => this.subsetMatch(p, 'Affiliation', dv));
    dv.list(affiliated
      .sort(p => p.file.name, 'asc')
      .map(k => `[[${k.file.name}]]`)
    );
  }

  listNPCs = (dv) => {
    dv.list(dv.pages('"People"')
    .where((p) => {
      const isHome = (p.Home && p.Home.path == dv.current().file.name);
      const isLocation = this.subsetMatch(p, 'Location', dv);
      const isWorkplace = this.subsetMatch(p, 'Workplace', dv);
      const isAlmaMater = this.subsetMatch(p, 'Alma Mater', dv);
      return isHome || isLocation || isWorkplace || isAlmaMater;
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
    if(dv.isArray(p[property])) {
      return p[property].path.includes(dv.current().file.name)	
    } else {
      return p[property].path == dv.current().file.name
    }
  }
}
