import * as vscode from 'vscode'
import * as typeCoverage from 'type-coverage'
const packageJson = require('./package.json')

const extensionDisplayName = packageJson.displayName

let outputChannel: vscode.OutputChannel
let diagnosticCollection: vscode.DiagnosticCollection

function lint(textDocument?: vscode.TextDocument) {
  const files = textDocument
    ? [textDocument.fileName]
    : undefined
  typeCoverage.lint(vscode.workspace.rootPath!, true, false, files).then((result) => {
    const diagnosticsMap = new Map<string, vscode.Diagnostic[]>()
    for (const anyObject of result.anys) {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
          new vscode.Position(anyObject.line, anyObject.character),
          new vscode.Position(anyObject.line, anyObject.character + anyObject.text.length)
        ),
        `The type of '${anyObject.text}' is 'any'`,
        vscode.DiagnosticSeverity.Information)
      diagnostic.code = anyObject.text
      diagnostic.source = extensionDisplayName
      if (!diagnosticsMap.has(anyObject.file)) {
        diagnosticsMap.set(anyObject.file, [])
      }
      diagnosticsMap.get(anyObject.file)!.push(diagnostic)
    }
    if (textDocument) {
      diagnosticCollection.delete(vscode.Uri.file(textDocument.fileName))
    }
    for (const [file, diagnostics] of diagnosticsMap) {
      diagnosticCollection.set(vscode.Uri.file(file), diagnostics)
    }
  }, (ex) => {
    outputChannel.appendLine('[' + (new Date()).toLocaleTimeString() + '] ' + 'ERROR: Exception while linting:\n' + ex.stack)
  })
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel(extensionDisplayName)
  context.subscriptions.push(outputChannel)

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((textDocument) => {
      lint(textDocument)
    })
  )

  diagnosticCollection = vscode.languages.createDiagnosticCollection(extensionDisplayName)
  context.subscriptions.push(diagnosticCollection)
  lint()
}
