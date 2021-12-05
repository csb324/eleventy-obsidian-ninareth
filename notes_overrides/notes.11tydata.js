const {titleCase} = require("title-case");
const breadcrumbData = require('./breadcrumbs_data/data.json');

const wikilinkRegExp = /\[\[\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g

function caselessCompare(a, b) {
    return a.toLowerCase() === b.toLowerCase();
}

subsetMatch = (p, property, filename) => {
    if(!p[property]) {
        return false;
    }

    if(Array.isArray(p[property])) {
        return p[property].includes(filename)	
    } else {
        return p[property] == filename
    }
}

const onlyPeople = (note) => {
    if(!note.template.frontMatter.data.tags) {
        return false;
    }
    return note.template.frontMatter.data.tags.includes('npc') || note.template.frontMatter.data.tags.includes('PC');
}

module.exports = {
    layout: "note.html",
    type: "note",
    eleventyComputed: {
        title: data => titleCase(data.title || data.page.fileSlug),
        points_of_interest: (data) => {
            const notes = data.collections.notes;            
            const currentFileSlug = data.page.fileSlug;            
            let locations = [];

            locations = notes.filter((note) => {
                return note.template.frontMatter.data.type == 'location';
            }).filter((note) => {
                return subsetMatch(note.template.frontMatter.data, 'Location', currentFileSlug);
            }).map((note) => {
                return {
                    url: note.url,
                    title: note.data.title,
                }
            });

            return locations;
        },
        breadcrumbs: (data) => {
            let breadcrumbs = [];
            const notes = data.collections.notes;            
            const breadcrumbParents = breadcrumbData.userHiers.map(e => e["up"]).flat();

            breadcrumbParents.forEach((parentName) => {
                let crumbTrail = false;
                if (data[parentName]) {
                    let parent = notes.filter((n) => { 
                        return n.data.title == data[parentName] 
                    })[0];

                    if(parent) {
                        crumbTrail = [{
                            url: data.page.url,
                            title: data.title
                        }, {
                            url: parent.url,
                            title: parent.data.title
                        }];

                        if(parent.data[parentName]) {
                            let grandparent = notes.filter((n) => { 
                                return parent.data[parentName] == n.fileSlug 
                            })[0];
                            if(grandparent) {
                                crumbTrail.push({
                                    url: grandparent.url,
                                    title: grandparent.data.title
                                });
                            }
                        }
                    }
                }

                if (crumbTrail) {
                    breadcrumbs.push(crumbTrail.reverse());
                }
            })
            return breadcrumbs
        },
        affiliations: (data) => {
            const notes = data.collections.notes;            
            const currentFileSlug = data.page.fileSlug;            
            let npcs = [];
            npcs = notes.filter(onlyPeople).filter((note) => {
                return subsetMatch(note.template.frontMatter.data, 'Affiliation', currentFileSlug);
            }).map((note) => {
                return {
                    url: note.url,
                    title: note.data.title,
                }
            });
            return npcs;
        },

        npcs: (data) => {
            const notes = data.collections.notes;
            const currentFileSlug = data.page.fileSlug;
            let npcs = [];
            npcs = notes.filter(onlyPeople).filter((note) => {
                const isLocation = subsetMatch(note.template.frontMatter.data, 'Location', currentFileSlug);
                const isWorkplace = subsetMatch(note.template.frontMatter.data, 'Workplace', currentFileSlug);
                const isAlmaMater = subsetMatch(note.template.frontMatter.data, 'Alma Mater', currentFileSlug);
                const isHome = subsetMatch(note.template.frontMatter.data, 'Home', currentFileSlug);
                return isLocation || isWorkplace || isAlmaMater || isHome;
            })
            .map((note) => {
                return {
                    url: note.url,
                    title: note.data.title,
                }
            })
            return npcs;
        },

        backlinks: (data) => {
            const notes = data.collections.notes;            
            const currentFileSlug = data.page.fileSlug;

            let backlinks = [];

            // Search the other notes for backlinks
            for(const otherNote of notes) {
                const noteContent = otherNote.template.frontMatter.content;
                // Get all links from otherNote
                const outboundLinks = (noteContent.match(wikilinkRegExp) || [])
                    .map(link => (
                        // Extract link location
                        link.slice(2,-2)
                            .split("|")[0]
                            .replace(/.(md|markdown)\s?$/i, "")
                            .trim()
                    ));

                const metadata = otherNote.template.frontMatter.data;
                if (metadata) {
                    const metaLinks = Object.values(metadata).flat();
                    outboundLinks.concat(metaLinks);
                }

                // If the other note links here, return related info
                if(outboundLinks.some(link => caselessCompare(link, currentFileSlug))) {

                    // Construct preview for hovercards
                    let preview = noteContent.slice(0, 240);

                    backlinks.push({
                        url: otherNote.url,
                        title: otherNote.data.title,
                        preview
                    })
                }
            }

            return backlinks;
        }
    }
}
