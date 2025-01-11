<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputConstraint } from 'sveltekit-superforms';
	import type { Snippet } from 'svelte';

	interface TextInputProps extends HTMLInputAttributes {
		constraints?: InputConstraint,
		errors?: any,
		wrapperClass?: string,
		label?: string,
		labelClass?: string,
		leadAdornment?: Snippet,
		tailAdornment?: Snippet
	}

	let {
		class: extClass = '',
		constraints = undefined,
		errors = undefined,
		id = undefined,
		wrapperClass = undefined,
		label = undefined,
		labelClass = undefined,
		leadAdornment = undefined,
		placeholder = undefined,
		required = false,
		tailAdornment = undefined,
		value = $bindable(),
		...otherProps
	}: TextInputProps = $props();

	let inputClass = cn('input block h-10 w-full p-2.5 shadow-sm',
		leadAdornment ? 'rounded-s-0 rounded-e-md focus-visible:outline-none focus-visible:border-l-0' : undefined,
		tailAdornment ? 'rounded-s-md rounded-e-0 focus-visible:outline-none focus-visible:border-r-0' : undefined,
		!leadAdornment && !tailAdornment ? 'rounded-md focus-visible:outline-none' : undefined,
		extClass);
	let extLabelClass = cn('block', 'mb-2', 'text-sm', 'font-medium', 'label', labelClass);
</script>

<div class={wrapperClass}>
	{#if label}
		<label for={id}
					 class={extLabelClass}>
			{label}
		</label>
	{/if}

	<div class="flex">

		{#if leadAdornment}
		<span
			class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-e-0 border-gray-300 border-e-0 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
			{@render leadAdornment()}
		</span>
		{/if}

		<input {id}
					 bind:value
					 type="text"
					 class={inputClass}
					 aria-invalid={errors ? true : undefined }
					 aria-placeholder={placeholder}
					 aria-required={required ? 'true' : 'false'}
					 {...constraints}
					 {...otherProps} />

		{#if tailAdornment}
		<span
			class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-gray-300 border-s-0 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
			{@render tailAdornment()}
		</span>
		{/if}

	</div>
	{#if errors}
		<div class="uppercase text-xs leading-1 tracking-tighter text-coral-red-700 px-1">
			{errors}
		</div>
	{/if}

</div>

