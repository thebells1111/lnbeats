<script>
	import { selectedAlbum } from '$/stores';
	import { saveAlbum } from '$functions/saveAlbum.js';

	async function addAlbum() {}
</script>

<button on:click={saveAlbum.bind(this, $selectedAlbum)}>Add</button>
