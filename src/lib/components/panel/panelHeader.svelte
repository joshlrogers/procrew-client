<script lang="ts">
    let {children, ...otherProps} = $props();
</script>

<div {...otherProps}>
    {@render children?.()}
</div>