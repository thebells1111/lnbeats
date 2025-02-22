(async () => {
	const url = 'https://wavlake.com/feed/music/98437c6e-b0ed-4f5e-b02d-aee73ca425ac';
	try {
		const res = await fetch(url);
		const text = await res.text();
		console.log('Response:', text);
	} catch (error) {
		console.error('Fetch error:', error);
	}
})();
