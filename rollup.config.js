import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'js/main.js',
  output: {
    dir: 'dist/js',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js',
    assetFileNames: '[name][extname]'
  },
  plugins: [
    nodeResolve(),
    terser()
  ],
  external: ['three']
}; 