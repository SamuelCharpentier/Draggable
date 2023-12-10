import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	platform: 'browser',
	target: 'es2015',
	format: ['cjs'],
	dts: true,
	splitting: true,
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
