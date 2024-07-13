class Campaign {
  constructor() {
    this._cities = {};
    
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

  getLocationFolderOld = (k) => {
    return this._locationTypes[k].folder;
  }

  getLocationFolder = (locationType, parent) => {

    console.log("PARENT IS:");
    console.log(parent);

    console.log(this._cities[parent]);

    let cityFolder = this._cities[parent].folder;
    if(cityFolder) {
      cityFolder = cityFolder + "/" + parent;
      cityFolder = cityFolder.split(/\(|\)/).join("");
      return cityFolder;
    }

    return this._locationTypes[locationType].folder;
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

  cacheCities = (citiesResponse) => {
    this._cities = {};
    citiesResponse.array().forEach(c => {
      this._cities[c.file.name] = {
        folder: c.file.folder
      }
    });
  }

  getCities = () => {
    let values = [];
    app.plugins.plugins.dataview.withApi((dv) => {
      const cities = dv.pages('"Locations"').filter((c) => c.locationType == 'city');
      this.cacheCities(cities);
      values = cities.file.name.array()
    })
    return values
  }

  getValues = (whichPages, key) => {
    let values;
    app.plugins.plugins.dataview.withApi((dv) => {
      values = dv.pages(`"${whichPages}"`)[key].array();
      values = values.filter(this.onlyUnique);
      console.log(values);
    });
    return values;
  }

  getLatestSession = () => {
    let values;
    app.plugins.plugins.dataview.withApi((dv) => {
      values = dv.pages('"Session Recaps"').file.name.map((n) => {
        let d = n.split("-")[1];
        return parseInt(d);
      }).filter((n) => {
        return !isNaN(n);
      });
      values = values.array();
      console.log(values);      
    });
    values.sort((a, b) => a - b);
    console.log(values);
    values.reverse();

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
}