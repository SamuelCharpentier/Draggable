import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'], // Build for commonJS and ESmodules
	dts: true, // Generate declaration file (.d.ts)
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: true,
	treeshake: true,
	outExtension({ format }) {
		return {
			js: `.${format}.js`,
			dts: '.d.ts',
		};
	},
	outDir: 'dist',
	env: {
		NODE_ENV: 'production',
	},
});
