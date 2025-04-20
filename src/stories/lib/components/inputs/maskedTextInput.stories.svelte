<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { MaskedTextInput } from '$lib/components/inputs';

	const { Story } = defineMeta({
		title: 'Components/Inputs/Text/Masked Input',
		component: MaskedTextInput,
		decorators: [],
		parameters: {}
	});

</script>

<Story name="Default" args="{{ mask: '000[aaa]', label: 'Default', value: '123' }}" />

<Story name="PhoneNumber" args="{{ maskType: 'Phone', value: '6155551000' }}" />

<Story name="PostalCode" args="{{ maskType: 'PostalCode', value: '37174' }}" />

<Story name="SSN" args="{{ maskType: 'SSN', value: '888554444' }}" />