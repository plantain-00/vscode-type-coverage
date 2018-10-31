const path = require('path');

import * as langServer from 'vscode-languageserver';
const noop = require('nop');
import { lint } from 'type-coverage';

const connection = langServer.createConnection(process.stdin, process.stdout);
const documents = new langServer.TextDocuments();

function validate(document: langServer.TextDocument) {
  console.info('validate')
  const uri = document.uri;

  lint('.', true, false).then(({ anys }) => {
    const diagnostics = [];

    anys.forEach(any => {
      diagnostics.push({
        message: `type-coverage: ${any.text}`,
        range: {
          start: { line: any.line, character: any.character },
          end: { line: any.line, character: any.character }
        }
      });
    });

    connection.sendDiagnostics({ uri, diagnostics });
  }, (error) => {
    connection.window.showErrorMessage(error.message);
  })

}

connection.onInitialize(noop);
connection.onDidChangeWatchedFiles(() => documents.all().forEach(document => validate(document)));

documents.onDidChangeContent(event => validate(event.document));
documents.listen(connection);

connection.listen();