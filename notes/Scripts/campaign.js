class Campaign {

  constructor() {

    this._locationTypes = {
      "Country": {
        folder: "Locations/Countries",
        parentName: "region"
      },
      "City": {
        folder: "Locations/Cities\ and\ Towns",
        parentName: "country"
      },
      "Region": {
        folder: "Locations",
        parentName: "country"
      },
      "Place": {
        folder: "Locations",
        parentName: "city"
      }
    }

    this.locationTypes = Object.keys(this._locationTypes);
    this.locationFolders = Object.values(this._locationTypes).map((e) => e.folder);

    this.aliveStatuses = [
      "alive",
      "dead",
      "unknown"
    ]

    this.relationships = [
      "friend",
      "enemy",
      "neutral"
    ]
  }

  getLocationFolder = (k) => {
    return this._locationTypes[k].folder;
  }

  getLocationParent = (k) => {
    return this._locationTypes[k].parentName;
  }

  chooseLocationFolder = async (tp) => {
    const choice = await tp.system.suggester(this.locationFolders, this.locationFolders);
    if (!choice) {
        warn("No choice selected. Using 'Locations'");
        return 'Locations';
    }
    return choice;
}

  chooseTags = async (tp, prefix, defaultValue) => {
    let values = [];
    const filter = '#' + prefix;
    for (const itItem of Object.keys(app.metadataCache.getTags())) {
        if (itItem.startsWith(filter)) {
            values.push(itItem.substring(1));
        }
    }
    values.sort();
    values.unshift('--');
    const choice = await tp.system.suggester(values, values);
    if (!choice) {
        console.log(`No choice selected. Using ${defaultValue}`);
        return defaultValue;
    }
    return choice;
  }

  getCountries = () => {
    let countries = Object.keys(app.metadataCache.fileCache).filter((c) => { 
      return c.startsWith('Locations/Countries')
    });
    countries = countries.map((c) => {
      return c.split("Locations/Countries/")[1].split(".")[0]
    })
    return countries;
  }

  getLocations = () => {
    let countries = app.vault.getFiles().filter((c) => { 
      return c.path.startsWith('Locations/')
    });
    
    return countries.map((c) => c.basename);
  }

  getCities = () => {
    let cities = Object.keys(app.metadataCache.fileCache).filter((c) => { 
      return c.startsWith('Locations/Cities\ and\ Towns')
    });
    cities = cities.map((c) => {
      return c.split("Locations/Cities\ and\ Towns/")[1].split(".")[0]
    })
    return cities;
  }

  getValues = (whichPages, key) => {
    let values;
    app.plugins.plugins.dataview.withApi((dv) => {
      values = dv.pages()[key].array();
      values = values.filter(this.onlyUnique);
    });
    return values;
  }

  getLatestSession = () => {
    let values;
    app.plugins.plugins.dataview.withApi((dv) => {
      values = dv.pages('"Sessions"').file.name.map((n) => {
        let d = n.split("-")[1];
        return parseInt(d);
      }).filter((n) => {
        return !isNaN(n);
      });
      values = values.array().sort().reverse();
    });

    console.log(values);
    return values[0];
  }

  onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  lowerKebab = (name) => {
    return name
        .replace(/([a-z])([A-Z])/g, '$1-$2') // separate on camelCase
        .replace(/[\s_]+/g, '-') // replace all spaces and low dash
        .replace(/\'/, "") // ignore apostrophes
        .toLowerCase();        
  }


  /// DISPLAY SHORTCUTS

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