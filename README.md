# esbuild-plugin-nearley

## Usage

1. Install the Plugin

```
npm install esbuild-plugin-nearley
```

2. Now you can import \*.ne files from javascript:

```
import grammar from './grammar.ne';
```

3. To get typechecking to work, place this in a source file anywhere in your project.

```
import { CompiledRules } from 'nearley'

declare module '*.ne' {
  const value: CompiledRules
  export default value
}
```

Now importing nearley grammar files will magically give you a `CompiledRules` object!

## Development

Use `pnpm` instead of npm.

To build and watch source for changes and type errors:

```
pnpm start
```

To build the package for deployment:

```
pnpm build
```

## License

MIT License
