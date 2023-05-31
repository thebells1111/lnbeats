<script>
	import { onMount } from 'svelte';
	import { remoteServer } from '$/stores';
	onMount(albyAuth);

	async function albyAuth() {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		console.log(code);
		if (code) {
			console.log(remoteServer + `api/alby/auth?type=code&code=${code}`);
			let res = await fetch(remoteServer + `api/alby/auth?type=code&code=${code}`, {
				credentials: 'include'
			});

			let data = await res.json();
		}
	}
</script>

Hello
