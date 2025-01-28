<script>
	export let size = '1em';
	export let width = size;
	export let height = size;
	export let color = 'currentColor';
	export let viewBox = '0 96 960 960';
</script>

<svg {width} {height} {viewBox}>
	<path
		d="M640 896q-50 0-85-35t-35-85q0-50 35-85t85-35q11 0 21 1.5t19 6.5V336h200v80H760v360q0 50-35 85t-85 35ZM120 736v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Z"
		fill={color}
	/>
</svg>
