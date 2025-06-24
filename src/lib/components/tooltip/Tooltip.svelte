<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type TooltipVariant = 'default' | 'dark' | 'light' | 'error' | 'warning' | 'success' | 'info';
	type TooltipSize = 'sm' | 'md' | 'lg';
	type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

	interface TooltipProps {
		children: Snippet;
		text: string;
		variant?: TooltipVariant;
		size?: TooltipSize;
		position?: TooltipPosition;
		disabled?: boolean;
		openDelay?: number;
		cursor?: 'default' | 'pointer' | 'help' | 'not-allowed';
		maxWidth?: string;
		triggerClass?: string;
		arrow?: boolean;
		arrowClass?: string;
	}

	let {
		children,
		text,
		variant = 'default',
		size = 'md',
		position = 'bottom',
		disabled = false,
		openDelay = 300,
		cursor = 'pointer',
		maxWidth,
		triggerClass = '',
		arrow = true,
		arrowClass = ''
	}: TooltipProps = $props();

	let isVisible = $state(false);
	let timeoutId: number | null = null;
	let triggerElement = $state<HTMLElement>();
	let tooltipElement = $state<HTMLElement>();

	// Variant styles
	const variantStyles = {
		default: 'bg-tertiary-950 text-tertiary-50',
		dark: 'bg-surface-950 text-surface-50',
		light: 'bg-tertiary-100 text-black border border-tertiary-50 shadow-lg',
		error: 'bg-error-200 text-error-950',
		warning: 'bg-warning-200 text-warning-950',
		success: 'bg-success-200 text-success-950',
		info: 'bg-tertiary-50 text-tertiary-950'
	};

	// Size styles
	const sizeStyles = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-2 py-1',
		lg: 'text-base px-2 py-1.5'
	};

	// Arrow styles based on variant and position
	const getArrowStyles = (variant: TooltipVariant, position: TooltipPosition) => {
		const baseArrow = 'absolute w-0 h-0';

		// Define all possible color combinations to ensure Tailwind includes them
		const arrowClasses = {
			default: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-tertiary-950`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-tertiary-950`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-tertiary-950`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-tertiary-950`
			},
			dark: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-surface-950`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-surface-950`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-surface-950`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-surface-950`
			},
			light: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-tertiary-100`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-tertiary-100`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-tertiary-100`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-tertiary-100`
			},
			error: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-error-200`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-error-200`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-error-200`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-error-200`
			},
			warning: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-warning-200`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-warning-200`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-warning-200`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-warning-200`
			},
			success: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-success-200`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-success-200`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-success-200`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-success-200`
			},
			info: {
				top: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-t-6 border-t-tertiary-50`,
				bottom: `${baseArrow} border-l-6 border-r-6 border-l-transparent border-r-transparent border-b-6 border-b-tertiary-50`,
				left: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-l-6 border-l-tertiary-50`,
				right: `${baseArrow} border-t-6 border-b-6 border-t-transparent border-b-transparent border-r-6 border-r-tertiary-50`
			}
		};

		return arrowClasses[variant][position];
	};

	const triggerBaseClass = $derived(
		cn(
			'inline-block',
			`cursor-${cursor}`,
			disabled && 'cursor-not-allowed opacity-50',
			triggerClass
		)
	);

	const tooltipBaseClass = $derived(
		cn(
			'fixed z-50 rounded-md font-normal leading-tight transition-opacity duration-200',
			'pointer-events-none select-none',
			variantStyles[variant],
			sizeStyles[size],
			maxWidth ? `max-w-[${maxWidth}]` : 'max-w-48',
			isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
		)
	);

	const arrowBaseClass = $derived(cn(getArrowStyles(variant, position), arrowClass));

	function showTooltip() {
		if (disabled || !text.trim()) return;

		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			isVisible = true;
			positionTooltip();
		}, openDelay);
	}

	function hideTooltip() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		isVisible = false;
	}

	function positionTooltip() {
		if (!triggerElement || !tooltipElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();
		const gap = arrow ? 10 : 4;

		let left = 0;
		let top = 0;

		switch (position) {
			case 'top':
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				top = triggerRect.top - tooltipRect.height - gap;
				break;
			case 'bottom':
				left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				top = triggerRect.bottom + gap;
				break;
			case 'left':
				left = triggerRect.left - tooltipRect.width - gap;
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				break;
			case 'right':
				left = triggerRect.right + gap;
				top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				break;
		}

		// Ensure tooltip stays within viewport bounds
		left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
		top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));

		tooltipElement.style.left = `${left}px`;
		tooltipElement.style.top = `${top}px`;

		// Position arrow
		if (arrow) {
			const arrowElement = tooltipElement.querySelector('.tooltip-arrow') as HTMLElement;
			if (arrowElement) {
				positionArrow(arrowElement, tooltipRect, triggerRect);
			}
		}
	}

	function positionArrow(arrowElement: HTMLElement, tooltipRect: DOMRect, triggerRect: DOMRect) {
		switch (position) {
			case 'top':
				arrowElement.style.left = `${tooltipRect.width / 2 - 6}px`;
				arrowElement.style.top = `${tooltipRect.height}px`;
				arrowElement.style.bottom = 'auto';
				arrowElement.style.right = 'auto';
				break;
			case 'bottom':
				arrowElement.style.left = `${tooltipRect.width / 2 - 6}px`;
				arrowElement.style.top = `-6px`;
				arrowElement.style.bottom = 'auto';
				arrowElement.style.right = 'auto';
				break;
			case 'left':
				arrowElement.style.left = `${tooltipRect.width}px`;
				arrowElement.style.top = `${tooltipRect.height / 2 - 6}px`;
				arrowElement.style.bottom = 'auto';
				arrowElement.style.right = 'auto';
				break;
			case 'right':
				arrowElement.style.left = `-6px`;
				arrowElement.style.top = `${tooltipRect.height / 2 - 6}px`;
				arrowElement.style.bottom = 'auto';
				arrowElement.style.right = 'auto';
				break;
		}
	}

	// Don't render tooltip if disabled or no text
	const shouldRender = $derived(!disabled && text.trim().length > 0);
</script>

<span
	class={triggerBaseClass}
	bind:this={triggerElement}
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocus={showTooltip}
	onblur={hideTooltip}
	role="button"
	tabindex="0"
	aria-describedby={shouldRender && isVisible ? 'tooltip' : undefined}
>
	{@render children?.()}
</span>

{#if shouldRender}
	<div
		class={tooltipBaseClass}
		bind:this={tooltipElement}
		role="tooltip"
		id="tooltip"
		aria-hidden={!isVisible}
	>
		{text}
		{#if arrow}
			<div class="tooltip-arrow {arrowBaseClass}"></div>
		{/if}
	</div>
{/if}
