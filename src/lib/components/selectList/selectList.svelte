<script lang="ts">
    import {createSelect, melt} from "@melt-ui/svelte";
    import {fade} from 'svelte/transition';
    import {Icon} from "$lib/components/icon/index.js";
    import {Icons} from "$lib/components/icon/Icons";
    import type {ListboxOption} from "@melt-ui/svelte/dist/builders/listbox";
    import {cn} from "$lib/utils";
    import type {HTMLButtonAttributes} from "svelte/elements";

    interface SelectListOption {
        label: string;
        value: string;
    }

    interface SelectListProps extends HTMLButtonAttributes {
        backgroundColor?: string;
        emptyText?: string;
        height?: string;
        id?: string;
        labelClass?: string;
        label?: string;
        name?: string;
        required: boolean;
        minWidth?: string;
        textColor?: string;
        selectedValue?: SelectListOption;
        tabindex?: number;
        items: SelectListOption[];
        maxListHeight?: string;
        width?: string;
    }

    let {
        backgroundColor = "bg-white",
        id = undefined,
        labelClass = 'block',
        label: labelText = undefined,
        emptyText = '',
        height = "h-10",
        maxListHeight = "max-h-48",
        name = undefined,
        items,
        selectedValue = undefined,
        required = false,
        minWidth = "min-w-56",
        tabindex = -1,
        textColor = 'text-black',
        width = 'w-auto',
        ...otherProps
    }: SelectListProps = $props();

    const {
        elements: {trigger, menu, label, option},
        states: {open, selectedLabel, selected},
    } = createSelect<string>({
        required: required,
        defaultSelected: selectedValue as ListboxOption<string>,
        onSelectedChange: (val) => {
            selectedValue = val.next as ListboxOption<string>;
            return val.next;
        },
        forceVisible: true,
        positioning: {
            placement: "bottom",
            fitViewport: false,
            sameWidth: true,
        }
    })

    let buttonClass = cn("flex items-center justify-between rounded-lg px-3 py-2 shadow transition-opacity hover:opacity-90", minWidth,
        backgroundColor, textColor, height, width);
    let listClass = cn("z-10 flex flex-col overflow-y-auto rounded-lg p-1 shadow focus:!ring-0", maxListHeight, backgroundColor, textColor);
    let listItemClass = cn("relative cursor-pointer rounded-lg py-1 pl-4 pr-4 focus:z-10 data-[highlighted]:bg-sandy-brown data-[highlighted]:font-bold data-[disabled]:opacity-50");

    $effect(() => {
        selected.set(selectedValue);
    })

    let extLabelClass = cn('block', 'mb-2', 'text-sm', 'font-medium', 'text-text', 'label', labelClass);
</script>

<div class="flex flex-col">
    {#if name}
    <input type="hidden" name={name} value="{selectedValue?.value}" />
    {/if}
    {#if labelText}
        <label for={id} class={extLabelClass} use:melt={$label}>{labelText}</label>
    {/if}
    <button class={buttonClass}
            use:melt={$trigger}
            {tabindex}
            {...otherProps}>
        { $selectedLabel || emptyText }
        <Icon icon={Icons.ARROW_DROP_DOWN} class="ml-auto mr-0"/>
    </button>
    {#if $open}
        <div class={listClass}
             use:melt={$menu}
             transition:fade={{ duration: 150 }}>
            {#each items as item}
                <div class={listItemClass}
                     use:melt={$option(item)}>
                    {item.label}
                </div>
            {/each}
        </div>
    {/if}
</div>

