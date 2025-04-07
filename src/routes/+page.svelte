<script lang="ts">
	import { page } from "$app/state";
	import { enhance } from "$app/forms";

	var { data } = $props();

	$effect(() => {
		console.log(page);
	});
</script>

{#if !page.data.account}
	<a href="/login/b2c">Login</a>
{:else}
	<h1>Hi, {page.data.account.lastName} {page.data.account.firstName}</h1>

	<form method="post" use:enhance>
		<button type="submit">Sign out</button>
	</form>
{/if}
