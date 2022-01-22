import * as path from 'path'
import * as fs from 'fs'
import { version } from 'nearley/package.json'
import * as nearley from 'nearley'
import * as nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js'
import Compile from 'nearley/lib/compile'
import lint from 'nearley/lib/lint'
import generate from 'nearley/lib/generate'
import { Plugin, PluginBuild } from 'esbuild'

export type NearleyPluginOptions = {
  export: string
  quiet: boolean
}

const defaultNearleyPluginOptions: NearleyPluginOptions = {
  export: 'grammar',
  quiet: false
}

const parserGrammar = nearley.Grammar.fromCompiled(nearleyGrammar)

function compileNearley(
  path: string,
  txt: string,
  opts: NearleyPluginOptions
): string {
  const parser = new nearley.Parser(parserGrammar)
  parser.feed(txt)
  const c = Compile(
    parser.results[0],
    Object.assign({ version: version, args: [path] }, opts)
  )

  if (!opts.quiet) {
    lint(c, { out: process.stderr, version: version })
  }
  return generate(c, opts.export)
}

export function NearlyPlugin(
  opts: NearleyPluginOptions = defaultNearleyPluginOptions
): Plugin {
  return {
    name: 'esbuild-plugin-nearley',
    setup(build: PluginBuild) {
      // Intercept paths which end in ".ne" so esbuild doesn't attempt
      // to map them to a file system location. Tag them with the "nearley"
      // namespace to reserve them for this plugin.
      build.onResolve({ filter: /^.*\.ne$/ }, (args) => ({
        path: path.resolve(args.resolveDir, args.path),
        namespace: 'nearley'
      }))

      // Load paths tagged with the "nearley" namespace and behave as if
      // they point to a typescript file containing the transpiled source.
      build.onLoad({ filter: /.*/, namespace: 'nearley' }, async (args) => {
        const ns_path = args.path
        const txt = await fs.promises.readFile(ns_path, 'utf8')

        let contents = ''
        try {
          contents = compileNearley(ns_path, txt, opts)
        } catch (e) {
          return {
            errors: [{ text: e.message }],
            resolveDir: path.dirname(ns_path),
            watchFiles: [ns_path]
          }
        }

        return {
          contents,
          loader: 'js',
          resolveDir: path.dirname(ns_path),
          watchFiles: [ns_path]
        }
      })
    }
  }
}

export default NearlyPlugin(defaultNearleyPluginOptions)
