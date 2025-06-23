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
		tailAdornment?: Snippet,
		casing?: 'Upper' | 'Lower' | 'Default',
		required?: boolean;
	}

	let {
		casing = 'Default',
		class: extClass = '',
		constraints = undefined,
		errors = undefined,
		id = undefined,
		wrapperClass = undefined,
		label = undefined,
		labelClass = undefined,
		leadAdornment = undefined,
		placeholder = undefined,
		required = undefined,
		tailAdornment = undefined,
		value = $bindable<string>(),
		...otherProps
	}: TextInputProps = $props();

	// Validate that required and constraints are mutually exclusive
	if (required !== undefined && constraints !== undefined) {
		throw new Error('TextInput: Cannot provide both "required" and "constraints" props. They are mutually exclusive.');
	}

	// Derive required state from constraints if not explicitly provided
	let isRequired = $derived(
		required !== undefined 
			? required 
			: constraints?.required === true
	);

	let textInput: HTMLInputElement;

	export const setFocus = () => {
		textInput?.focus();
	};

	export const setSelectionRange = (start: number, end: number | null) => {
		textInput?.setSelectionRange(start, end);
	};

	let getValue = (): string => value;
	let setValue = (val: string) => {
		value = casing === 'Upper' ? val.toUpperCase() : casing === 'Lower' ? val.toLowerCase() : val;
	};

	let inputClass = $derived(cn('input block h-10 w-full p-2.5 shadow-sm',
		leadAdornment ? 'rounded-s-0 rounded-e-md focus-visible:outline-none focus-visible:border-l-0' : undefined,
		tailAdornment ? 'rounded-s-md rounded-e-0 focus-visible:outline-none focus-visible:border-r-0' : undefined,
		!leadAdornment && !tailAdornment ? 'rounded-md focus-visible:outline-none' : undefined,
		casing === 'Upper' ? 'text-uppercase' : casing === 'Lower' ? 'text-lowercase' : 'text-default',
		extClass));
	let extLabelClass = $derived(cn('block', 'mb-2', 'label', labelClass));
</script>

<div class={wrapperClass}>
	{#if label}
		<label for={id}
					 class={extLabelClass}>
			<span class="label-text">
				{label}
				{#if isRequired}
					<span class="text-error-200-800 ml-1">*</span>
				{/if}
			</span>
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
					 type="text"
					 class={inputClass}
					 aria-invalid={errors ? true : undefined }
					 aria-placeholder={placeholder}
					 aria-required={isRequired ? 'true' : 'false'}
					 {placeholder}
					 {...constraints}
					 {...otherProps}
					 bind:value={getValue,setValue}
					 bind:this={textInput} />

		{#if tailAdornment}
		<span
			class="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border rounded-s-0 border-gray-300 border-s-0 rounded-e-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
			{@render tailAdornment()}
		</span>
		{/if}

	</div>
	{#if errors}
		<div class="uppercase text-xs leading-none tracking-tighter text-error-700 px-1 ">
			{errors}
		</div>
	{/if}

</div>

