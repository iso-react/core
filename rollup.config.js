import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import node from 'rollup-plugin-node-resolve'

import pkg from './package.json';

const external = {
  'react' : 'React',
  'react-dom' : 'ReactDOM',
  'html-react-parser' : 'parse',
  'react-helmet' : 'Helmet',
}

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      globals: external
    },
    {
      file: pkg.module,
      format: 'es',
      globals: external
    },
  ],
  external: Object.keys(external),
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
    node({
      jsnext: true,
      main: true,
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/react-dom/server.js': ['default'],
      },
    }),
    autoExternal(),
  ],
};
