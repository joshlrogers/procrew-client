<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { Icon } from '$lib/components/icon/index.js';
	import { MaterialIcon } from '$lib/components/icon';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SelectListOption } from '$lib/shared/models/options';
	import type { InputConstraint } from 'sveltekit-superforms';

	interface SelectListProps extends HTMLAttributes<HTMLButtonElement> {
		emptyText?: string;
		height?: string;
		labelClass?: string;
		label?: string;
		name?: string;
		required?: boolean;
		constraints?: InputConstraint;
		minWidth?: string;
		textColor?: string;
		items: SelectListOption[];
		maxListHeight?: string;
		value?: string | number;
		wrapperClass?: string;
		onchanged?: (val: string | number | undefined) => void;
	}

	let {
		id = undefined,
		labelClass = 'block',
		label: labelText = undefined,
		emptyText = 'No items found.',
		height = 'h-10',
		maxListHeight = 'max-h-48',
		name = undefined,
		items,
		required = undefined,
		constraints = undefined,
		textColor = undefined,
		wrapperClass = undefined,
		value = undefined,
		onchanged = undefined,
		...otherProps
	}: SelectListProps = $props();

	// Validate that required and constraints are mutually exclusive
	if (required !== undefined && constraints !== undefined) {
		throw new Error(
			'SelectList: Cannot provide both "required" and "constraints" props. They are mutually exclusive.'
		);
	}

	// Derive required state from constraints if not explicitly provided
	let isRequired = $derived(required !== undefined ? required : constraints?.required === true);

	// Helper function to find item by value
	const findItemByValue = (val: string | number | undefined) => {
		if (val === undefined) return undefined;
		const valueStr = val.toString();
		return items.find((i) => i.value.toString() === valueStr);
	};

	const {
		elements: { trigger, menu, label, option },
		states: { open, selectedLabel, selected }
	} = createSelect<string | number>({
		required: required,
		defaultSelected: findItemByValue(value),
		forceVisible: true,
		onSelectedChange: ({ curr, next }) => {
			if (curr?.value !== next?.value && next?.value !== undefined) {
				onchanged?.(next.value);
			}
			return next;
		},
		positioning: {
			placement: 'bottom',
			fitViewport: false,
			sameWidth: true
		}
	});

	let buttonClass = cn(
		'select-list input',
		'flex items-center justify-between rounded-lg px-3 py-2 shadow',
		textColor,
		height
	);
	let listClass = cn(
		'select-list-contents z-100 flex flex-col overflow-y-auto rounded-lg p-1 shadow focus:!ring-0',
		maxListHeight,
		textColor
	);
	let listItemClass = cn(
		'relative cursor-pointer rounded-lg py-1 pl-4 pr-4 focus:z-100 ' +
			'data-[highlighted]:bg-primary-500 data-[highlighted]:font-bold data-[disabled]:opacity-50 ' +
			'flex flex-row gap-2 justify-items-center'
	);

	let extLabelClass = cn('block', 'mb-2', 'text-sm', 'font-medium', 'label', labelClass);

	let selectedItem = $derived(() => findItemByValue(value));

	// Update selected when value prop changes
	$effect(() => {
		$selected = findItemByValue(value);
	});
</script>

<div class={wrapperClass}>
	{#if labelText}
		<label for={id} class={extLabelClass} use:melt={$label}>
			<span class="label-text">
				{labelText}
				{#if isRequired}
					<span class="text-error-200-800 ml-1">*</span>
				{/if}
			</span>
		</label>
	{/if}

	<button class={buttonClass} use:melt={$trigger} {...otherProps}>
		{#if selectedItem()}
			{@const currentItem = selectedItem()}
			{#if currentItem && currentItem.icon}
				<Icon icon={currentItem.icon} class="mr-2" />
			{/if}
		{/if}
		{$selectedLabel}
		<Icon icon={MaterialIcon.ARROW_DROP_DOWN} class="mr-0 ml-auto" />
	</button>

	{#if $open}
		<div class={listClass} use:melt={$menu} transition:fade={{ duration: 150 }}>
			{#if items?.length > 0}
				{#each items as item}
					<div class={listItemClass} use:melt={$option(item)}>
						{#if item.icon}
							<Icon icon={item.icon} />
						{/if}
						{item.label}
					</div>
				{/each}
			{:else}
				<div class={listItemClass}>
					{emptyText}
				</div>
			{/if}
		</div>
	{/if}
</div>
