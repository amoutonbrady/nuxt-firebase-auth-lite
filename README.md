# Nuxt firebase auth lite

Intergration of [firebase auth lite](https://github.com/samuelgozi/firebase-auth-lite), a lightweight alternative to the official firebase library.

## Usage

Install it:

```bash
# npm
$ npm i @amoutonbrady/nuxt-firebase-auth-lite
# pnpm
$ pnpm add @amoutonbrady/nuxt-firebase-auth-lite
# yarn
$ yarn add @amoutonbrady/nuxt-firebase-auth-lite
```

Then add it to you `nuxt.config.(j|t)s`:

```js
export default {
    ...,
    modules: [
        ['@amoutonbrady/nuxt-firebase-auth-lite', { apiKey: 'myApiKey' }],
    ],
    ...,
}
```
