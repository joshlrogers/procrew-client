<script lang="ts">
	import { Icon, MaterialIcon } from '$lib/components/icon';
	import { Badge } from '$lib/components/badge';
	import type { FilterPreset } from '$lib/shared/stores/filterContext';

	interface FilterPresetsProps {
		presets: FilterPreset[];
		onApplyPreset: (presetId: string) => void;
		onRemovePreset?: (presetId: string) => void;
		onSavePreset?: (name: string) => void;
		activePresetId?: string;
		class?: string;
		showSaveButton?: boolean;
		showAsDropdown?: boolean;
		presetCounts?: Record<string, number>;
	}

	let {
		presets = [],
		onApplyPreset,
		onRemovePreset,
		onSavePreset,
		activePresetId = '',
		class: className = '',
		showSaveButton = true,
		showAsDropdown = false,
		presetCounts = {}
	}: FilterPresetsProps = $props();

	let isDropdownOpen = $state(false);
	let isSaveDialogOpen = $state(false);
	let newPresetName = $state('');
	let containerRef: HTMLDivElement;

	const handleApplyPreset = (presetId: string) => {
		onApplyPreset(presetId);
		if (showAsDropdown) {
			isDropdownOpen = false;
		}
	};

	const handleRemovePreset = (e: Event, presetId: string) => {
		e.stopPropagation();
		onRemovePreset?.(presetId);
	};

	const handleSavePreset = () => {
		if (newPresetName.trim()) {
			onSavePreset?.(newPresetName.trim());
			newPresetName = '';
			isSaveDialogOpen = false;
		}
	};

	const handleOutsideClick = (e: MouseEvent) => {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			isDropdownOpen = false;
		}
	};

	$effect(() => {
		if (isDropdownOpen) {
			document.addEventListener('click', handleOutsideClick);
		} else {
			document.removeEventListener('click', handleOutsideClick);
		}

		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	});

	const getPresetDisplayCount = (preset: FilterPreset) => {
		// Use provided preset counts if available, otherwise fallback to filter count
		if (presetCounts[preset.id] !== undefined) {
			return presetCounts[preset.id];
		}
		
		// Fallback: count non-default filter values
		return Object.values(preset.filters).filter(value => {
			if (typeof value === 'string') return value.trim() !== '' && value !== 'all';
			return value !== null && value !== undefined;
		}).length;
	};
</script>

<div class="relative {className}" bind:this={containerRef}>
	{#if showAsDropdown}
		<!-- Dropdown Version -->
		<div class="relative">
			<button
				type="button"
				class="flex items-center gap-2 px-3 py-2 border border-surface-300-600 rounded-lg bg-surface-50-900 hover:bg-surface-100-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
				onclick={() => isDropdownOpen = !isDropdownOpen}
			>
				<Icon icon={MaterialIcon.BOOKMARK} class="w-4 h-4 text-surface-600-300" />
				<span class="text-sm font-medium">Filter Presets</span>
				<Icon 
					icon={isDropdownOpen ? MaterialIcon.KEYBOARD_ARROW_UP : MaterialIcon.KEYBOARD_ARROW_DOWN} 
					class="w-4 h-4 text-surface-500-400" 
				/>
			</button>

			{#if isDropdownOpen}
				<div class="absolute z-50 w-64 mt-1 bg-surface-50-900 border border-surface-300-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
					<div class="p-2">
						{#each presets as preset}
							<div class="flex items-center justify-between group">
								<button
									type="button"
									class="flex-1 flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-100-800 rounded-lg transition-colors {activePresetId === preset.id ? 'bg-primary-50-900 text-primary-600-400' : ''}"
									onclick={() => handleApplyPreset(preset.id)}
								>
									<div class="flex-1 min-w-0">
										<div class="font-medium truncate">{preset.name}</div>
										{#if getPresetDisplayCount(preset) > 0}
											<div class="text-xs text-surface-500-400">
												{getPresetDisplayCount(preset)} filters
											</div>
										{/if}
									</div>
									{#if preset.isDefault}
										<Badge text="Default" variant="tonal" color="surface" size="sm" />
									{/if}
								</button>
								{#if !preset.isDefault && onRemovePreset}
									<button
										type="button"
										class="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-200-700 rounded transition-all"
										onclick={(e) => handleRemovePreset(e, preset.id)}
									>
										<Icon icon={MaterialIcon.DELETE} class="w-4 h-4 text-surface-500-400" />
									</button>
								{/if}
							</div>
						{/each}

						{#if showSaveButton && onSavePreset}
							<hr class="my-2 border-surface-200-700" />
							<button
								type="button"
								class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-100-800 rounded-lg transition-colors text-primary-600-400"
								onclick={() => isSaveDialogOpen = true}
							>
								<Icon icon={MaterialIcon.ADD} class="w-4 h-4" />
								<span class="font-medium">Save Current Filters</span>
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Horizontal Version -->
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1 text-sm text-surface-600-300">
				<Icon icon={MaterialIcon.BOOKMARK} class="w-4 h-4" />
				<span class="font-medium">Quick Filters:</span>
			</div>

			<div class="flex items-center gap-2 flex-wrap">
				{#each presets as preset}
					<button
						type="button"
						class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {activePresetId === preset.id ? 'bg-primary-100 text-primary-700 border-2 border-primary-500' : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-300'}"
						onclick={() => handleApplyPreset(preset.id)}
					>
						<span>{preset.name}</span>
						{#if getPresetDisplayCount(preset) > 0}
							<Badge text={getPresetDisplayCount(preset).toString()} variant="tonal" color="surface" size="sm" />
						{/if}
					</button>
				{/each}

				{#if showSaveButton && onSavePreset}
					<button
						type="button"
						class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-100-800 hover:bg-surface-200-700 text-surface-700-200 border border-surface-300-600 transition-colors"
						onclick={() => isSaveDialogOpen = true}
					>
						<Icon icon={MaterialIcon.ADD} class="w-4 h-4" />
						<span>Save</span>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Save Preset Dialog -->
{#if isSaveDialogOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-surface-50-900 rounded-lg p-6 w-full max-w-md mx-4">
			<h3 class="text-lg font-semibold mb-4">Save Filter Preset</h3>
			
			<div class="flex flex-col gap-4">
				<div>
					<label for="presetName" class="block text-sm font-medium text-surface-700-200 mb-1">
						Preset Name
					</label>
					<input
						id="presetName"
						bind:value={newPresetName}
						type="text"
						placeholder="Enter preset name..."
						class="w-full px-3 py-2 border border-surface-300-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50-900"
						onkeydown={(e) => e.key === 'Enter' && handleSavePreset()}
					/>
				</div>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-surface-700-200 bg-surface-100-800 hover:bg-surface-200-700 rounded-lg transition-colors"
						onclick={() => isSaveDialogOpen = false}
					>
						Cancel
					</button>
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
						onclick={handleSavePreset}
						disabled={!newPresetName.trim()}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}