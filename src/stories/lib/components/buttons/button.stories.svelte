<script module lang="ts">
	import { Button } from '$lib/components/buttons/button';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'lib/components/buttons/button',
		component: Button,
		decorators: [],
		parameters: {}
	});

</script>

<Story name="Default" args="{{text: 'With Text'}}" />
