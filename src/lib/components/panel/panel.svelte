<script lang="ts">
    import {cn} from "$lib/utils";
    import type {HTMLHtmlAttributes} from "svelte/elements";

    interface PanelProps extends HTMLHtmlAttributes {
        backgroundColor?: string;
        class?: string;
        rounded?: boolean;
    }

    let {
        children,
        backgroundColor = "bg-gray-100",
        class: extClass,
        rounded = true
    }: PanelProps = $props();

    let panelClass = cn('p-2', 'my-2', rounded ? 'rounded-lg' : '', 'shadow-md', backgroundColor, extClass);
</script>

<div class={panelClass}>
    {@render children?.()}
</div>