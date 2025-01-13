<script lang="ts">

	import { Switch } from '@skeletonlabs/skeleton-svelte';

	interface BusinessHoursRowProps {
		end?: string;
		start?: string;
		day: string;
		errors?: any;
		onBusinessHoursChange?: (day: string, start?: string, end?: string) => void;
	}

	let {
		end,
		start,
		day,
		errors = undefined,
		onBusinessHoursChange = undefined
	}: BusinessHoursRowProps = $props();

	let startTime = $state(start);
	let endTime = $state(end);
	let enabled = $state(!!end || !!start);

	$effect(() => {
		onBusinessHoursChange?.(day, startTime, endTime);
	});

	$effect(() => {
		if (!enabled) {
			startTime = undefined;
			endTime = undefined;
		}
	});
</script>

<div class="flex items-center justify-items-start space-x-4 gap-2">
	<div class="rounded-t bg-primary font-bold min-w-24">
		{day}
	</div>
	<div class="flex flex-col items-center">
		<Switch name={`${day}Enabled`} bind:checked={enabled} />
	</div>
	<div class="mx-4">
		<input
			disabled={!enabled}
			bind:value={startTime}
			type="time"
			class="input w-32"
		/>
	</div>
	<div class="text-center">to</div>
	<div class="mx-4">
		<input
			bind:value={endTime}
			disabled={!enabled}
			type="time"
			class="input w-32"
		/>
	</div>
</div>
<div class="text-error-700-300 leading-2 uppercase text-sm tracking-wide">
	{errors}
</div>
