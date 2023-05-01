import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			// these are the aliases and paths to them
			$functions: path.resolve('src', 'functions'),
			$: path.resolve('src', 'store'),
			$routes: path.resolve('src', 'routes'),
			$c: path.resolve('src', 'routes', 'components'),
			$icons: path.resolve('src', 'routes', 'components', 'icons'),
			$buttons: path.resolve('src', 'routes', 'components', 'buttons'),
			$modals: path.resolve('src', 'routes', 'components', 'modals')
		}
	}
};

export default config;
