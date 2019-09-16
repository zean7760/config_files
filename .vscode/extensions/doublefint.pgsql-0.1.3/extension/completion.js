const keyword = require('vscode').CompletionItemKind.Keyword
const items = require('./completion-data').default.map( k => ({ label: k, kind: keyword }) ) //

exports.default = {
    provideCompletionItems: () => Promise.resolve( items ) 
}