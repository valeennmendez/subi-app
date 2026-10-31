import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

// Node no parsea JSX, así que los tests transforman los archivos .jsx al vuelo.
export async function load(url, context, nextLoad) {
  if (url.endsWith('.jsx')) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    const { code } = await transform(source, {
      loader: 'jsx',
      jsx: 'automatic',
      format: 'esm',
      target: 'es2022',
      sourcefile: fileURLToPath(url),
    });

    return { format: 'module', source: code, shortCircuit: true };
  }

  return nextLoad(url, context);
}
