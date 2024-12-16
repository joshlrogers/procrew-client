<script lang="ts">
    import '../app.pcss';
    import {onMount} from "svelte";
    import {Icons} from "$lib/components/icon/Icons";
    import {NavMenu, NavMenuDropdown, NavMenuGroup, NavMenuItem} from "$lib/components/navMenu/index.js";
    import {NavBar} from "$lib/components/navBar";
    import {Icon} from "$lib/components/icon";
    import {Toast} from '$lib/components/toast';
    import {page} from "$app/stores";


    let {children} = $props();
    let sidebarOpen = $state(false);

    onMount(() => {
        document.onkeyup = (event: KeyboardEvent) => {
            if (event.key === "Escape" && sidebarOpen) {
                toggleSidebar();
            }
        }

        let overlay = document.getElementById("navigation-overlay");
        if (overlay) {
            overlay.onclick = () => {
                toggleSidebar();
            }
        }
    });

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    let currentPath = $state($page.url.pathname);

    $effect(() => {
        if (currentPath !== $page.url.pathname) {
            sidebarOpen = !sidebarOpen;
            currentPath = $page.url.pathname;
        }
    });
</script>

<Toast />

<NavBar>
    <button type="button"
            class="p-1"
            onclick={toggleSidebar}
            aria-controls="drawer-navigation">
        <Icon icon={Icons.MENU}/>
    </button>
</NavBar>

<NavMenu id="navigation-menu" overlayId="navigation-overlay" isOpen={sidebarOpen}>
    <NavMenuGroup>
        <NavMenuItem text="Company" icon={Icons.LIST} href="/company"/>
        <NavMenuItem text="Employees" icon={Icons.BADGE} href="/employees"/>
        <NavMenuDropdown leadingIcon={Icons.SETTINGS} title="Settings">
            <NavMenuItem text="Company" icon={Icons.BUSINESS} href="/settings/company"/>
            <NavMenuItem text="Organization" icon={Icons.BUSINESS_CENTER} href="/settings/organization"/>
            <NavMenuItem text="Accounts" icon={Icons.GROUPS} href="/settings/accounts"/>
        </NavMenuDropdown>
    </NavMenuGroup>
</NavMenu>

<div class="contents">
    {@render children?.()}
</div>