import * as monaco from 'monaco-editor'

MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.js';
		}

    if (label === 'css' || label === 'stylesheet') {
			return './css.worker.js';
		}

    if (label === 'html') {
			return './html.worker.js';
		}

		return './editor.worker.js';
	}
};

export default monaco