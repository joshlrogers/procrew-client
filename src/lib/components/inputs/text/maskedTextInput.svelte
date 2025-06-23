<script lang="ts">
	import IMask, { type InputMaskElement } from 'imask';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputConstraint } from 'sveltekit-superforms';

	interface MaskedTextInputProps extends HTMLInputAttributes {
		constraints?: InputConstraint,
		errors?: any,
		id?: string;
		label?: string;
		labelClass?: string;
		leadAdornment?: Snippet,
		tailAdornment?: Snippet,
		mask?: string;
		placeholderChar?: string;
		required?: boolean;
		maskType?: 'Phone' | 'PostalCode' | 'SSN';
		wrapperClass?: string;
	}

	let {
		class: extClass = undefined,
		constraints = undefined,
		errors = undefined,
		id = undefined,
		label = undefined,
		labelClass = undefined,
		leadAdornment = undefined,
		tailAdornment = undefined,
		mask = undefined,
		placeholderChar = '_',
		value = $bindable<string>(),
		maskType = undefined,
		wrapperClass = undefined,
		required = undefined,
		...otherProps
	}: MaskedTextInputProps = $props();

	// Validate that required and constraints are mutually exclusive
	if (required !== undefined && constraints !== undefined) {
		throw new Error('MaskedTextInput: Cannot provide both "required" and "constraints" props. They are mutually exclusive.');
	}

	// Derive required state from constraints if not explicitly provided
	let isRequired = $derived(
		required !== undefined 
			? required 
			: constraints?.required === true
	);

	let _element = $state();
	let _mask = $state<any>();
	let extLabelClass = $derived(cn('block', 'mb-2', 'label', labelClass));
	let inputClass = $derived(cn('input block h-10 w-full p-2.5 shadow-sm', extClass));

	function getOptions(): any {
		if (mask) {
			return {
				mask: mask,
				placeholderChar: placeholderChar,
				lazy: false,
			};
		}

		switch (maskType) {
			case 'Phone':
				return {
					mask: '(000) 000-0000',
					placeholderChar: '#',
					lazy: true,
					overwrite: 'shift'
				};
			case 'PostalCode':
				return {
					mask: '00000[-0000]',
					placeholderChar: placeholderChar,
					lazy: true,
					overwrite: 'shift'
				};
			case 'SSN':
				return {
					mask: 'XXX-XX-0000',
					placeholderChar: placeholderChar,
					definitions: {
						X: {
							mask: '0',
							displayChar: '*'
						}
					},
					lazy: false,
					overwrite: 'shift'
				};
			default:
				throw new Error('Invalid mask type.');
		}
	}

	function onMaskedValueChanged() {
		value = _mask?.unmaskedValue ?? '';
	}

	onMount(() => {
		_mask = IMask(_element as InputMaskElement, getOptions());

		_mask.unmaskedValue = value ?? '';
		_mask.on('accept', onMaskedValueChanged);
	});

	onDestroy(() => {
		_mask?.off('accept', onMaskedValueChanged);
	});

	$effect(() => {
		_mask?.updateOptions(getOptions());
	});

	$effect(() => {
		if(_mask.unmaskedValue !== value) {
			_mask.unmaskedValue = value ?? '';
		}
	});
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
					 bind:this={_element}
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
		<div class="uppercase text-xs leading-none tracking-tighter text-error-300-700 px-1">
			{errors}
		</div>
	{/if}
</div>
