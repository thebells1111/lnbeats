<script>
	export let album;
	export let isRadio = false;
	export let fromSearch = false;

	$: console.log(fromSearch);
</script>

{#if album}
	<a href={isRadio ? '/radio' : `/album/${album.podcastGuid}`}>
		<card>
			<img src={album.artwork || album.image} loading="lazy" width="115" height="115" />
			<album-title>{album.title}</album-title>
			<album-author>{album.author || ''}</album-author>

			{#if fromSearch}
				{#if album.generator.includes('Wavlake')}
					<div class="gen-icon">
						<img src="/wavlake-small.webp" />
					</div>
				{:else if album.generator.includes('Music Side Project')}
					<div class="gen-icon msp">
						<img src="/msp-icon-32.png" />
					</div>
				{:else if album.generator.includes('RSS Blue')}
					<div class="gen-icon rss-blue">
						<img src="/rssblue-small.webp" />
					</div>
				{:else if album.generator.includes('Sovereign Feeds')}
					<div class="gen-icon sf">
						<img src="/SF32.png" />
					</div>
				{/if}
			{/if}
		</card>
	</a>
{/if}

<style>
	card {
		display: flex;
		flex-direction: column;
		width: 160px;
		height: 160px;
		max-width: calc(100% - 16px);
		margin-bottom: 8px;
		padding: 4px;
		backdrop-filter: blur(14px);
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
	}

	img {
		width: 115px;
		border-radius: 4px;
		margin: 0 auto;
	}

	.gen-icon {
		width: 20px;
		height: 20px;
		position: absolute;
		right: 0px;
		background-color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.gen-icon > img {
		width: 65%;
		border-radius: 0;
	}

	.msp {
		background-color: white;
	}

	.msp > img {
		width: 85%;
		border-radius: 0;
		position: relative;
		top: 1px;
	}

	.rss-blue {
		background-color: rgb(237, 244, 248);
	}

	.rss-blue > img {
		width: 50%;
		border-radius: 0;
		position: relative;
		bottom: 1px;
		left: 1px;
	}

	.sf > img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: relative;
	}

	album-title,
	album-author {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		padding: 1px;
		font-size: 1.1em;
		font-weight: 550;
	}

	album-title {
		margin-top: 4px;
	}

	album-author {
		padding-left: 6px;
		font-style: italic;
		font-size: 0.9em;
	}

	a,
	a:hover {
		text-decoration: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
