import Root from './dialog.svelte';

enum DialogType {
	Error,
	Info,
	Success,
	Warn
}

export { Root as Dialog, DialogType };
