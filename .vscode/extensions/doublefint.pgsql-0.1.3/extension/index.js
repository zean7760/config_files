const vscode = require('vscode')
const cmd = require('./commands').default()
const completion = require('./completion').default
const signature = require('./signature').default

exports.activate = context => {

    cmd.activate( context.subscriptions )

    let disposable = vscode.commands.registerCommand( 'pgsql.run', cmd.run )
    context.subscriptions.push( disposable )

    const scheme = 'file', language = 'pgsql' // see https://go.microsoft.com/fwlink/?linkid=872305
    const completionConfig = vscode.workspace.getConfiguration( "pgsql.completion" )
 
    if ( completionConfig.get( 'enabled' ) ) {
        disposable = vscode.languages.registerCompletionItemProvider( { scheme, language }, completion, "" )
        context.subscriptions.push( disposable )
    }

    const signatureHelpConfig = vscode.workspace.getConfiguration( "pgsql.signatureHelp" )
    if ( signatureHelpConfig.get( 'enabled' ) ) {
        disposable = vscode.languages.registerSignatureHelpProvider( { scheme, language }, signature, '(', ',' )
        context.subscriptions.push( disposable )
    }


}

// when your extension is deactivated
exports.deactivate = () => {}