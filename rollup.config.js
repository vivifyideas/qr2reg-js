import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import image from 'rollup-plugin-img';
import copy from 'rollup-plugin-copy';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const plugins = [
  babel({
    exclude: 'node_modules/**',
  }),
  resolve(),
  image(),
  copy({
    targets: [
      { src: 'lib/styles/*', dest: 'dist' },
    ]
  }),
  commonjs(),
];

export default [
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/regzen.min.js',
      format: 'umd',
      name: 'RegzenClient',
    },
    plugins: [...plugins, uglify()],
  },
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'RegzenClient',
    },
    plugins,
  },
];
