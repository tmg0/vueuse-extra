import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: ['./src/index.ts'],
  splitting: true,
  treeshake: !options.watch,
  clean: true,
  dts: true,
  format: ['esm'],
  minify: !options.watch,
}))
