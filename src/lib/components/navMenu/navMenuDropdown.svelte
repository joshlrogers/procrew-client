<script lang="ts">
    import {Icon} from "$lib/components/icon";
    import {Icons} from "$lib/components/icon/Icons";
    import {cn} from "$lib/utils";
    import {blur, fade, fly, slide, type TransitionConfig} from "svelte/transition";

    let {children, title, transitionType = undefined, transitionParams = {}, leadingIcon = undefined} = $props();
    let isOpen = $state(false);

    let buttonClass = cn("flex", "items-center", "w-full", "p-2", "text-base", "text-gray-900", "transition",
        "duration-75", "rounded-lg", "group", "hover:bg-gray-300");
    let spanClass = cn("flex-1", "ms-3", "text-left", "rtl:text-right", "whitespace-nowrap");

    let toggleOpen = () => {
        isOpen = !isOpen;
    }

    const multiple = (node: Element, params: any): TransitionConfig => {
        switch (transitionType) {
            case "blur":
                return blur(node, params);
            case "fly":
                return fly(node, params);
            case "fade":
                return fade(node, params);
            default:
                return slide(node, params);
        }
    };
</script>

<li>
    <button type="button"
            onclick={toggleOpen}
            class={buttonClass}
            aria-controls="nav-group-dropdown"
            data-collapse-toggle="nav-group-dropdown">
        {#if leadingIcon}
            <Icon icon={leadingIcon} />
        {/if}
        <span class={spanClass}>{title}</span>

        <Icon icon={Icons.ARROW_LEFT}
              class="transition duration-200 data-[open=true]:-rotate-90"
              data-open={isOpen} />
    </button>
    {#if isOpen}
        <ul class="ps-4" transition:multiple={transitionParams}>
            {@render children()}
        </ul>
    {/if}
</li>
