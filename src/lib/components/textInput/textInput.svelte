<script lang="ts">
    import {cn} from "$lib/utils";

    let {
        autocomplete = null,
        bgColor = 'bg-primary-100',
        class: extClass = '',
        wrapperClass = undefined,
        id = undefined,
        label = undefined,
        labelClass = undefined,
        maxlength = undefined,
        name = undefined,
        placeholder = undefined,
        required = false,
        width = 'w-full',
        value = $bindable(),
        ...otherProps
    } = $props();

    let inputClass = cn(
        'h-10',
        'block',
        'p-2.5',
        'border',
        'border-transparent',
        'rounded-md',
        'focus:ring-border',
        'focus:border-bg-300',
        'text-black',
        width,
        bgColor,
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

    <input {id}
           {name}
           {maxlength}
           {placeholder}
           {autocomplete}
           bind:value={value}
           type="text"
           class={inputClass}
           aria-placeholder={placeholder}
           aria-required={required ? 'true' : 'false'}
           {required}
           {...otherProps}/>
</div>

