<h1 align="center">vite-plugin-nuxt-env</h1>

⚡️ 适配Nuxt.js环境变量配置的Vite插件

<a href="https://github.com/OrekiSH/vite-plugin-nuxt-env/blob/main/README-zh_CN.md">English</a> | 简体中文

## 安装

* 首先安装[vite v2.x](https://github.com/vitejs/vite)

* 接着安装插件

```bash
$ npm i -D vite-plugin-nuxt-env
# 或者
$ yarn add -D vite-plugin-nuxt-env
```

## 用法

配置Vite的vite.config.js文件

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
在npm scripts中定义`NUXT_NEV`环境变量

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

使用环境变量

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

console.log(process.env)将输出{}，但console.log(process.env.you_var)仍将输出您的值

```js
// before
if (process.env.test === 'testing123')
```

```js
// after
if ('testing123' === 'testing123')
```

## 自动注入环境变量

如果在构建阶段定义以NUXT_ENV_开头的环境变量，例如：NUXT_ENV_COOL_WORD=freezing nuxt build，它们将自动注入环境变量中。请注意，它们可能优先于vite.config.js中具有相同名称的已定义变量。

## 配置

### `preventAssignment`

类型: `Boolean`<br>
默认值: `true`

防止被替换的字符串紧接在赋值运算符后。例如，插件是用下面的方式被调用的:

```js
replace({
  values: {
    'process.env.DEBUG': 'false',
  },
});
```

观察下面的代码

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

类型: `String` | `Array[...String]`<br>
默认值: `['./src/**/*']`

声明一个[minimatch pattern](https://github.com/isaacs/minimatch)或者匹配模式的数组，指定插件应该操作的文件

### `exclude`

类型: `String` | `Array[...String]`<br>
默认值: `null`

声明一个[minimatch pattern](https://github.com/isaacs/minimatch)或者匹配模式的数组，指定插件应该忽略的文件


### `values`

类型: `{ [key: String]: Replacement }`, where `Replacement` is either a string or a `function` that returns a string.
默认值: `{}`

为防止需要被替换的字符串跟其他配置项混在一起， 你可以将被替换项放在`values`配置项中, 例如:

```js
replace({
  include: ['src/**/*.js'],
  changed: 'replaced',
});
```

可以被替换为:

```js
replace({
  include: ['src/**/*.js'],
  values: {
    changed: 'replaced',
  },
});
```

### `delimiters`

类型: `Array[...String, String]`<br>
默认值: `['\b', '\b']`

指定被替换字符串的边界字符，默认分隔符是[word boundaries](https://www.regular-expressions.info/wordboundaries.html).

## 致谢

本项目受到以下开源项目的启发, 感谢他们的杰出贡献

- [@rollup/plugin-replace](https://github.com/rollup/plugins/tree/master/packages/replace#readme)
- [Nuxt.js](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-env)