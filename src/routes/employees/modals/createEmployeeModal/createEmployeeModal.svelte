<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { TextInput } from '$lib/components/inputs/index.js';
	import type { Snippet } from 'svelte';

	interface CreateEmployeeModalProps {
		trigger: Snippet;
	}

	let modalIsOpen = $state(false);
	let { trigger }: CreateEmployeeModalProps = $props();
</script>

<Modal
	open={modalIsOpen}
	onOpenChange={(os) => (modalIsOpen = os.open)}
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		{@render trigger?.()}
	{/snippet}

	{#snippet content()}
		<div class="flex flex-col gap-2">
			<TextInput
				label="Last name"
				name="last_name"
				class="min-w-96"
				placeholder="Last name"
			/>
			<TextInput
				label="First name"
				name="first_name"
				class="min-w-96"
				placeholder="First name"
			/>
			<TextInput label="Title" name="title" class="min-w-96" placeholder="First name" />
			<TextInput
				label="Phone number"
				name="phone_number"
				class="min-w-96"
				placeholder="Phone number"
			/>
		</div>
	{/snippet}
</Modal>
