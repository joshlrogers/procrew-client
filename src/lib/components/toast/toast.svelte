<script lang="ts" context="module">
    export type ToastData = {
        title: string
        description: string
        color: string
    }

    const {
        elements: {content, title, description, close},
        helpers,
        states: {toasts},
        actions: {portal}
    } = createToaster<ToastData>()

    export const addToast = helpers.addToast
</script>

<script lang="ts">
    import {createToaster, melt} from '@melt-ui/svelte'
</script>

<div use:portal
     class="fixed right-0 top-0 z-50 m-4 flex flex-col items-end gap-2 md:bottom-0 md:top-auto">
    {#each $toasts as {id, data} (id)}
        <div use:melt={$content(id)} class="bg-conifer rounded-lg p-2 shadow-md w-[24rem]">
            <div>
                <button use:melt={$close(id)} aria-label="close notification"> X</button>
                <div>
                    <h3 use:melt={$title(id)}>
                        {data.title}
                        <span style:color={data.color}/>
                    </h3>
                    <div use:melt={$description(id)}>
                        {data.description}
                    </div>
                </div>

            </div>
        </div>
    {/each}
</div>