import * as vscode from 'vscode';
import { LanguageClient, SettingMonitor } from 'vscode-languageclient';
import * as path from 'path'

export function activate(context: vscode.ExtensionContext) {
  const serverModule = path.join(__dirname, 'server.js');

  const client = new LanguageClient('type-coverage', {
    run: {
      module: serverModule
    },
    debug: {
      module: serverModule,
      options: {
        execArgv: ['--nolazy', '--debug=6004']
      }
    }
  }, {
      documentSelector: ['typescript'],
      synchronize: {
        configurationSection: 'typeCoverage',
        fileEvents: vscode.workspace.createFileSystemWatcher('package.json')
      }
    });

  context.subscriptions.push(new SettingMonitor(client, 'typeCoverage.enable').start());
}

export function deactivate() {
}