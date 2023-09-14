import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import clear from 'rollup-plugin-clear'
import path from 'node:path'
import pkg from './package.json' assert { type: 'json' }

const external = Object.keys(pkg.peerDependencies)
const { dir } = path.parse(pkg.module)

export default {
  input: './src/index.ts',
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
  plugins: [
    clear({
      targets: [dir],
    }),
    typescript({ compilerOptions: { declarationDir: dir } }),
    terser(),
  ],
  external,
}
