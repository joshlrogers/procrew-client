// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {Account} from "$lib/shared/models/account";
import { IStaticMethods } from "flyonui/flyonui"

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			account: Account | undefined;
			company: string | undefined;
			token: string | undefined;
		}
		//interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success',
				text: string
			}
		}
	}

	interface Window {
		HSStaticMethods: IStaticMethods
	}
}

export {};
