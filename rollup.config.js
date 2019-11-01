import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/regzen.min.js',
    format: 'umd',
    name: 'RegzenClient',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    postcss({
      extensions: ['.css'],
    }),
    resolve(),
    commonjs(),
    uglify(),
  ],
};
