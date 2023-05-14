# editor-field
 Editor view using Monaco

## install
```sh
npm i @vandeurenglenn/editor-fields
```

## usage

```html
<editor-fields></editor-fields>
```

```js
import '@vandeurenglenn/editor-fields'
import theme from '@vandeurenglenn/editor-fields/vs-themes/palenight-italic.json' assert { type: 'json' }

const editorField = document.querySelector('editor-fields')

editorField.defineTheme('palenight-italic', theme)
editorField.setTheme('palenight-italic')
// editorField.setCompilerOptions()

// load models
editorField.createModel('my-thing.js', 'export default class MyThing { getThing () { return "theThing"}}', 'javascript')

await editorField.addField('thing.js', `import Thing from "./my-thing.js"
const thing = new Thing()`,
        'javascript')

await editorField.addField('index.html', '<html></html>', 'html')

await editorField.addField('index.css', 'html { display: block;}', 'css', 'vertical')

editorField.setModel('my-thing.js')
```