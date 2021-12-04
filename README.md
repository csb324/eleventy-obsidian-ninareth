# Eleventy-Garden

Cloned from [binyamin/eleventy-garden](https://github.com/binyamin/eleventy-garden)

An 11ty repo made to work with [Obsidian](https://obsidian.md/) notes.

## :house: About
- Displays backlinks
- copies [Dataview](https://github.com/blacksmithgu/obsidian-dataview) inline tags into the frontmatter for querying
- Uses wiki style links
- uses breadcrumbs... sorta (this part only kind of works, frankly)
- Embeds images in the obsidian style
- Is very specific to my file structure -- i will make this more general, I swear

## To do:
- [ ] the formatNotes.js only sometimes runs its transformations.... gotta figure out why that's happenig
- [ ] make breadcrumbs look for relationships more comprehensively (it can be O(n^2) if it wants, this is a static site generator and I am zero percent worried about build times because at the end of the day, six people want to read my dnd notes)


## :scroll: License
This project is under the [MIT](https://github.com/csb324/eleventy-obsidian-ninareth/blob/main/LICENSE) license.
