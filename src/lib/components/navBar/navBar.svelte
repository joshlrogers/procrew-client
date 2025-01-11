<script lang="ts">
    import {cn} from "$lib/utils";

    let {id = undefined, children = undefined} = $props();

    let navClass = 'bg-card';
    let navbarClass = cn('max-w-screen', 'flex', 'flex-wrap', 'items-start', 'justify-between');
</script>

<nav {id} class={navClass}>
    <div class={navbarClass}>
        {@render children?.()}
    </div>
</nav>