"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const webviewContent_1 = require("./webviewContent");
function activate(context) {
    const disposableCommand = vscode.commands.registerCommand('flexbox.cheatsheet', () => {
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel('flexboxCheatsheet', 'Flexbox Cheatsheet', vscode.ViewColumn.Beside);
        panel.webview.html = webviewContent_1.getWebviewContent();
    });
    const hoverProvider = {
        provideHover(doc, pos, token) {
            const range = doc.getWordRangeAtPosition(pos, /display:(\s+)?flex;/ig);
            if (range === undefined) {
                return;
            }
            const contents = getText();
            // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
            // When creating trusted Markdown string, make sure to properly sanitize all the
            // input content so that only expected command URIs can be executed
            contents.isTrusted = true;
            return new vscode.Hover(contents);
        }
    };
    const disposableHoverProvider = vscode.languages.registerHoverProvider(['css', 'less', 'sass', 'scss'], hoverProvider);
    context.subscriptions.push(disposableCommand, disposableHoverProvider);
}
exports.activate = activate;
function getText() {
    const commandUri = vscode.Uri.parse('command:flexbox.cheatsheet');
    return new vscode.MarkdownString(`[Open Flexbox Cheatsheet](${commandUri})`);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map