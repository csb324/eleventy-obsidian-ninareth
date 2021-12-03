---
{}
---
<%* const { Campaign } = window.customJS;
let title = tp.file.title;
if(!tp.file.title) {
	title = await tp.system.prompt("Enter Name");
}
const locationType = 'Place';
const folder = Campaign.getLocationFolder(locationType);
const parentType = "city"

let parent = '';
let parentTag = ''
parent = await tp.system.suggester(Campaign.getCities(), Campaign.getCities());
if(parent) {
	parentTag = "location/city/" + Campaign.lowerKebab(parent);
}

await tp.file.move(`${folder}/${title}`);

const tags = 'tags';
const dataview = 'dataview';
const lowerType = locationType.toLowerCase();
const placeTag = `location/${lowerType}/${Campaign.lowerKebab(title)}`
-%>
---
type: location
locationType: store
location: [[<% parent %>]]
tags:
- location/place
- location/store
---
# <% title %>
Store

## NPCs
{% include 'list-references.html', reference_data: npcs %}
