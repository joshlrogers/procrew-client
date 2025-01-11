<script lang="ts">
	import '../app.pcss';
	import { onMount } from 'svelte';
	import { MaterialIcon } from '$lib/components/icon';
	import { NavMenu, NavMenuDropdown, NavMenuGroup, NavMenuItem } from '$lib/components/navMenu/index.js';
	import { page } from '$app/stores';
	import { ActiveCompany } from '$lib/shared/stores';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { Loader } from '$lib/components/loader';
	import { CompanySelectList } from '$lib/components/selectList';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { ToastProvider } from '@skeletonlabs/skeleton-svelte';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	onMount(() => {
		document.onkeyup = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && sidebarOpen) {
				toggleSidebar();
			}
		};

		let overlay = document.getElementById('navigation-overlay');
		if (overlay) {
			overlay.onclick = () => {
				toggleSidebar();
			};
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

	$effect(() => {
		if (!$ActiveCompany) {
			fetch('/api/current/company', { method: 'GET' })
				.then(res => res.json())
				.then(json => {
					$ActiveCompany = json;
				});
		} else {
			fetch('/api/current/company', { method: 'POST', body: $ActiveCompany })
				.then(res => res.json());
		}
	});
</script>

<div class="grid grid-cols-1">
	<div class="grid grid-rows-[auto_1fr_auto]">
		<header class="sticky top-0 z-10">
			<AppBar background="bg-surface-900/80" classes="backdrop-blur-sm">
				{#snippet lead()}
					<div>
						<IconButton flat={true}
												icon={MaterialIcon.MENU}
												onclick={toggleSidebar} />
					</div>
				{/snippet}
				{#snippet trail()}
					<div>
						{#await data.companies}
							<Loader />
						{:then companies}
							<CompanySelectList {companies} bind:value={$ActiveCompany} />
						{/await}
					</div>
				{/snippet}
			</AppBar>
		</header>

		<div class="grid grid-cols-1">
			<main class="p-4 space-y-4">
				<ToastProvider placement="top-end">
					{@render children?.()}
				</ToastProvider>
			</main>
		</div>

		<footer class="p-4"></footer>
	</div>
</div>

<span style="display:none;">
<NavMenu isOpen={sidebarOpen}>
	<NavMenuGroup>
		<NavMenuItem text="Company" icon={MaterialIcon.LIST} href="/company" />
		<NavMenuItem text="Employees" icon={MaterialIcon.BADGE} href="/employees" />
		<NavMenuDropdown leadingIcon={MaterialIcon.SETTINGS} title="Settings">
			<NavMenuItem text="Company" icon={MaterialIcon.BUSINESS} href="/settings/company" />
			<NavMenuItem text="Organization" icon={MaterialIcon.BUSINESS_CENTER} href="/settings/organization" />
			<NavMenuItem text="Accounts" icon={MaterialIcon.GROUPS} href="/settings/accounts" />
		</NavMenuDropdown>
	</NavMenuGroup>
</NavMenu>
</span>