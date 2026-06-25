# @ungap/processing-instruction

A polyfill for [ProcessingInstruction attributes](https://github.com/whatwg/dom/pull/1454).

```js
import patch from 'https://esm.run/@ungap/processing-instruction';

const template = document.createElement('template');
template.innerHTML = 'a<?b c="d" ?>c';

[...patch(template.content).childNodes];

// [text, b, text]
```
