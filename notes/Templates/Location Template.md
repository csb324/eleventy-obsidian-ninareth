---
Location: <% parent %>
---
<%* const { Campaign } = window.customJS;
let title = tp.file.title;
if(!tp.file.title || tp.file.title == "Untitled") {
	title = await tp.system.prompt("Enter Name");
}

const locationType = await tp.system.suggester(Campaign.locationTypes, Campaign.locationTypes);

const folder = Campaign.getLocationFolder(locationType);
const parentType = Campaign.getLocationParent(locationType);

let parent = '';
if (parentType == "city" || parentType == "country") {
	let options;
	if(parentType == "country") {
		options = Campaign.getCountries();
	} else if (parentType == "city") {
		options = Campaign.getCities();
	}
	options.push("Other");
	parent = await tp.system.suggester(options, options);
}


await tp.file.move(`${folder}/${title}`);

const tags = 'tags';
const dataview = 'dataview';
const lowerType = locationType.toLowerCase();
const placeTag = `location/${lowerType}/${Campaign.lowerKebab(title)}`
-%>
---
type: location
locationType: <% lowerType %>
<% tags %>: 
- <% placeTag %>
---

# <% title %>
<% locationType %>, <span class="dataview inline-field"><span class="inline-field-key">Location</span><span class="inline-field-value">[[<% parent %>]]</span></span>


## NPCs
{% include 'list-references.html', reference_data: npcs %}

## Points of Interest
{% include 'list-references.html', reference_data: points_of_interest %}
