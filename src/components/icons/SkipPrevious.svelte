<script>
	export let size = '1em';
	export let width = size;
	export let height = size;
	export let color = 'currentColor';
	export let viewBox = '0 0 24 24';
</script>

<svg {width} {height} {viewBox}>
	<path d="M5.5 18V6h2v12Zm13 0-9-6 9-6Z" fill={color} />
</svg>
