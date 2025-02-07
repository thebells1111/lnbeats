<script>
	import Album from '$c/Album/Album.svelte';

	import Close from '$icons/Close.svelte';

	import { page } from '$app/stores';
	import { Swiper, SwiperSlide } from 'swiper/svelte';

	import ShareIcon from '$icons/Share.svelte';

	import { albumSwiper, remoteServer, selectedAlbum, shareInfo, shareSwiper } from '$/stores';

	function handleShare() {
		document.getElementById('share-swiper').style.visibility = 'initial';
		$shareSwiper.slideTo(1);

		let albumLink = $page.url.origin + '/album/' + $selectedAlbum['podcastGuid'];

		$shareInfo = {
			author: $selectedAlbum.author,
			album: $selectedAlbum.title,
			albumLink
		};
	}

	$: checkGuid($selectedAlbum?.podcastGuid);

	let showShare;
	function checkGuid(guid) {
		let albumUrl =
			remoteServer + `api/queryindex?q=${encodeURIComponent(`podcasts/byguid?guid=${guid}`)}`;

		fetch(albumUrl)
			.then((response) => response.json())
			.then((albumData) => {
				showShare = albumData?.feed?.id;
			})
			.catch((error) => console.error('Error fetching data:', error));
	}
</script>

<album id="album-swiper">
	<Swiper
		direction="vertical"
		autoHeight={true}
		simulateTouch={false}
		noSwipingClass="no-scroll"
		on:slideChange={() => {
			if ($albumSwiper.activeIndex === 0) {
				setTimeout(
					() => (document.getElementById('album-swiper').style.visibility = 'hidden'),
					333
				);
			}
		}}
		on:swiper={(e) => ($albumSwiper = e.detail[0])}
	>
		<SwiperSlide><div class="hidden-slide" /></SwiperSlide>
		<SwiperSlide>
			<album-container>
				<album-header>
					{#if showShare}
						<button class="share" on:click={handleShare}>
							<ShareIcon size="24" />
							<p>Share</p>
						</button>
					{:else}
						<spacer />
					{/if}
					<button
						on:click={() => {
							$albumSwiper.slideTo(0);
						}}
					>
						<Close size={24} />
					</button>
				</album-header>
				<div>
					<Album album={$selectedAlbum} />
				</div>
			</album-container>
		</SwiperSlide>
	</Swiper>
</album>

<style>
	album {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		visibility: hidden;
		z-index: 97;
	}

	.hidden-slide {
		background-color: transparent;
		height: 100vh;
	}

	album-container {
		min-width: calc(100% - 16px);
		height: calc(var(--vh, 1vh) * 100);
		display: flex;
		flex-direction: column;
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: var(--color-poster-bg-0);
		background-image: linear-gradient(
			180deg,
			var(--color-poster-bg-0) 33%,
			var(--color-poster-bg-1) 66%
		);
	}

	album-header {
		width: calc(100% - 16px);
		height: 46px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 8px;
		position: relative;
	}

	album-header > button {
		align-self: flex-end;
		margin: 0;
		position: relative;
		bottom: 8px;
		padding-right: 8px;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
	}

	album-container > div {
		width: calc(100%);
		height: calc(100%);
		overflow: auto;
	}

	.share {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		align-self: flex-start;
		margin: 0 8px 0 0;
		font-weight: 700;
		color: var(--color-text-0);
		background-color: transparent;
		border: none;
		padding: 0;
		width: 36px;
		height: 36px;
		position: relative;
		top: 4px;
	}
	.share p {
		font-size: 0.8em;
		padding: 4px 0 0 0;
		margin: 0;
		line-height: 0.8em;
		bottom: 0;
		color: var(--color-text-0);
	}
</style>
