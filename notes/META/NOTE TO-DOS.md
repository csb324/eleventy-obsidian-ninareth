People whose statuses haven't been added

```dataviewjs
dv.list(dv.pages('"People"')
  .where(p => !p.Status)
  .sort(p => p.file.name, 'asc')
  .map(k => `[[${k.file.name}]]`))

```


NPCs whose relationships haven't been added

```dataviewjs
dv.list(dv.pages('#npc')
  .where(p => !p.Relationship)
  .sort(p => p.file.name, 'asc')
  .map(k => `[[${k.file.name}]]`))

```

