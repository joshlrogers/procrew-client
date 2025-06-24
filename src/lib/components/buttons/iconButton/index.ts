import Root from './iconButton.svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { MaterialIcon } from '$lib/components/icon';

export interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
	doTransform?: boolean;
	icon: MaterialIcon;
	flat?: boolean;
	isRounded?: boolean;
	disabled?: boolean;
	width?: number;
	height?: number;
	onclick?: () => void;
	textColor?: string;
	tooltip?: string;
	type?: 'button' | 'submit' | 'reset';
}

export { Root as IconButton };
