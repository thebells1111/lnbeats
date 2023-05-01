export function encodeURL(url) {
	let encodedURL = window.btoa(url);
	return encodedURL.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to decode a string back to the original URL using Base64 decoding
export function decodeURL(encodedURL) {
	let padding = '='.repeat((4 - (encodedURL.length % 4)) % 4);
	let base64 = (encodedURL + padding).replace(/-/g, '+').replace(/_/g, '/');
	return window.atob(base64);
}
