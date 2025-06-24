import tailwindcss from '@tailwindcss/vite';
import forms from '@tailwindcss/forms';

const config = {
	darkMode: ['selector', '[data-mode="dark"]'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	plugins: [tailwindcss, forms],
	theme: {
		extend: {
			zIndex: {
				'100': '100'
			},
			colors: {
				'regent-gray': {
					DEFAULT: '#8094a0',
					'50': '#f8fafa',
					'100': '#f2f5f5',
					'200': '#e7eced',
					'300': '#d3dddf',
					'400': '#b9c7cc',
					'500': '#9caeb6',
					'600': '#8094a0',
					'700': '#718490',
					'800': '#5f6e78',
					'900': '#4f5b63',
					'950': '#333d42'
				},
				'sandy-brown': {
					DEFAULT: '#ffa759',
					'50': '#fff6ed',
					'100': '#ffebd4',
					'200': '#ffd3a9',
					'300': '#ffa759',
					'400': '#fe8a39',
					'500': '#fc6813',
					'600': '#ed4e09',
					'700': '#c53809',
					'800': '#9c2d10',
					'900': '#7e2710',
					'950': '#441106'
				},
				sunglow: {
					DEFAULT: '#ffca3a',
					'50': '#fffaeb',
					'100': '#fff2c6',
					'200': '#ffe388',
					'300': '#ffca3a',
					'400': '#ffb920',
					'500': '#f99707',
					'600': '#dd6f02',
					'700': '#b74d06',
					'800': '#943a0c',
					'900': '#7a310d',
					'950': '#461802'
				},
				lochmara: {
					DEFAULT: '#1982c4',
					'50': '#f2f8fd',
					'100': '#e3f0fb',
					'200': '#c1e2f6',
					'300': '#8ac9ef',
					'400': '#4caee4',
					'500': '#2594d2',
					'600': '#1982c4',
					'700': '#145e90',
					'800': '#145078',
					'900': '#164364',
					'950': '#0f2c42'
				},
				'coral-red': {
					DEFAULT: '#ff3036',
					'50': '#fff1f1',
					'100': '#ffdfe0',
					'200': '#ffc5c7',
					'300': '#ff9da0',
					'400': '#ff6468',
					'500': '#ff3036',
					'600': '#ed151b',
					'700': '#c80d12',
					'800': '#a50f13',
					'900': '#881417',
					'950': '#4b0406'
				},
				lavender: {
					DEFAULT: '#ad77d9',
					'50': '#faf7fd',
					'100': '#f4ecfb',
					'200': '#eaddf7',
					'300': '#dac2f0',
					'400': '#c39be5',
					'500': '#ad77d9',
					'600': '#9556c7',
					'700': '#8043ad',
					'800': '#6c3b8e',
					'900': '#593073',
					'950': '#3b1952'
				},
				conifer: {
					DEFAULT: '#9eda3d',
					'50': '#f6fde8',
					'100': '#ebf9ce',
					'200': '#d7f3a3',
					'300': '#bce96d',
					'400': '#9eda3d',
					'500': '#81c022',
					'600': '#639917',
					'700': '#4c7516',
					'800': '#3e5d17',
					'900': '#364f18',
					'950': '#1a2b08'
				}
			},
			transitionProperty: {
				marginLeft: 'margin-left',
				width: 'width'
			}
		}
	}
};

export default config;
