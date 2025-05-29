import fs from 'fs';
import parser from 'fast-xml-parser';
import clone from 'just-clone';

const escapeAttr = (str) =>
	str.replace(
		/[&<>'"]/g,
		(tag) =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				"'": '&#39;',
				'"': '&quot;'
			}[tag])
	);

const escapeTag = (str) => {
	if (str.match(/[&<>'"]/g)) {
		return '<![CDATA[' + str + ']]>';
	}
	return str;
};

let js2xml = new parser.j2xParser({
	attributeNamePrefix: '@_',
	//attrNodeName: false,
	textNodeName: '#text',
	ignoreAttributes: false,
	ignoreNameSpace: false,
	format: true,
	indentBy: '  ',
	supressEmptyNode: true,
	attrValueProcessor: (val, attrName) => escapeAttr(`${val}`),
	tagValueProcessor: (val, tagName) => escapeTag(`${val}`)
});

let rss = {
	'@_version': '2.0',
	'@_endcoding': 'UTF-8',
	'@_xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
	'@_xmlns:podcast': 'https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md',
	'@_xmlns:media': 'http://search.yahoo.com/mrss/'
};

let feed = {
	title: 'RSS Based Music',
	description: 'A list of all the RSS based music available as a feed.',
	'itunes:image': {
		'@_href': 'https://lnbeats.b-cdn.net/playlist600x600.png'
	},
	link: '',
	generator: 'LN Beats',
	'podcast:medium': 'musicL',
	'podcast:guid': '13140a7e-a471-423c-ba87-9a4b98c766d2',
	'itunes:owner': {
		'itunes:email': 'steven@getalby.com',
		'itunes:name': 'StevenB'
	}
};

const albums = JSON.parse(fs.readFileSync('../src/routes/dbAlbums.json', 'utf8')).albums;

let remoteItems = albums.map((v) => {
	return {
		'@_medium': v.medium,
		'@_feedGuid': v.podcastGuid,
		'@_feedUrl': v.url,
		'@_image': v.image,
		'@_title': v.title
	};
});

feed['podcast:remoteItem'] = remoteItems;

rss.channel = feed;

let xmlJson = { rss: rss };
let xmlFile = js2xml.parse(xmlJson);
if (xmlFile) {
	try {
		fs.writeFileSync('remoteItems.xml', xmlFile, 'utf-8');
	} catch (error) {
		console.log(error);
	}
}
