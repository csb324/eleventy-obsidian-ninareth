module.exports = function(eleventyConfig) {
    const markdownIt = require('markdown-it');
    const markdownItOptions = {
        html: true,
        linkify: true,
        breaks: true
    };

    const knownFileNames = {};


    eleventyConfig.addFilter("getRandom", function(items, filterTag) {
        let possible = [...items];  
        if(filterTag) {
            possible = possible.filter((i) => {
                return i.data.tags.includes(filterTag); 
            })
        }
        let selected = possible[Math.floor(Math.random() * possible.length)];
        return selected;
    })

    eleventyConfig.addCollection("sessions", function(collection) {
        return collection.getFilteredByGlob("notes/Session Recaps/*.md").sort((a, b) => {
            const aIndex = parseInt(a.fileSlug.split("-")[1]);
            const bIndex = parseInt(b.fileSlug.split("-")[1]);            
            return bIndex - aIndex;
        }).filter((s) => s.data.type == "session").map((sesh) => {
            const markdown = sesh.template.inputContent;
            const searchFor = /# session \d+.*$/gmi;
            const result = markdown.match(searchFor);
            if(result) {
                sesh.data.sessionTitle = result[0].replace("# ", "");
            } else {
                sesh.data.sessionTitle = sesh.data.title;
            }
            return sesh;
        });
    });


    eleventyConfig.addCollection("notes", function (collection) {
        const c =  collection.getFilteredByGlob(["notes/**/*.md", "index.md"])
            .filter((item) => {
                return !item.template.frontMatter.data.private;
            });

        c.forEach((note) => {
            knownFileNames[note.fileSlug.toLowerCase()] = note.filePathStem;
        })

        return c;        
    });

    eleventyConfig.addCollection("pcs", function(collection) {
        return collection.getFilteredByGlob("notes/People/PCs/*.md");
    });


    const md = markdownIt(markdownItOptions)
    .disable('code')
    .use(require('markdown-it-footnote'))
    .use(require('markdown-it-attrs'))
    .use(require('markdown-it-include'))
    .use(function(md) {
        // Recognize Mediawiki links ([[text]])
        md.linkify.add("[[", {
            validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
            normalize: match => {

                const parts = match.raw.slice(2,-2).split("|");
                parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, "");

                if(parts[0].split(".")[1] == "jpg") {
                    return;
                }

                match.text = (parts[1] || parts[0]).trim();
                let url = parts[0].trim()
                const urlParts = url.split("#");

                if(urlParts[1]) {
                    url = urlParts[0].trim();
                }
                
                const urlFlat = url.split("\/");
                if(urlFlat.length > 1) {
                    url = urlFlat[urlFlat.length - 1];
                }

                if(knownFileNames[url.toLowerCase()]) {
                    let href = knownFileNames[url.toLowerCase()];
                    if(urlParts[1]) {
                        href += "#"
                        href += urlParts[1];
                    }
                    match.url = href;
                } else {
                    console.log("CANNOT FIND IT: " + url)
                    match.url = '#'
                }
            }
        })
    })
    
    eleventyConfig.addFilter("markdownify", (string) => {
        return md.render(string)
    })

    eleventyConfig.setLibrary('md', md);

    eleventyConfig.addPassthroughCopy('assets');
    // eleventyConfig.addPassthroughCopy('notes/files');
    eleventyConfig.setUseGitIgnore(false);

    return {
        dir: {
            input: "./",
            output: "_site",
            layouts: "layouts",
            includes: "includes",
            data: "_data"
        },
        passthroughFileCopy: true,
        dataTemplateEngine: "liquid"
    }
}
