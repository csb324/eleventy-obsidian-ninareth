---
{}
---
```dataviewjs

dv.pages('"Sessions"')
	.where(p => p.type == "session")
	.sort(p => p.ctime)
	.map(k => dv.el('div', "**[[" + k.file.name + "]]**"))

```
