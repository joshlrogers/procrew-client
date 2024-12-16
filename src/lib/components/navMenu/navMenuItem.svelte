<script lang="ts">
    import {page} from "$app/stores";
    import {Icon} from "$lib/components/icon";

    let {href, text, icon = undefined, iconClass = undefined, spanClass = 'ms-2', subText = undefined, ...otherProps} = $props();
    let isActive = $state($page.url.pathname === href);
    $effect(() => {
        isActive = $page.url.pathname === href;
    })

    let activeClass = 'flex items-center p-2 text-base font-normal text-primary bg-sandy-brown font-bold rounded-lg hover:cursor-default';
    let nonActiveClass = 'flex items-center p-2 text-base font-normal text-green-900 rounded-lg hover:bg-gray-200';

</script>

<li {...otherProps}>
    <a {href} class={isActive ? activeClass : nonActiveClass} aria-current={isActive ? 'page' : undefined}>
        {#if icon}
            <Icon icon={icon} class={iconClass} />
        {/if}
        <span class={spanClass}>{text}</span>
        {@render subText?.()}
    </a>
</li>