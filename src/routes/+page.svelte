<script>
	import './styles.css';
</script>

<app>
	<header>
		<img src="/lnbeats-header.png" alt="ln beats logo" />
	</header>
	<div class="header-background" />
	<div class="footer-background" />
	<div class="main-background" />
	<div class="explain">
		<p>
			LNBeats was created to give a place for <i>ALL</i> v4v music to be heard. <br />It was never
			intended to be a permanent project, <br />just something until someone else built an app that
			was open to
			<i>ALL</i> v4v music.
		</p>
		<p>That app has been built.</p>
		<p>
			Kolomona is passionate about v4v music, and has created a new app. <br /> If you're still interested
			in listening to your favorite v4v bands, you can find them all here:
		</p>
		<p><a href="https://v4vmusic.com/">v4v music</a></p>
	</div>
</app>

<style>
	app {
		height: 100%;
		max-width: 720px;
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 50px;
		padding: 0 12px;
	}

	img {
		text-align: center;
		width: 150px;
		margin-top: 4px;
	}

	.header-background {
		position: absolute;
		top: 0;
		height: 100px;
		width: 100%;
		background-color: var(--color-bg-2);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-0) 0%,
			var(--color-bg-1) 40%,
			var(--color-bg-2) 100%
		);
		z-index: -1;
		padding-top: env(safe-area-inset-top);
	}

	.footer-background {
		position: absolute;
		bottom: 0;
		height: 60px;
		width: 100%;
		background-color: var(--color-bg-2);
		background-image: linear-gradient(
			180deg,
			var(--color-bg-2) 0%,
			var(--color-bg-0) 10%,
			var(--color-bg-1) 100%
		);
		z-index: -1;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.main-background {
		background-attachment: fixed;
		background-color: var(--color-bg-2);
		z-index: -2;
		position: absolute;
		height: 100%;
		width: 100%;
	}

	@media (min-width: 722px) {
		app {
			height: calc(100vh - 16px);
		}

		.header-background {
			border-radius: 8px 8px 0 0;
		}

		.footer-background {
			border-radius: 0 0 8px 8px;
		}
	}
</style>
