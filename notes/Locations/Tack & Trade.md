---
type: location
locationType: store
tags:
- location/place
- location/store
---
# Tack & Trade
Store
[Location::[[Tinzelven]]]

Insane corner store that tried to sell us a keychain for like forty bucks.

## NPCs

```dataviewjs

dv.list(dv.pages('"People"')
  .where(p => p.type == "npc")
  .where(p => p.Workplace )
  .where(p => p.Workplace.path == dv.current().file.name)
  .sort(p => p.file.name, 'asc')
  .map(k => `[[${k.file.name}]]`))
  
```
