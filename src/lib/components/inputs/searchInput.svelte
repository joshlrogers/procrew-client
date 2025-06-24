<script lang="ts">
    import { Icon, MaterialIcon } from '$lib/components/icon';

    interface SearchInputProps {
        placeholder?: string;
        value?: string;
        debounceMs?: number;
        onSearch?: (value: string) => void;
        onClear?: () => void;
        class?: string;
    }

    let { 
        placeholder = 'Search...', 
        value = '', 
        debounceMs = 300,
        onSearch,
        onClear,
        class: className = ''
    }: SearchInputProps = $props();

    let inputElement: HTMLInputElement;
    let searchValue = $state(value);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Update searchValue when value prop changes
    $effect(() => {
        searchValue = value;
    });

    // Debounced search effect - only triggers when searchValue changes
    $effect(() => {
        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer - this will trigger when searchValue changes
        debounceTimer = setTimeout(() => {
            console.log('SearchInput: Triggering search with value:', searchValue);
            if (onSearch) {
                onSearch(searchValue);
            }
        }, debounceMs);

        // Cleanup function
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    });

    const handleClear = () => {
        searchValue = '';
        if (onClear) {
            onClear();
        }
        inputElement?.focus();
    };

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClear();
        }
    };
</script>

<div class="relative {className}">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon icon={MaterialIcon.SEARCH} class="text-surface-400" />
    </div>
    
    <input
        bind:this={inputElement}
        bind:value={searchValue}
        type="text"
        {placeholder}
        onkeydown={handleKeydown}
        class="input pl-10 pr-10 w-full"
    />
    
    {#if searchValue}
        <button
            type="button"
            onclick={handleClear}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Clear search"
        >
            <Icon icon={MaterialIcon.CLOSE} />
        </button>
    {/if}
</div> 