import Root from "./iconButton.svelte";
import type {HTMLElementProps} from "$lib/components/shared/htmlElementProps";
import type {IconStyle} from "$lib/components/icon/IconStyle";

export interface IconButtonProps extends HTMLElementProps {
    doTransform?: boolean;
    icon?: string;
    iconStyle?: IconStyle;
    isRounded: boolean;
    onclick?: () => void;
}

export {
    Root as IconButton
}