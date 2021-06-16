<h1 align="center">vite-plugin-nuxt-env</h1>

⚡️ A Vite plugin which works just like env property in Nuxt.js

English | <a href="https://github.com/OrekiSH/vite-plugin-nuxt-env/blob/main/README-zh_CN.md">简体中文</a>

## Install

* First of all, install [vite v2.x](https://github.com/vitejs/vite)

* Then install the plugin

```bash
$ npm i -D vite-plugin-nuxt-env
# OR
$ yarn add -D vite-plugin-nuxt-env
```

## Usage

Write vite config

```js
// vite.config.js
import nuxtEnv from 'vite-plugin-nuxt-env'

const isProd = process.env.NUXT_ENV === 'production'

export default {
  plugins: [
    nuxtEnv({
      isProd,
      baseUrl: isProd ? 'https://foo.com' : 'https://bar.com'
    })
  ]
}
```

Define environment variables `NUXT_NEV` in npm scripts

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && NUXT_ENV=production vite build",
    "build:staging": "vue-tsc --noEmit && NUXT_ENV=staging vite build"
  }
}
```

Use environment variables

```js
import axios from 'axios'

export default axios.create({
  baseURL: process.env.baseUrl
})
```

```html
<template>
  <h1>{{ `${isProd}` }}</h1>
</template>

<script lang="ts" setup>
  console.warn(process.env.NUXT_NEV)
  const isProd = process.env.isProd
</script>
```

## process.env == {}

Note that console.log(process.env) will output {} but console.log(process.env.your_var) will still output your value.

```js
// before
if (process.env.test === 'testing123')
```

```js
// after
if ('testing123' === 'testing123')
```

## Automatic injection of environment variables

If you define environment variables starting with NUXT_ENV_ in the build phase (e.g. NUXT_ENV_COOL_WORD=freezing nuxt build or SET NUXT_ENV_COOL_WORD=freezing & nuxt build for the Windows console, they'll be automatically injected into the process environment. Be aware that they'll potentially take precedence over defined variables in your vite.config.js with the same name.

## options

### `preventAssignment`

Type: `Boolean`<br>
Default: `true`

Prevents replacing strings where they are followed by a single equals sign. For example, where the plugin is called as follows:

```js
replace({
  values: {
    'process.env.DEBUG': 'false',
  },
});
```

Observe the following code:

```js
// Input
process.env.DEBUG = false;
if (process.env.DEBUG === true) {
  //
}
// Without `preventAssignment`
false = false; // this throws an error because false cannot be assigned to
if (false === true) {
  //
}
// With `preventAssignment`
process.env.DEBUG = false;
if (false === true) {
  //
}
```

### `include`

Type: `String` | `Array[...String]`<br>
Default: `['./src/**/*']`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.

### `exclude`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.


### `values`

Type: `{ [key: String]: Replacement }`, where `Replacement` is either a string or a `function` that returns a string.
Default: `{}`

To avoid mixing replacement strings with the other options, you can specify replacements in the `values` option. For example, the following signature:

```js
replace({
  include: ['src/**/*.js'],
  changed: 'replaced',
});
```

Can be replaced with:

```js
replace({
  include: ['src/**/*.js'],
  values: {
    changed: 'replaced',
  },
});
```

### `delimiters`

Type: `Array[...String, String]`<br>
Default: `['\b', '\b']`

Specifies the boundaries around which strings will be replaced. By default, delimiters are [word boundaries](https://www.regular-expressions.info/wordboundaries.html). See [Word Boundaries](#word-boundaries) below for more information.

## Thanks

This repo is inspired by the following projects, Thanks for their great work.

- [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace#readme)
- [Nuxt.js](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-env)