import * as vscode from 'vscode'
import * as typeCoverage from 'type-coverage-core'
import ts from 'typescript'
import * as path from 'path'
import * as util from 'util'
import * as fs from 'fs'

import * as packageJson from './package.json'

const extensionDisplayName = packageJson.displayName

const existsAsync = util.promisify(fs.exists)
const readFileAsync = util.promisify(fs.readFile)

let diagnosticCollection: vscode.DiagnosticCollection
let oldProgram: ts.Program | undefined

const optionsKey = 'type-coverage:options:'

// tslint:disable-next-line:cognitive-complexity
function lint(context: vscode.ExtensionContext, textDocument?: vscode.TextDocument) {
  const files = textDocument
    ? [textDocument.fileName]
    : undefined
  vscode.workspace.workspaceFolders?.forEach(async(workspace) => {
    let options = context.workspaceState.get<typeCoverage.LintOptions>(optionsKey)
    if (!options) {
      const packageJsonPath = path.resolve(workspace.uri.fsPath, 'package.json')
      if (await existsAsync(packageJsonPath)) {
        const currentPackageJson: { typeCoverage?: typeCoverage.LintOptions } = JSON.parse((await readFileAsync(packageJsonPath)).toString())
        if (currentPackageJson.typeCoverage) {
          options = currentPackageJson.typeCoverage
          context.workspaceState.update(optionsKey, currentPackageJson.typeCoverage)
        }
      }
    }
    options = { ...options, files, oldProgram, absolutePath: true } as typeCoverage.LintOptions
    typeCoverage.lint(workspace.uri.fsPath, options).then((result) => {
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
        lint(context, textDocument)
      } else if (textDocument.languageId === 'json') {
        context.workspaceState.update(optionsKey, undefined)
      }
    })
  )

  diagnosticCollection = vscode.languages.createDiagnosticCollection(extensionDisplayName)
  context.subscriptions.push(diagnosticCollection)
  lint(context)
}
