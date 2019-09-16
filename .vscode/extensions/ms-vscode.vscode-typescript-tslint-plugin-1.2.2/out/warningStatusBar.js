"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
class TsLintConfigurationStatusBarWarning {
    constructor() {
        this._disposables = [];
        this._activeDocument = undefined;
        this.command = '_tslintPlugin.showHelp';
        this._disposables.push(vscode.commands.registerCommand(this.command, () => __awaiter(this, void 0, void 0, function* () {
            const help = { title: 'Help', isCloseAffordance: true };
            const close = { title: 'Close', isCloseAffordance: true };
            const result = yield vscode.window.showErrorMessage(this._statusBarItem.tooltip || 'TSLint Error', help, close);
            switch (result) {
                case help:
                    return vscode.env.openExternal(vscode.Uri.parse('https://github.com/microsoft/typescript-tslint-plugin#readme'));
            }
        })));
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        this._statusBarItem.command = this.command;
        vscode.languages.onDidChangeDiagnostics((e) => {
            if (!this._activeDocument || !vscode.window.activeTextEditor) {
                return;
            }
            for (const uri of e.uris) {
                if (uri.fsPath === this._activeDocument.fsPath) {
                    this._updateForActiveEditor(vscode.window.activeTextEditor);
                    break;
                }
            }
        }, undefined, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(this._updateForActiveEditor, this, this._disposables);
        this._updateForActiveEditor(vscode.window.activeTextEditor);
    }
    dispose() {
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables = [];
        this._statusBarItem.dispose();
    }
    _updateForActiveEditor(activeTextEditor) {
        this._activeDocument = activeTextEditor ? activeTextEditor.document.uri : undefined;
        if (!activeTextEditor) {
            this._statusBarItem.hide();
            return;
        }
        if (!utils_1.shouldBeLinted(activeTextEditor.document)) {
            this._statusBarItem.hide();
            return;
        }
        const diagnostics = vscode.languages.getDiagnostics(activeTextEditor.document.uri);
        const tsLintConfigError = diagnostics.find((diagnostic) => diagnostic.source === 'tslint' && diagnostic.message.startsWith('Failed to load the TSLint library'));
        if (tsLintConfigError) {
            this._statusBarItem.text = '$(alert) TSLint';
            this._statusBarItem.tooltip = tsLintConfigError.message;
            this._statusBarItem.show();
        }
        else {
            this._statusBarItem.text = 'TSLint';
            this._statusBarItem.hide();
        }
    }
}
exports.TsLintConfigurationStatusBarWarning = TsLintConfigurationStatusBarWarning;
//# sourceMappingURL=warningStatusBar.js.map