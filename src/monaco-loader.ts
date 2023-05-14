import * as monaco from 'monaco-editor'

globalThis.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'typescript' || label === 'javascript') {
			return './monaco/ts.worker.js';
		}

    if (label === 'css' || label === 'stylesheet') {
			return './monaco/css.worker.js';
		}

    if (label === 'html') {
			return './monaco/html.worker.js';
		}

		return './monaco/editor.worker.js';
	}
};

export default monaco