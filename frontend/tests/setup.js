import { register } from 'node:module';
import { JSDOM } from 'jsdom';

register('./jsx-loader.mjs', import.meta.url);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5173/',
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;

Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
});

// Copia sólo lo que falta: así setTimeout/setInterval siguen siendo los de Node
// y los tests pueden simularlos con t.mock.timers.
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in globalThis) {
    continue;
  }

  Object.defineProperty(globalThis, key, {
    value: dom.window[key],
    configurable: true,
    writable: true,
  });
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
