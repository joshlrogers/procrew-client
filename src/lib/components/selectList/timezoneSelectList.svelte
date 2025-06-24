<script lang="ts">
	import { SelectList } from '$lib/components/selectList/index';

	let { value = $bindable(), required = false, ...otherProps } = $props();

	const availableTimezones = [
		'America/New_York',
		'America/Puerto_Rico',
		'America/Chicago',
		'America/Denver',
		'America/Los_Angeles',
		'America/Juneau',
		'Pacific/Honolulu'
	];
	const availableTimezoneOptions = availableTimezones.map((tz) => ({ value: tz, label: tz }));
</script>

<SelectList
	items={availableTimezoneOptions}
	onchanged={(val) => {
		if (typeof val === 'string') {
			value = val;
		}
	}}
	{value}
	{required}
	{...otherProps}
/>
