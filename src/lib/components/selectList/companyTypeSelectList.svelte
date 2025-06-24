<script lang="ts">
	import { SelectList } from '$lib/components/selectList';
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import type { CompanyType } from '$lib/shared/models/company';

	interface CompanyTypeSelectListProps {
		companyTypes?: CompanyType[];
		disabled?: boolean;
		label?: string | null;
		value?: number;
		oncompanytypechanged?: (companyTypeId: number) => void;
	}

	let {
		companyTypes = [],
		label = 'Company type',
		value = $bindable(),
		disabled = false,
		oncompanytypechanged = undefined
	}: CompanyTypeSelectListProps = $props();

	let availableCompanyTypes = $state(companyTypes);
	let companyTypeOptions = $derived(
		availableCompanyTypes.map((ct) => {
			let icon;
			switch (ct.name) {
				case 'Cleaning':
					icon = MaterialIcon.CLEANING_SERVICES;
					break;
				case 'Lawncare':
					icon = MaterialIcon.GRASS;
					break;
				case 'Maintenance':
					icon = MaterialIcon.ENGINEERING;
					break;
				default:
					icon = undefined;
			}
			// Convert string ID to number for consistency with companyTypeId
			return { value: parseInt(ct.id!), label: ct.name, icon };
		})
	);
	let currentCompanyType = $derived(
		companyTypeOptions[companyTypeOptions.findIndex((ct) => ct.value === value)]
	);
</script>

{#if !disabled}
	<SelectList
		items={companyTypeOptions}
		required={true}
		label={label ?? undefined}
		{value}
		onchanged={(val) => {
			if (typeof val === 'number') {
				oncompanytypechanged?.(val);
				value = val;
			}
		}}
	/>
{:else}
	<div class="flex items-center gap-2">
		{#if currentCompanyType.icon}
			<Icon icon={currentCompanyType.icon} />
		{/if}
		<span>
			{currentCompanyType.label}
		</span>
	</div>
{/if}
