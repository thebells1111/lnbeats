const fs = require('fs');

// Read 1000.json
fs.readFile('./1000.json', 'utf8', (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	// Parse JSON and map to get titles
	const array = JSON.parse(data);
	const feeds = array.map((v) => ({
		id: v.id,
		podcastGuid: v.podcastGuid,
		image: v.image,
		artwork: v.artwork,
		author: v.author,
		title: v.title
	}));

	// Convert to JSON string
	const reducedJson = JSON.stringify(feeds);

	// Write to reduced.json
	fs.writeFile('./reduced.json', reducedJson, 'utf8', (err) => {
		if (err) {
			console.error(err);
		}
	});
});
