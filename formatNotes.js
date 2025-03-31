var ncp = require('ncp').ncp;
const fs = require('fs');
const glob = require('glob');
const { stringify } = require('yaml');
const matter = require('gray-matter');
const slugify = require('slugify');
const rimraf = require('rimraf');

let knownFileNames = {};

function replaceEmbeds(string) {
  const foundEmbeds = string.match(RegExp(/\!\[\[(.*?)\]\]/g));
  if (foundEmbeds) {
    foundEmbeds.forEach((e) => {
      if(e.match(/(\.jpe?g|\.png)/)) {
        const embedName = e.slice(3, -2);
        console.log(e);
        console.log(embedName);
        string = string.replace(e, `![](/assets/obsidian/${encodeURI(embedName)})`);
      } else {
        const embedName = e.slice(3, -2);
        string = string.replace(e, `**[[${embedName}]]**`);
      }
    });
  }
  return string;
}

function replaceScripts(string) {
  const searches = [
    [RegExp(/```dataviewjs[^`]*?listNPCs[^`]*?```/gm), 'npcs'],
    [RegExp(/```dataviewjs[^`]*?listPointsOfInterest[^`]*?```/gm), 'points_of_interest'],
    [RegExp(/```dataviewjs[^`]*?listAffiliations[^`]*?```/gm), 'affiliations']    
  ]

  searches.forEach((search) => {
    const [query, replacement] = search;
    const found = string.match(query);
    if (found) {
      string = string.replace(found, "{% include 'list-references.html', reference_data: " + replacement + " %}")
    }
  });

  return string;  
}

const inlineTagsRE = RegExp(/\[([\w ]+?)::\s*?([^\[]*?|\[\[(.*?)\]\].*?)\]/g);

function hoistTags(string) {
  const fileContent = matter(string);

  const foundTags = [...fileContent.content.matchAll(inlineTagsRE)];

  if (foundTags) {
    foundTags.forEach((e) => {
      let key = slugify(e[1]);
      let value = e[3] || e[2];

      if(fileContent.data[key]) {
        if(Array.isArray(fileContent.data[key])) {
          fileContent.data[key].push(value);
        } else {
          fileContent.data[key] = [fileContent.data[key], value];
        }
      } else {
        fileContent.data[key] = value;
      }

      fileContent.content = fileContent.content.replace(e[0], `<span class="dataview inline-field"><span class="inline-field-key">${e[1]}</span><span class="inline-field-value">${e[2]}</span></span>`)

    });
    string = `---\n${stringify(fileContent.data)}---\n${fileContent.content}`;

  }
  return string;
}

function transform(string) {
  string = replaceEmbeds(string);
  string = hoistTags(string);
  string = replaceScripts(string);

  return string;
}

const copyFilter = function(name) {
    if (name.match('.git')  || name.match('Templates')) {
      return false;
    }

    if(name.match('.obsidian')) {
      return false;
    }

    return true;
}

const copyTransformation = function(read, write, file) {
  const fileName = write.path.replace(process.cwd(), '');
  const pieces = fileName.split("/");
  let title = encodeURIComponent(pieces[pieces.length-1].split(".")[0]);

  if(!fileName.match('.obsidian')) {
    knownFileNames[title] = fileName;
  }

  read.pipe(write);
}

const cleanFiles = function() {
  return new Promise((resolve, reject) => {
    rimraf('notes', (err) => {
      if(err) {
        reject(err);
      }
      resolve();
    })
  }) 
}

const copyNotes = function() {
  return new Promise((resolve, reject) => {
    ncp('../Ninareth', 'notes', {
      filter: copyFilter,
      transform: copyTransformation
    }, function (err) {
      if (err) {
        reject(err)
      }
      resolve();
    });
  })
}

function updateFile(match) {
  return new Promise((resolve, reject) => {
    fs.readFile(match, 'utf-8', function(err, content) {
      if (err) {
        console.log("oh no!")
        console.log(err);
        reject(err);
      }
  
      const newContent = transform(content);
      fs.writeFile(match, newContent, 'utf8', function (err) {
        if (err) { reject(err) };
        resolve();
      });
      
    });
  
  })
}

function copyFiles() {
  cleanFiles()
    .then(copyNotes)
    .then(() => {
      return new Promise((resolve, reject) => {
        glob('notes/**/*.md', function(err, matches) {      
          if(err) {
            console.log("OH NO");
            reject(err);
          }
          resolve(matches);
        })
      });
    }).then((matches) => {
      return new Promise((resolve, reject) => {
        let ms = [];
        matches.forEach((match) => {
          ms.push(updateFile(match))
        });
        resolve(Promise.all(ms));
      })
    }).then(() => {
      ncp('../Ninareth/Scripts', 'assets/scripts', function(err) {
        if(err) {
          console.log("oh no!");
          console.log(err);
        }
      });
  
      ncp('../Ninareth/Files', 'assets/obsidian', {
        transform: (r, w) => {
          const directories = r.path.split("/");
          const assetFolder = directories[directories.length - 2];

          if(assetFolder !== 'Files') {
            w.path = w.path.replace(`/${assetFolder}`, "")
          }
          r.pipe(w);
        }
      }, function(err) {
        if(err) {
          console.log("oh no!");
          console.log(err);
        }
      });

      // get specifically the breadcrumbs data
      // ooooh i wonder if it saves the cache to disk somewhere....
      ncp('../Ninareth/.obsidian/plugins/breadcrumbs', 'notes/breadcrumbs-data', function(err) {
        if(err) {
          console.log("oh no!");
          console.log(err);
        }
      });
  
  
      ncp('notes_overrides', 'notes', function(err) {
        if(err) {
          console.log("oh no!");
          console.log(err);
        }
      });  
    })
}

copyFiles();