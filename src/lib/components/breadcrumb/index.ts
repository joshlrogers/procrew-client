import Breadcrumb from './breadcrumb.svelte';

export { Breadcrumb };

export type BreadcrumbItem = {
	label: string;
	url: string;
	icon?: import('$lib/components/icon').MaterialIcon;
};
