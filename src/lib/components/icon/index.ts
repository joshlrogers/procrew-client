import Root from './icon.svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface IconProps extends HTMLAttributes<HTMLElement> {
	icon: MaterialIcon;
	iconSize?: 'default' | 'small' | 'medium' | 'large';
}

enum MaterialIcon {
	ADD = 'add',
	ARROW_DROP_DOWN = 'arrow_drop_down',
	ARROW_DROP_UP = 'arrow_drop_up',
	ARROW_LEFT = 'arrow_left',
	ARROW_FORWARD_IOS = 'arrow_forward_ios',
	ARROW_RIGHT = 'arrow_right',
	BADGE = 'badge',
	BOLT = 'bolt',
	BUSINESS = 'business',
	BUSINESS_CENTER = 'business_center',
	CLEANING_SERVICES = 'cleaning_services',
	DATE_RANGE = 'date_range',
	DELETE = 'delete',
	EDIT = 'edit',
	ENGINEERING = 'engineering',
	EVENT = 'event',
	GRASS = 'grass',
	GROUPS = 'groups',
	HOW_TO_REG = 'how_to_reg',
	KEYBOARD_DOUBLE_ARROW_LEFT = 'keyboard_double_arrow_left',
	KEYBOARD_DOUBLE_ARROW_RIGHT = 'keyboard_double_arrow_right',
	LIST = 'list',
	MENU = 'menu',
	PERSON = 'person',
	RESTART = 'restart_alt',
	SETTINGS = 'settings'
}

export { Root as Icon, MaterialIcon, type IconProps };
