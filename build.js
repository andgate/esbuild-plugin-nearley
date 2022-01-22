const process = require('process')
const esbuild = require('esbuild')
const { peerDependencies } = require('./package.json')
const external = Object.keys(peerDependencies)

let watch = process.argv.some((arg) => arg == '--watch')

if (watch) {
  watch = {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded:', result)
    }
  }
}

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    platform: 'node',
    target: 'es6',
    format: 'cjs',
    sourcemap: true,
    bundle: true,
    external,
    watch
  })
  .catch(() => process.exit(1))
