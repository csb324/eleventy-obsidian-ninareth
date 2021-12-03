---
{}
---
<%* const { Campaign } = window.customJS;
let title = tp.file.title;
let number = 0;
if(tp.file.title !== 'Untitled') {
	number = title.split('-')[1]
} else {
	number = Campaign.getLatestSession() + 1;
	title = "session-" + number;
}

const folder = 'Sessions'

await tp.file.move(`${folder}/${title}`);
-%>
---
type: session
up: [[Session Log]]
prev: [[session-<% number - 1 %>]]
---

# Session <% number %>

