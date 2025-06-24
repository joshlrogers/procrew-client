<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface CheckboxProps extends HTMLInputAttributes {
		label?: string;
		labelClass?: string;
		checked: boolean;
		wrapperClass?: string;
		labelPosition?: 'left' | 'right' | 'top' | 'bottom';
		onCheckedChange?: (checked: boolean) => void;
	}

	let {
		class: extClass = undefined,
		id,
		label = undefined,
		labelClass = undefined,
		checked = $bindable(false),
		wrapperClass = undefined,
		labelPosition = 'left',
		onCheckedChange = undefined,
		...otherProps
	}: CheckboxProps = $props();

	let inputClass = $derived(cn('checkbox', extClass));
	let extLabelClass = $derived(
		cn(
			labelClass,
			labelPosition === 'left' ? 'mr-2' : undefined,
			labelPosition === 'right' ? 'ml-2' : undefined,
			labelPosition === 'top' ? 'mb-2' : undefined,
			labelPosition === 'bottom' ? 'mt-2' : undefined
		)
	);
	let extWrapperClass = $derived(
		cn(
			wrapperClass,
			labelPosition === 'top' || labelPosition === 'bottom' ? 'justify-center' : 'items-center',
			labelPosition === 'top' || labelPosition === 'bottom' ? 'flex-col' : 'flex-row',
			labelPosition === 'top' || labelPosition === 'bottom' ? 'items-center' : undefined,
			labelPosition === 'right' ? 'flex-row-reverse' : undefined,
			labelPosition === 'bottom' ? 'flex-col-reverse' : undefined
		)
	);
</script>

<div class={extWrapperClass}>
	<div class={extLabelClass}>
		{#if label}
			<label for={id}>
				{label}
			</label>
		{/if}
	</div>
	<div class="w-12">
		<input
			class={inputClass}
			type="checkbox"
			bind:checked
			onchange={(val: Event) => {
				const target = val.target as HTMLInputElement;
				onCheckedChange?.(target.checked);
			}}
			{...otherProps}
		/>
	</div>
</div>
