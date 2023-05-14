import { convertTheme } from '@vandeurenglenn/monaco-utils'


// dirty hack to add monaco styles into the shadowRoot
const styles = Array.from(document.querySelectorAll('style'))

const importee = await import('@monaco-import');
globalThis.monaco = importee.default

const monacoStyles = Array.from(document.querySelectorAll('style')).filter(el => !styles.includes(el))

export class EditorFields extends HTMLElement {
  #fields = [];
  #models = {};
  theme;
  #enterAmount: number = 0

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template

    for (const style of monacoStyles) {
      this.shadowRoot.prepend(style.cloneNode(true))
      document.head.removeChild(style)
    }

    this.addField()

    globalThis.onresize = this.resizeFields.bind(this)
  }

  setCompilerOptions(options) {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        esModuleInterop: true,
        allowJs: true,
        isolatedModules: true
    });
  }

  defineTheme(name, theme) {
    // @ts-ignore
    monaco.editor.defineTheme(name, convertTheme(theme))
  }

  setTheme(theme) {
    this.theme = theme
    // this.#fields[0]._themeService.setTheme(theme)
    for (const field of this.#fields) {
      field._themeService.setTheme(theme)
    }
  }

  createModel(path: string, code: string, language: string = 'javascript') {
    this.#models[path] = monaco.editor.createModel(code, language, monaco.Uri.parse(`file://project/${path}`));
  }

  setModel(path, code, language, fieldId = 1) {
    !this.#models[path] && this.createModel(path, code, language)
    this.#fields[fieldId - 1].setModel(this.#models[path]);
  }

  addField(path?, code?, language?) {
    const totalFields = this.#fields.length
    const width = this.clientWidth / (totalFields + 1)
    
    this.style.setProperty(`--editor-container-width`, `${width}px`)
    
    const span = document.createElement('span')
    span.classList.add('container')
    this.shadowRoot.appendChild(span)

    
    const field = monaco.editor.create(span, {
      theme: this.theme,
      language,
      width,
      automaticLayout: true
    });
    
    this.#fields[totalFields] = field

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
    flex-direction: row;
    width: 100%;
    height: 100%;
    pointer-events: auto;
  }

.container {
  display: block;
  
  width: var(--editor-container-width, 100%);
  height: 100%;
}
</style>
    `
  }
}

customElements.define('editor-fields', EditorFields)
