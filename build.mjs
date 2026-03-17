import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

await rm(distDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

const result = await build({
  absWorkingDir: __dirname,
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'esm',
  splitting: false,
  sourcemap: false,
  minify: true,
  target: ['es2020'],
  outdir: assetsDir,
  entryNames: 'index-[hash]',
  assetNames: 'asset-[hash]',
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.css': 'css',
    '.svg': 'file',
    '.png': 'file',
  },
  metafile: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});

const outputs = Object.keys(result.metafile.outputs);
const jsOutput = outputs.find((file) => file.endsWith('.js'));
const cssOutput = outputs.find((file) => file.endsWith('.css'));

if (!jsOutput) {
  throw new Error('Bundled JavaScript output was not generated.');
}

const jsFile = path.basename(jsOutput);
const cssTag = cssOutput
  ? `    <link rel="stylesheet" href="./assets/${path.basename(cssOutput)}" />\n`
  : '';

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>소싱 작업 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
${cssTag}  </head>
  <body class="bg-gray-50 text-slate-800 font-sans font-medium">
    <div id="root"></div>
    <script type="module" src="./assets/${jsFile}"></script>
  </body>
</html>
`;

await writeFile(path.join(distDir, 'index.html'), html, 'utf8');
