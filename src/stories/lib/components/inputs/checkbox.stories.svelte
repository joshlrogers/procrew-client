<script module lang="ts">
	import { Checkbox } from '$lib/components/inputs';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Checkbox',
		component: Checkbox,
		decorators: [],
		parameters: {}
	});
</script>

<Story name="Default" />

<Story name="With Label" args={{ label: 'With Label' }} />

<Story name="Checked" args={{ checked: true, label: 'With Label' }} />
