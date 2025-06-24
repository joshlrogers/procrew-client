<script module lang="ts">
	import { Button } from '$lib/components/buttons/button';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Button',
		component: Button,
		decorators: [],
		parameters: {}
	});
</script>

<Story name="Default" args={{ text: 'With Text' }} />
