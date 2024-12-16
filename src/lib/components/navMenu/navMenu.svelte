<script lang="ts">
    import {cn} from "$lib/utils";

    let {
        id = "drawer-navigation",
        isOpen = false,
        overlayId = "navigation-overlay",
        children = undefined,
        ...otherProps
    } = $props();

    let overlayClass = cn('fixed', 'bg-gray-800', 'top-0', 'left-0', 'w-full', 'h-full', 'z-30', 'opacity-20');
    let navmenuClass = cn('fixed', 'top-0', 'left-0', 'z-50', 'w-64', 'h-screen', 'p-4', 'overflow-y-auto', 'text-black',
        '-translate-x-full', 'transition-transform', 'data-[show-menu=true]:translate-x-0', 'bg-gray-100');
</script>

<div id={overlayId}
     class={overlayClass}
     role="dialog"
     class:hidden={!isOpen}></div>

<div {id}
     class={navmenuClass}
     data-show-menu={isOpen}
     {...otherProps}>
    <aside>
        {@render children?.()}
    </aside>
</div>