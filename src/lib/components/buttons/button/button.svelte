<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    import {cn} from "$lib/utils";
    import {ButtonStyle} from "$lib/components/buttons/button/index";

    interface ButtonProps extends HTMLButtonAttributes {
        backgroundColor?: string;
        baseClass?: string;
        buttonStyle?: ButtonStyle;
        disabled?: boolean;
        height?: string;
        text: string;
        type?: 'submit' | 'reset' | 'button';
        width?: string;
    }

    let {
        baseClass = "btn",
        buttonStyle = ButtonStyle.PRIMARY,
        class: extClass = undefined,
        text,
        backgroundColor = "",
        disabled = false,
        height = 'h-[2.75rem]',
        width = 'w-[5rem]',
        type = 'button',
        ...otherProps
    }: ButtonProps = $props();

    let innerButtonStyle = '';
    switch (buttonStyle) {
        case ButtonStyle.PRIMARY:
            innerButtonStyle = 'preset-filled-primary-500';
            break;
        case ButtonStyle.SECONDARY:
            innerButtonStyle = 'preset-tonal-secondary';
            break;
    }

    let buttonClass = $derived(cn(baseClass, innerButtonStyle, backgroundColor, height, width, extClass));
</script>

<button {...otherProps}
        {disabled}
        {type}
        class={buttonClass}>
    {text}
</button>
