import { parse } from 'fast-xml-parser';
import { decode } from 'html-entities';

const parserOptions = {
	attributeNamePrefix: '@_',
	//attrNodeName: false,
	//textNodeName : "#text",
	ignoreAttributes: false,
	ignoreNameSpace: false,
	attrValueProcessor: (val, attrName) => decode(val), //default is a=>a
	tagValueProcessor: (val, tagName) => decode(val) //default is a=>a
};

function parseFeed(data) {
	return parse(data, parserOptions);
}

export default parseFeed;
