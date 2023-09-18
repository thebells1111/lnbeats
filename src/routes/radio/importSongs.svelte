<script>
	import albums from './albums.json';

	let songs = [];
	let noValue = {};

	albums.forEach((v) => {
		let _songs = v.songs.map((s) => {
			if (!s['podcast:value']) {
				noValue[v['id']] = v;
			}
			// s.album = {
			// 	artwork: v.artwork || v.image,
			// 	originalUrl: v.originalUrl,
			// 	author: v.author,
			// 	description: v.description,
			// 	lastUpdateTime: v.lastUpdateTime,
			// 	id: v.id,
			// 	title: v.title,
			// 	podcastGuid: v.podcastGuid
			// };
			// return s;
		});
		songs = songs.concat(_songs);
	});

	console.log(songs);
	console.log(noValue);
</script>

<ul>
	{#each albums as album}
		<li>{album.title}</li>
	{/each}
</ul>
