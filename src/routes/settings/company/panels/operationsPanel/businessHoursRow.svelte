<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';

	interface BusinessHoursRowProps {
		end?: string | null;
		start?: string | null;
		day: string;
		errors?: any;
		onBusinessHoursChange?: (day: string, start?: string | null, end?: string | null) => void;
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

<div class="flex items-center justify-items-start gap-2 space-x-4">
	<div class="bg-primary min-w-24 rounded-t font-bold">
		{day}
	</div>
	<div class="flex flex-col items-center">
		<Switch
			name={`${day}Enabled`}
			checked={enabled}
			onCheckedChange={(val) => (enabled = val.checked)}
		/>
	</div>
	<div class="mx-4">
		<input disabled={!enabled} bind:value={startTime} type="time" class="input w-32" />
	</div>
	<div class="text-center">to</div>
	<div class="mx-4">
		<input bind:value={endTime} disabled={!enabled} type="time" class="input w-32" />
	</div>
</div>
<div class="text-error-700-300 text-sm leading-2 tracking-wide uppercase">
	{errors}
</div>
