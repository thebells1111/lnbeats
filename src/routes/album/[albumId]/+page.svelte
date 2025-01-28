<script>
	import Album from '$c/Album/Album.svelte';

	export let data;
	export let isSong = false;
</script>

<svelte:head>
	{#if data && !isSong}
		<title>{`${data.author} - ${data.title}`}</title>
		<meta name="description" content={`${data.author} - ${data.title}`} />
		<meta property="og:site_name" content="LN Beats" />
		<meta property="og:title" content={`${data.author} - ${data.title}`} />
		<meta property="og:description" content="Listen on LN Beats" />
		<meta property="og:image" content={data.artwork || data.image} />
		<meta property="og:url" content={`https://lnbeats.com/album/${data.podcastGuid}`} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={`${data.author} - ${data.title}`} />
		<meta property="twitter:description" content="Listen on LN Beats" />
		<meta property="twitter:image" content={data.artwork || data.image} />
		<meta property="twitter:url" content={`https://lnbeats.com/album/${data.podcastGuid}`} />
	{/if}
</svelte:head>

<Album album={data} />
