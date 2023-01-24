<script>
	export let size = '1em';
	export let width = size;
	export let height = size;
	export let color = 'currentColor';
	export let viewBox = '0 0 24 24';
</script>

<svg {width} {height} {viewBox}>
	<path d="M16.5 18V6h2v12Zm-11 0V6l9 6Z" fill={color} />
</svg>
