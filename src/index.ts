import MagicString, { SourceMap } from 'magic-string';
import { createFilter, FilterPattern } from '@rollup/pluginutils';

type Replacement = string | ((id: string) => string);

export interface RollupReplaceOptions {
  /**
   * All other options are treated as `string: replacement` replacers,
   * or `string: (id) => replacement` functions.
   */
  [str: string]:
  | Replacement
  | RollupReplaceOptions['include']
  | RollupReplaceOptions['values']
  | RollupReplaceOptions['preventAssignment'];

  /**
   * A minimatch pattern, or array of patterns, of files that should be
   * processed by this plugin (if omitted, all files are included by default)
   */
  include?: FilterPattern;
  /**
   * Files that should be excluded, if `include` is otherwise too permissive.
   */
  exclude?: FilterPattern;
  /**
   * To replace every occurrence of `<@foo@>` instead of every occurrence
   * of `foo`, supply delimiters
   */
  delimiters?: [string, string];
  /**
   * Prevents replacing strings where they are followed by a single equals
   * sign.
   */
  preventAssignment?: boolean;
  /**
   * You can separate values to replace from other options.
   */
  values?: { [str: string]: Replacement };
}

function escape(str: string) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function ensureFunction(functionOrValue: unknown) {
  if (typeof functionOrValue === 'function') return functionOrValue;
  return () => functionOrValue;
}

function longest(a: string, b: string) {
  return b.length - a.length;
}

function getReplacements(options: RollupReplaceOptions) {
  if (options.values) {
    return { ...options.values };
  }
  const values = { ...options };
  delete values.delimiters;
  delete values.preventAssignment;
  delete values.include;
  delete values.exclude;
  delete values.sourcemap;
  delete values.sourceMap;
  return values;
}

function mapToFunctions(object: Record<string, string>): Record<string, Function> {
  return Object.keys(object).reduce((fns, key) => {
    const functions = Object.assign({} as Record<string, Function>, fns);
    functions[key] = ensureFunction(object[key]);
    return functions;
  }, {});
}

export default function replace(options: RollupReplaceOptions = {}) {
  // eslint-disable-next-line no-param-reassign
  options = {
    include: ['./src/**/*'],
    preventAssignment: true,
    ...options,
  };

  const filter = createFilter(options.include, options.exclude);
  const { delimiters, preventAssignment } = options;
  const replaced = getReplacements(options);

  // add env variables in options
  const vars = Object.keys(replaced).reduce((a, c) => {
    // eslint-disable-next-line no-param-reassign
    a[`process.env.${c}`] = JSON.stringify(replaced[c]);
    return a;
  }, {} as Record<string, string>);

  // add NUXT_ENV_ prefix env variables
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('NUXT_ENV')) {
      vars[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
  });

  // add empty process.env
  if (typeof vars['process.env'] === 'undefined') {
    vars['process.env'] = JSON.stringify({});
  }

  const functionValues = mapToFunctions(vars);
  const keys = Object.keys(functionValues).sort(longest).map(escape);
  const lookahead = preventAssignment ? '(?!\\s*=[^=])' : '';
  const pattern = delimiters
    ? new RegExp(
      `${escape(delimiters[0])}(${keys.join('|')})${escape(delimiters[1])}${lookahead}`,
      'g',
    )
    : new RegExp(`\\b(${keys.join('|')})\\b${lookahead}`, 'g');

  function codeHasReplacements(code: string, id: string, magicString: MagicString) {
    let result = false;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = pattern.exec(code))) {
      result = true;

      const start = match.index;
      const end = start + match[0].length;
      const replacement = String(functionValues[match[1]](id));
      magicString.overwrite(start, end, replacement);
    }
    return result;
  }

  function isSourceMapEnabled() {
    return options.sourceMap !== false && options.sourcemap !== false;
  }

  function executeReplacement(code: string, id: string) {
    const magicString = new MagicString(code);
    if (!codeHasReplacements(code, id, magicString)) {
      return null;
    }

    const result: { code: string, map?: SourceMap } = { code: magicString.toString() };
    if (isSourceMapEnabled()) {
      result.map = magicString.generateMap({ hires: true });
    }
    return result;
  }

  return {
    name: 'nuxt-env',

    transform(code: string, id: string) {
      if (!keys.length) return null;
      if (!filter(id)) return null;
      return executeReplacement(code, id);
    },
  };
}
