import typescript from '@rollup/plugin-typescript'
import modify from 'rollup-plugin-modify'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { execSync } from 'child_process'
import postcss from 'rollup-plugin-postcss';
import postcssUrl from 'postcss-url';
import fs from 'fs-extra'
import { join, relative } from 'path'
import { unlink, readdir } from 'fs/promises';

const input = [
  ...(await readdir('./src')).map(path => join('./src', path)).filter(path => !path.includes('vs-themes'))
]


// const templates = (await readdir('./src/templates')).map(path => join('./src/templates', path))

const clean = () => ({
  name: 'cleanExports',
  buildStart: async () => {
    execSync('rm -rf ./exports')
  }
    
  
})
export default [{
  input,
  output: {
    dir: './exports',
    format: 'es'
  },
  external: [
    './identity.js',
    './monaco/monaco-loader.js',
    '@monaco-import'
  ],
  plugins: [
    clean(),
    json(),
    postcss({
      plugins: [
        postcssUrl({
          url: (asset) => {
            if (!/\.ttf$/.test(asset.url)) return asset.url;
            const distPath = join(process.cwd(), 'exports');
            const distFontsPath = join(distPath, 'fonts');
            fs.ensureDirSync(distFontsPath);
            const targetFontPath = join(distFontsPath, asset.pathname);
            fs.copySync(asset.absolutePath, targetFontPath);
            const relativePath = relative(process.cwd(), targetFontPath);
            const publicPath = './';
            console.log(relativePath);
            return `${publicPath}${relativePath.replace('exports/', '')}`;
          }
        })
      ]}),

    nodeResolve({
      mainFields: [
        'exports',
        'browser:module',
        'browser',
        'module',
        'main',
      ], extensions: ['.mjs', '.cjs', '.js', '.json']
    }),
    commonjs(),
    typescript()
  ]
}, {
  input: [
    './node_modules/monaco-editor/esm/vs/language/typescript/ts.worker'
  ],
  output: [{
    format: 'iife',
    dir: 'exports/monaco'
  }]
}, {
  input: [
    './node_modules/monaco-editor/esm/vs/editor/editor.worker.js'
  ],
  output: [{
    format: 'iife',
    dir: 'exports/monaco'
  }]
}, {
  input: [
    './node_modules/monaco-editor/esm/vs/language/css/css.worker.js'
  ],
  output: [{
    format: 'iife',
    dir: 'exports/monaco'
  }]
}, {
  input: [
    './node_modules/monaco-editor/esm/vs/language/html/html.worker.js'
  ],
  output: [{
    format: 'iife',
    dir: 'exports/monaco'
  }]
}, {
  input: [
    './node_modules/monaco-editor/esm/vs/language/json/json.worker.js'
  ],
  output: [{
    format: 'iife',
    dir: 'exports/monaco'
  }]
}]
