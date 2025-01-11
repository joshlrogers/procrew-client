<script lang="ts">
	import { SelectList } from '$lib/components/selectList/index';
	import type { Company } from '$lib/shared/models/company';
	import { MaterialIcon } from '$lib/components/icon';

	interface CompanySelectListOptions {
		companies?: Company[];
		value?: string;
		oncompanychanged?: (companyId: string) => void;
	}

	let {
		companies = [],
		value = $bindable(),
		oncompanychanged = undefined
	}: CompanySelectListOptions = $props();

	let availableCompanies = $state(companies);

	const getIcon = (companyType: string | undefined) => {
		let icon: MaterialIcon | undefined;
		switch (companyType) {
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

		return icon;
	};

	let availableCompanyOptions = $derived(availableCompanies.map(company => {
		let icon = getIcon(company.companyType?.name);
		return {
			value: company.id!,
			label: company.name,
			icon
		};
	}));
</script>

<SelectList items={availableCompanyOptions}
						required={true}
						{value}
						wrapperClass="min-w-64"
						onchanged={(val) => {
							if(typeof val === 'string')  {
								value=val;
								oncompanychanged?.(val)
							}
						}} />