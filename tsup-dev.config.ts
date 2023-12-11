import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/draggable.ts'],
	platform: 'browser',
	target: 'es5',
	format: ['esm'],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: false,
	treeshake: false,
	outDir: './dev/scripts',
	env: {
		NODE_ENV: 'development',
	},
	watch: ['src'],
});
