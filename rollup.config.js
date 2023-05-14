import typescript from '@rollup/plugin-typescript'
import tsConfig from './tsconfig.json' assert { type: 'json'}
import { readdir } from 'fs/promises'
import { join } from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import modify from 'rollup-plugin-modify'
import json from '@rollup/plugin-json'
import { execSync } from 'child_process'

const input = [
  ...(await readdir('./src')).map(path => join('./src', path)).filter(path => !path.includes('monaco') && !path.includes('vs-themes'))
]


// const templates = (await readdir('./src/templates')).map(path => join('./src/templates', path))
const clean = () => {
  execSync('rm -rf exports/*.js')
  return
}

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
    resolve({mainFields: ['browser', 'module', 'main']}),
    commonjs(),
    modify({
      '@monaco-import': './monaco/monaco-loader.js'
    }),
    typescript()
  ]
}]
