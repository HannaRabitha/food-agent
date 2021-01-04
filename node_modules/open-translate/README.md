# google-translate-open-api
A free and unlimited API for Google Translate（support single text and Multi-segment text） 💵🚫


# Feature

- Multi-segment text support
- Auto language detection
- Spelling correction
- Language correction
- Fast and reliable – it uses the same servers that [translate.google.com](https://translate.google.com/) uses
# Install

```shell
npm install --save open-translate
```

# Why this repo ？

when I have the following sentence. ( from [How Are Function Components Different from Classes?](https://overreacted.io/how-are-function-components-different-from-classes/))

```
Maybe you’ve heard one of them is better for performance. Which one? Many of such benchmarks are flawed so I’d be careful drawing conclusions from them.
```
I don't want to translate all the text first and I'd like to translate segment by segment. Especially in an article, the whole translation may not work well.

![1565448193440.jpg](https://s3.qiufengh.com/blog/1565448193440.jpg)

![1565516309452.jpg](https://s3.qiufengh.com/blog/1565516309452.jpg)

In the existing library, if I want to translate multi-segment text, I have to request multiple times.(like [open-translate](https://github.com/mujohn26/translate))

So I have to use the new api to implement, so the `open-translate` is born.

# Usage

Single segment
```javascript
import translate from 'open-translate';
const result = await translate(`I'm fine.`, {
  tld: "cn",
  to: "zh-CN",
});
const data = result.data[0];

// 我很好。
```

Multi-segment text
```javascript
import translate from 'open-translate';

const result = await translate([`I'm fine.`, `I'm ok.`], {
  tld: "cn",
  to: "zh-CN",
});
const data = result.data[0];
// [[[["我很好。"]],null,"en"],[[["我可以。"]],null,"en"]]
```

> Note: Multi-segment text result is different from single sentence. You need extra attention.

Multi-segment text contains mylti-sentence.

```javascript
import translate, { parseMultiple } from 'open-translate';

const result = await translate([`I'm fine. And you?`,`I'm ok.`], {
  tld: "cn",
  to: "zh-CN",
});
// [[[[["<i>I&#39;m fine.</i> <b>我很好。</b> <i>And you?</i> <b>你呢？</b>"]],null,"en"],[[["我可以。"]],null,"en"]]]

// use parseMultiple
const data = result.data[0];
const parseData = parseMultiple(data);
// ["我很好。你呢？","我可以。"]
```

Proxy

proxy-config [https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config)
```javascript
const result = await translate([`I'm fine. And you?`,`I'm ok.`], {
  tld: "cn",
  to: "zh-CN",
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  }
});
```

Browers

```javascript
const result = await translate([`I'm fine. And you?`,`I'm ok.`], {
  tld: "cn",
  to: "zh-CN",
  browers: true
});

const data = result.data[0];

// 我很好。
```

For commonJS

```javascript
const translate = require('open-translate').default;
```

# API

## translate(text, options)

### text

Type: `string`

The text to be translated

### options

Type: object

**from？**
Type: `string` Default: auto

The text language. Must be auto or one of the codes/names (not case sensitive) contained in src/languages.ts

**to**
Type: `string` Default: en

The language in which the text should be translated. Must be one of the codes/names (not case sensitive) contained in src/languages.ts.

**tld**
Type: `string` 'com' | 'cn' <Default 'com'>

`cn` is for China, `com` for others.

**proxy**
Type: `AxiosProxyConfig`

proxy for request.

**config**
Type: `object`

config for [axios](https://github.com/axios/axios)

**browers**
Type: `boolean`

support browers via [cors-anywhere](https://github.com/Rob--W/cors-anywhere/) (This is a public service, not necessarily stable)

**browersUrl**
Type: `string`

custom browers proxy url

**format**
Type: `string`  `<text|html>`

When use single translate, default use `text` (but we can set it to `html`) and use batch translate, default and only use `html`.


# Related
- [vitalets/google-translate-token](https://github.com/vitalets/google-translate-token)
- [google-translate-api](https://github.com/matheuss/google-translate-api)
- [translate-md-viewer](https://github.com/hua1995116/translate-md-viewer)

# Inspiration

- [google translate](https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb?hl=zh-CN)

# License

Apache License

Copyright (c) 2020 