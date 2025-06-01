<script lang="ts">
	import '../app.css';
	import { MaterialIcon } from '$lib/components/icon';
	import { NavMenu, NavMenuDropdown, NavMenuGroup, NavMenuItem } from '$lib/components/navMenu/index.js';
	import { page } from '$app/state';
	import { ActiveCompany } from '$lib/shared/stores';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { Loader } from '$lib/components/loader';
	import { CompanySelectList } from '$lib/components/selectList';
	import { IconButton } from '$lib/components/buttons/iconButton';
	import { Toaster } from 'svelte-french-toast';
	import { afterNavigate } from '$app/navigation';
	import { ChangeDetails } from 'imask';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	let currentPath = $state(page.url.pathname);

	$effect(() => {
		if (currentPath !== page.url.pathname) {
			currentPath = page.url.pathname;
		}
	});

	onMount(() => {
		changeActiveCompany();
	});

	afterNavigate(() => {
		sidebarOpen = false;
	});

	function changeActiveCompany(companyId?: string) {
		if (!companyId) {
			fetch('/api/current/company', { method: 'GET' })
				.then(res => res.json())
				.then(json => {
					$ActiveCompany = json;
				});
		} else {
			fetch('/api/current/company', { method: 'POST', body: companyId })
				.then(res => res.json())
				.then(() => {
					$ActiveCompany = companyId;
				});
		}
	}
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
							<CompanySelectList {companies} value={$ActiveCompany} oncompanychanged={changeActiveCompany}  />
						{/await}
					</div>
				{/snippet}
			</AppBar>
		</header>

		<div class="grid grid-cols-1">
			<main class="p-4 space-y-4">
				<Toaster />

				{@render children?.()}
			</main>
		</div>

		<footer class="p-4"></footer>
	</div>
</div>

<span style="display:none;">
<NavMenu isOpen={sidebarOpen} onOpenChanged={(e) => sidebarOpen = e}>
	<NavMenuGroup>
		<NavMenuItem text="Customers" icon={MaterialIcon.PERSON} href="/customers" />
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