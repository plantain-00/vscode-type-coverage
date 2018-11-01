import vscode = require("vscode");
import typeCoverage = require("type-coverage");
import * as path from 'path';
const packageJson = require("./package.json");

const extensionDisplayName = packageJson.displayName;

let outputChannel: vscode.OutputChannel;
let diagnosticCollection: vscode.DiagnosticCollection;

function lint(textDocument?: vscode.TextDocument) {
	const file = textDocument
		? path.relative(vscode.workspace.rootPath, textDocument.fileName)
		: undefined
	typeCoverage.lint(vscode.workspace.rootPath, true, false).then((result) => {
		const diagnosticsMap = new Map<string, vscode.Diagnostic[]>()
		for (const any of result.anys) {
			if (file && file !== path.relative(vscode.workspace.rootPath, any.file)) {
				continue
			}
			const diagnostic = new vscode.Diagnostic(
				new vscode.Range(
					new vscode.Position(any.line, any.character),
					new vscode.Position(any.line, any.character + any.text.length)
				),
				`The type is 'any'`,
				vscode.DiagnosticSeverity.Information);
			diagnostic.code = any.text;
			diagnostic.source = extensionDisplayName;
			if (!diagnosticsMap.has(any.file)) {
				diagnosticsMap.set(any.file, [])
			}
			diagnosticsMap.get(any.file).push(diagnostic);
		}
		if (textDocument) {
			diagnosticCollection.delete(vscode.Uri.file(textDocument.fileName));
		}
		for (const [file, diagnostics] of diagnosticsMap) {
			diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
		}
	}, (ex) => {
		outputChannel.appendLine("[" + (new Date()).toLocaleTimeString() + "] " + "ERROR: Exception while linting:\n" + ex.stack);
	})
}

export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel(extensionDisplayName);
	context.subscriptions.push(outputChannel);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((textDocument) => {
			lint(textDocument);
		}),
	);

	diagnosticCollection = vscode.languages.createDiagnosticCollection(extensionDisplayName);
	context.subscriptions.push(diagnosticCollection);
	lint();
}
