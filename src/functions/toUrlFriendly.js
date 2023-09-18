export default function toUrlFriendly(str) {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '') // Remove non-URL friendly characters
		.replace(/\s+/g, '_'); // Replace spaces with underscores
}
