<script lang="ts">
	let { children } = $props();
</script>

<ul>
	{@render children?.()}
</ul>
