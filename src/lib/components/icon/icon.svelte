<script lang="ts">
    import {cn} from "$lib/utils";

    let {icon, class: extClass = undefined, ...otherProps} = $props();

    const iconClass = cn("material-symbols-rounded", extClass);
</script>

<span class={iconClass} {...otherProps}>{icon}</span>