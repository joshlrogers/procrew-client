import Root from "./icon.svelte";
import type { HTMLAttributes } from 'svelte/elements';

interface IconProps extends HTMLAttributes<HTMLElement> {
    icon: MaterialIcon
}

enum MaterialIcon {
    ADD = 'add',
    ARROW_DROP_DOWN = 'arrow_drop_down',
    ARROW_DROP_UP = 'arrow_drop_up',
    ARROW_LEFT = 'arrow_left',
    BADGE ='badge',
    BOLT='bolt',
    BUSINESS= 'business',
    BUSINESS_CENTER = 'business_center',
    CHECK = 'check',
    CLEANING_SERVICES = 'cleaning_services',
    EDIT = 'edit',
    ENGINEERING = 'engineering',
    GRASS = 'grass',
    GROUPS = 'groups',
    LIST = 'list',
    MENU = 'menu',
    RESTART = 'restart_alt',
    SETTINGS = 'settings'
}

export {
    Root as Icon,
    MaterialIcon,
    type IconProps,
}