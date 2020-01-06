import * as vscode from 'vscode'
import * as typeCoverage from 'type-coverage-core'
import ts from 'typescript'

import * as packageJson from './package.json'

const extensionDisplayName = packageJson.displayName

let diagnosticCollection: vscode.DiagnosticCollection
let oldProgram: ts.Program | undefined

function lint(textDocument?: vscode.TextDocument) {
  const files = textDocument
    ? [textDocument.fileName]
    : undefined
  vscode.workspace.workspaceFolders?.forEach((workspace) => {
    typeCoverage.lint(workspace.uri.fsPath, { files, oldProgram, absolutePath: true }).then((result) => {
      oldProgram = result.program
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
    })
  })
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((textDocument) => {
      console.info(textDocument.languageId)
      if (textDocument.languageId === 'typescript' || textDocument.languageId === 'typescriptreact') {
        lint(textDocument)
      }
    })
  )

  diagnosticCollection = vscode.languages.createDiagnosticCollection(extensionDisplayName)
  context.subscriptions.push(diagnosticCollection)
  lint()
}
