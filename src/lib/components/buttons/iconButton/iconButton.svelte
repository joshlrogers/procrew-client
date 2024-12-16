<script lang="ts">
    import {Icon} from "$lib/components/icon";
    import {Icons} from "$lib/components/icon/Icons";
    import type {IconButtonProps} from "$lib/components/buttons/iconButton/index";
    import {cn} from "$lib/utils";

    let {
        icon = undefined,
        iconStyle = undefined,
        id = undefined,
        onclick = undefined,
        isRounded = false,
        class: className = undefined,
        ...otherProps
    }: IconButtonProps = $props();

    if((icon && !iconStyle) || (!icon && iconStyle)) {
        throw new Error("If either `icon` or `iconStyle` are provided, both must be provided.")
    }

    const buttonClasses = cn("aspect-auto", "grid", "place-items-center", "w-10", "h-10", "shadow",
        "bg-primary", "text-primary-foreground", isRounded ? "rounded-full" : "", className);
</script>

<button id={id}
        class={buttonClasses}
        onclick={onclick}
        {...otherProps}>
    <Icon icon={Icons.MENU} />
</button>