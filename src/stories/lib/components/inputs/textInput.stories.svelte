<script module lang="ts">
	import { TextInput } from '$lib/components/inputs';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'lib/components/inputs/textInput',
		component: TextInput,
		decorators: [],
		parameters: {}
	});

</script>

<Story name="Default" />

<Story name="With Label" args="{{label: 'With Label'}}" />

<Story name="With Value" args="{{label: 'With Value', value: 'Test Value'}}" />