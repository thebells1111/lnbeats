<script>
	export let size = '1em';
	export let width = size;
	export let height = size;
	export let viewBox = '0 0 24 24';
	export let color = 'currentColor';
</script>

<svg {width} {height} {viewBox}>
	<path
		d="M12.5 15q1.05 0 1.775-.725Q15 13.55 15 12.5V7h3V5h-4v5.5q-.325-.25-.7-.375-.375-.125-.8-.125-1.05 0-1.775.725Q10 11.45 10 12.5q0 1.05.725 1.775Q11.45 15 12.5 15ZM8 18q-.825 0-1.412-.587Q6 16.825 6 16V4q0-.825.588-1.413Q7.175 2 8 2h12q.825 0 1.413.587Q22 3.175 22 4v12q0 .825-.587 1.413Q20.825 18 20 18Zm0-2h12V4H8v12Zm-4 6q-.825 0-1.412-.587Q2 20.825 2 20V6h2v14h14v2ZM8 4v12V4Z"
		fill={color}
	/>
</svg>
