---
type: org
tags:
  - orgs/our-party
---


WE SURE DO EXIST.


## Who We Are

```dataviewjs

let affiliated = dv.pages('"People"')
  .where(p => p.Affiliation )
  .where(p => p.Affiliation.path )
  .where((p) => {
  	if(dv.isArray(p.Affiliation)) {
		return p.Affiliation.path.includes(dv.current().file.name)	
	} else {
		return p.Affiliation.path == dv.current().file.name
	}
  });

dv.table(
["Name", "Class"],
affiliated
  .sort(p => p.file.name, 'asc')
  .map((k) => {
  	let link = `[[${k.file.name}]]`;
	let klass =  k.Class;
	
	if (dv.isArray(klass)) {
		klass = klass.join(" / ")
	}
	return [link, klass];
  })
);
```
