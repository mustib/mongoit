import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [
  'node:events',
  'crypto',
  'fs',
  'util/types',
  '@mustib/utils',
  '@mustib/utils/node',
  'mongodb',
  'file-type',
];

export default defineConfig([
  {
    input: './src/index.ts',

    output: [
      {
        format: 'es',
        sourcemap: true,
        file: 'dist/index.js',
      },
      {
        format: 'cjs',
        sourcemap: true,
        file: 'dist/index.cjs',
      },
    ],
    plugins: [typescript()],
    external,
  },
  {
    input: './src/index.ts',
    output: [{ file: './dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external,
  },
]);
