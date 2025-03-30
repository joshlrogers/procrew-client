import type { Preview } from '@storybook/svelte';

import '../src/app.css';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import * as themes from '@skeletonlabs/skeleton/themes';

const preview: Preview = {
	decorators: [
		withThemeByDataAttribute({
			themes: {
				vintage: themes.vintage.name,
				vox: themes.vox.name
			},
			defaultTheme: 'vintage',
			attributeName: 'data-theme',
			parentSelector: 'body'
		})
	],
	parameters: {
		rootAttributes: [
			{
				root: "body",
				attribute: 'data-mode',
				defaultState: {
					"name": "Default",
					"value": "dark"
				},
				states: [
					{
						"name": "Dark",
						"value": "dark"
					},
					{
						"name": "Light",
						"value": "light"
					}
				]
			}
		],
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
