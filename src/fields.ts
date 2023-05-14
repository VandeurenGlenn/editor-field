import { convertTheme } from '@vandeurenglenn/monaco-utils'

declare type FieldDirection = 'horizontal' | 'vertical'
// dirty hack to add monaco styles into the shadowRoot

const styles = Array.from(document.querySelectorAll('style'))
// @ts-ignore
const importee = await import('./monaco-loader.js')
const monaco = importee.default

const monacoStyles = Array.from(document.querySelectorAll('style')).filter(el => !styles.includes(el))

export class EditorFields extends HTMLElement {
  #fields = [];
  theme: any;
  #enterAmount: number = 0
  monaco = monaco

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template

    for (const style of monacoStyles) {
      this.shadowRoot.prepend(style.cloneNode(true))
      // document.head.removeChild(style)
    }

    globalThis.onresize = this.resizeFields.bind(this)
  }

  setCompilerOptions(options){
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      esModuleInterop: true,
      allowJs: true,
      isolatedModules: true
    })
  }

  defineTheme(name: string,) {
    // @ts-ignore
    monaco.editor.defineTheme(name, convertTheme(theme))
  }

  setTheme(theme: string) {
    this.theme = theme
    // this.#fields[0]._themeService.setTheme(theme)
    monaco.editor.setTheme(theme)
  }

  getModel(path: string) {
    // @ts-ignore
    return monaco.editor.getModel(`file://project/${path}`)
  }

  createModel(path: string, code: string, language: string) {
    if (this.getModel(path)) return
    
    const model = monaco.editor.createModel(code, language, monaco.Uri.parse(`file://project/${path}`));
    model.onDidChangeContent( (detail) => { 
      document.dispatchEvent(new CustomEvent('content-change', { detail: {modelPath: path, ...detail} }))
    })
  }

  setModel(path: string, code: string, language: string, fieldId = 1) {
    !this.getModel(path) && this.createModel(path, code, language)
    this.#fields[fieldId - 1].setModel(this.getModel(path));
  }

  addField(path?: any, code?: any, language?: any, direction: FieldDirection = 'horizontal') {
    
    const span = document.createElement('span')
    span.classList.add('container')

    const rows = Array.from(this.shadowRoot.querySelectorAll('.row'))
    
    if (direction === 'horizontal') {
      if (!rows[0]) {
        rows[0] = document.createElement('span')
        rows[0].classList.add('row')
        this.shadowRoot.appendChild(rows[0])
      }
      rows[0].appendChild(span)
    } else {
      if (!rows[1]) {
        rows[1] = document.createElement('span')
        rows[1].classList.add('row')
        this.shadowRoot.appendChild(rows[1])
      }
      rows[1].appendChild(span)
    }

    
    const field = monaco.editor.create(span, {
      theme: this.theme,
      language,
      automaticLayout: true
    });

    const totalFields = this.#fields.length
    
    // @ts-ignore
    field.direction = direction
    this.#fields[totalFields] = field

    const horizontalFields = this.#fields.filter(field => field.direction === 'horizontal')
    const verticalFields = this.#fields.filter(field => field.direction === 'vertical')
 
    
    if(verticalFields.length > 0) {
      this.style.setProperty(`--editor-container-height`, `${this.clientHeight / rows.length}px`)
      const verticalContainers: HTMLElement[] = Array.from(rows[1].querySelectorAll('.container'))
      for (const container of verticalContainers) {
        container.style.setProperty(`--editor-container-width`, `${this.clientWidth / verticalContainers.length}px`)
      }
    } 

    const horizontalContainers: HTMLElement[] = Array.from(rows[0].querySelectorAll('.container'))

    for (const container of horizontalContainers) {
      container.style.setProperty(`--editor-container-width`, `${this.clientWidth / horizontalContainers.length}px`)
    }

    this.setupTriggerSuggestOnDoubleEnter(field)
    this.setModel(path, code, language, this.#fields.length)
    this.#fields.length > 1 && this.resizeFields()
  }

  removeField(field: number) {
    const fields = Array.from(this.shadowRoot.querySelectorAll('.container'))
    this.shadowRoot.removeChild(fields[field])
    this.#fields.splice(field)
  }
  
  resizeFields() {
    for (const field of this.#fields) {
      field.layout()
    }
  }

  setupTriggerSuggestOnDoubleEnter(field) {
    field.onKeyUp((e) => {
      const position = field.getPosition();
      const text = field.getModel().getLineContent(position.lineNumber).trim();

      if (e.keyCode !== monaco.KeyCode.Enter) this.#enterAmount = 0
      if (e.keyCode === monaco.KeyCode.Enter && !text) {
        this.#enterAmount += 1
        if (this.#enterAmount === 2) {
          field.trigger('', 'editor.action.triggerSuggest', '');
          this.#enterAmount = 0
        }
      }
    });
  }
  
  get template() {
    return `
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

  .row {
    height: 100%;
    display: block;
    width: 100%;
  }
.container {
  display: inline-block;
  
  width: var(--editor-container-width, 100%);
  height: var(--editor-container-height, 100%);
}
</style>
    `
  }
}

customElements.define('editor-fields', EditorFields)
