<script lang="ts">
	import { Panel } from '$lib/components/panel';
	import { Breadcrumb } from '$lib/components/breadcrumb';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { LeadStatus, LeadPriority } from '$lib/shared/models/lead';

	let { data } = $props();

	// Get display name for the lead
	let leadDisplayName = $derived.by(() => {
		if (data.lead.companyName?.trim()) {
			return data.lead.companyName;
		} else {
			return `${data.lead.firstName || ''} ${data.lead.lastName || ''}`.trim() || 'Lead';
		}
	});

	// Format status for display
	const getStatusDisplay = (status: number) => {
		switch (status) {
			case LeadStatus.New: return 'New';
			case LeadStatus.Contacted: return 'Contacted';
			case LeadStatus.Qualified: return 'Qualified';
			case LeadStatus.Closed: return 'Closed';
			default: return 'Unknown';
		}
	};

	// Format priority for display
	const getPriorityDisplay = (priority: number | null) => {
		if (priority === null) return 'Not Set';
		switch (priority) {
			case LeadPriority.Low: return 'Low';
			case LeadPriority.Medium: return 'Medium';
			case LeadPriority.High: return 'High';
			default: return 'Unknown';
		}
	};

	// Format currency
	const formatCurrency = (value: number | null) => {
		if (!value) return 'Not specified';
		return new Intl.NumberFormat('en-US', { 
			style: 'currency', 
			currency: 'USD' 
		}).format(value);
	};
</script>

<svelte:head>
	<title>Lead Details - {leadDisplayName}</title>
</svelte:head>

<div class="flex flex-col items-center gap-4">
	<div class="mb-[-1rem] flex w-[75%] content-start pl-4">
		<Breadcrumb
			items={[
				{ label: 'Home', url: '/' },
				{ label: 'Sales', url: '/sales' },
				{ label: leadDisplayName, url: `/sales/${data.lead.id}` }
			]}
		/>
	</div>
	<Panel class="w-[75%]">
		{#snippet header()}
			<div class="flex items-center gap-3">
				<Icon icon={MaterialIcon.PERSON} iconSize="2rem" />
				<div>
					<h1 class="text-xl font-semibold">Lead Details</h1>
					<p class="text-sm opacity-75">{leadDisplayName}</p>
				</div>
			</div>
		{/snippet}
		{#snippet content()}
			<div class="flex w-full flex-col gap-6">
				<!-- Contact Information Section -->
				<section>
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Contact Information</h3>
					<div class="flex w-full flex-row p-2">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 w-full">
							{#if data.lead.salutation}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">Salutation</span>
									<p class="text-sm">{data.lead.salutation}</p>
								</div>
							{/if}
							
							{#if data.lead.companyName}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">Company Name</span>
									<p class="text-sm">{data.lead.companyName}</p>
								</div>
							{/if}
							
							{#if data.lead.firstName}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">First Name</span>
									<p class="text-sm">{data.lead.firstName}</p>
								</div>
							{/if}
							
							{#if data.lead.lastName}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">Last Name</span>
									<p class="text-sm">{data.lead.lastName}</p>
								</div>
							{/if}
							
							{#if data.lead.emailAddress}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">Email Address</span>
									<p class="text-sm">
										<a href="mailto:{data.lead.emailAddress}" class="anchor">
											{data.lead.emailAddress}
										</a>
									</p>
								</div>
							{/if}
							
							{#if data.lead.phoneNumber}
								<div class="flex flex-col gap-1">
									<span class="text-sm font-medium">Phone Number</span>
									<p class="text-sm">
										<a href="tel:{data.lead.phoneNumber}" class="anchor">
											{data.lead.phoneNumber}
										</a>
									</p>
								</div>
							{/if}
						</div>
					</div>
				</section>

				<!-- Lead Details Section -->
				<section>
					<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Lead Details</h3>
					<div class="flex w-full flex-row p-2">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-3 w-full">
							<div class="flex flex-col gap-1">
								<span class="text-sm font-medium">Status</span>
								<p class="text-sm">
									<span class="badge variant-filled-{data.lead.status === LeadStatus.New ? 'surface' :
									 data.lead.status === LeadStatus.Contacted ? 'primary' :
									 data.lead.status === LeadStatus.Qualified ? 'success' :
									 'tertiary'}">
										{getStatusDisplay(data.lead.status)}
									</span>
								</p>
							</div>
							
							<div class="flex flex-col gap-1">
								<span class="text-sm font-medium">Priority</span>
								<p class="text-sm">
									{#if data.lead.priority !== null}
										<span class="badge variant-filled-{data.lead.priority === LeadPriority.High ? 'error' :
										 data.lead.priority === LeadPriority.Medium ? 'warning' :
										 'surface'}">
											{getPriorityDisplay(data.lead.priority)}
										</span>
									{:else}
										<span class="text-surface-500">Not Set</span>
									{/if}
								</p>
							</div>
							
							<div class="flex flex-col gap-1">
								<span class="text-sm font-medium">Estimated Value</span>
								<p class="text-sm font-mono">{formatCurrency(data.lead.estimatedValue)}</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Address Section -->
				{#if data.lead.address}
					<section>
						<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Address</h3>
						<div class="flex w-full flex-row p-2">
							<div class="text-sm space-y-1">
								{#if data.lead.address.addressLine1}
									<p>{data.lead.address.addressLine1}</p>
								{/if}
								{#if data.lead.address.addressLine2}
									<p>{data.lead.address.addressLine2}</p>
								{/if}
								{#if data.lead.address.addressLine3}
									<p>{data.lead.address.addressLine3}</p>
								{/if}
								{#if data.lead.address.city || data.lead.address.state || data.lead.address.postalCode}
									<p>
										{data.lead.address.city || ''}{data.lead.address.city && data.lead.address.state ? ', ' : ''}{data.lead.address.state || ''} {data.lead.address.postalCode || ''}
									</p>
								{/if}
								{#if data.lead.address.country}
									<p>{data.lead.address.country}</p>
								{/if}
							</div>
						</div>
					</section>
				{/if}

				<!-- Notes Section -->
				{#if data.lead.notes}
					<section>
						<h3 class="text-lg bg-surface-200-800 px-2 mb-4 rounded">Notes</h3>
						<div class="flex w-full flex-row p-2">
							<div class="card p-4 w-full">
								<p class="text-sm whitespace-pre-wrap">{data.lead.notes}</p>
							</div>
						</div>
					</section>
				{/if}
			</div>
		{/snippet}
	</Panel>
</div>