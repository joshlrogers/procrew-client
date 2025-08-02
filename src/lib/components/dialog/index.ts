import Root from './dialog.svelte';
import ClosedReasonDialog from './ClosedReasonDialog.svelte';

enum DialogType {
	Error,
	Info,
	Success,
	Warn
}

export { Root as Dialog, ClosedReasonDialog, DialogType };
