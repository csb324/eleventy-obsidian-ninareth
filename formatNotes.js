var ncp = require('ncp').ncp;
const fs = require('fs');
const glob = require('glob');
const { stringify } = require('yaml');
const matter = require('gray-matter');
const slugify = require('slugify');

let knownFileNames = {};

function replaceEmbeds(string) {
  const foundEmbeds = string.match(RegExp(/\!\[\[(.*?)\]\]/g));
  if (foundEmbeds) {
    foundEmbeds.forEach((e) => {
      if(e.match(/(\.jpe?g|\.png)/)) {
        const embedName = e.slice(3, -2);
        string = string.replace(e, `![](/notes/Files/${encodeURI(embedName)})`);
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
    console.log(foundTags);

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

function copyFiles() {
  ncp('../Ninareth', 'notes', {
    filter: function(name) {
      return !name.match('.git') && !name.match('Templates');
    },
    transform: function(read, write, file) {
      const fileName = write.path.replace(process.cwd(), '');
      const pieces = fileName.split("/");
      const title = pieces[pieces.length-1].split(".")[0];

      if(!fileName.match('.obsidian')) {
        knownFileNames[title] = fileName;
      }

      read.pipe(write);
    }
  }, function (err) {
    if (err) {
      return console.error(err);
    }

    glob('notes/**/*.md', function(err, matches) {
      if(err) {
        console.log("OH NO");
        console.log(err);
      }
  
      matches.forEach((match) => {
        fs.readFile(match, 'utf-8', function(err, content) {
          if (err) {
            console.log("oh no!")
            console.log(err);
            return;
          }
  
          fs.writeFile(match, transform(content), 'utf8', function (err) {
            if (err) return console.log(err);
          });
          
        });
      })
  
    });

    ncp('../Ninareth/Scripts', 'assets/scripts', function(err) {
      if(err) {
        console.log("oh no!");
        console.log(err);
      }
      console.log("Okay!")
    });

  });

  // readFiles('notes/', function (filename, content) {
  //   console.log(filename);
  //   // var newcontent=content.replace(/\n"\nauthor/,"\nauthor");
  //   var newcontent = replaceEmbeds(content);
  //   fs.writeFile(filename, newcontent, { encoding: 'utf8' },
  //     function () {
  //       console.log('OK ' + filename);
  //     }
  //   );
  // }, function (err) {
  //   throw err;
  // });


}

copyFiles();