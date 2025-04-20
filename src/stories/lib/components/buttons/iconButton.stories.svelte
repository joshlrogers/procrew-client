<script module lang="ts">
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { MaterialIcon } from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/Buttons/Icon Button',
		component: IconButton,
		decorators: [],
		parameters: {}
	});

</script>


<Story name="Default" args="{{icon: MaterialIcon.BADGE}}" />

<Story name="Flat" args="{{icon: MaterialIcon.BADGE, flat: true}}" />

<Story name="Flat & Rounded" args="{{icon: MaterialIcon.BADGE, flat: true, isRounded: true}}" />

<Story name="Raised & Rounded" args="{{icon: MaterialIcon.BADGE, flat: false, isRounded: true}}" />

<Story name="With Tooltip" args="{{icon: MaterialIcon.BADGE, tooltip: 'Tooltip'}}" />

