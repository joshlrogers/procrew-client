<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputConstraint } from 'sveltekit-superforms';
	import { cn } from '$lib/utils';

	interface InputProps extends HTMLInputAttributes {
		label?: string;
		labelClass?: string;
		wrapperClass?: string;
		constraints?: InputConstraint;
		errors?: string[];
	}

	let {
		class: extClass = undefined,
		constraints,
		errors = undefined,
		id,
		label = undefined,
		labelClass = undefined,
		type = 'text',
		wrapperClass = undefined,
		value = $bindable(),
		...otherProps
	}: InputProps = $props();

	let inputClass = cn(
		'w-full',
		'h-10',
		'block',
		'p-2.5',
		'border',
		'border-transparent',
		'rounded-md',
		'focus:ring-border',
		'focus:border-bg-300',
		'text-black',
		'shadow',
		extClass);
	let extLabelClass = cn('block', 'mb-2', 'text-sm', 'font-medium', 'text-text', 'label', labelClass);

</script>
<div class={wrapperClass}>
	{#if label}
		<label for={id}
					 class={extLabelClass}>
			{label}
		</label>
	{/if}

	<input
		{id}
		class={inputClass}
		aria-invalid={errors ? 'true' : undefined}
		bind:value
		{type}
		{...constraints}
		{...otherProps} />

	{#if errors}
		<div class="uppercase text-xs leading-1 tracking-tighter text-coral-red-700 px-1">
			{errors}
		</div>
	{/if}
</div>
