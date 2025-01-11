import {writable} from 'svelte/store';

let currentCompany = writable<string>();

export {
	currentCompany
}