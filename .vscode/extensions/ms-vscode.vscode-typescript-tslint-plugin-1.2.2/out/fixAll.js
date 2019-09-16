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
function executeCodeActionProvider(uri, range) {
    return vscode.commands.executeCommand('vscode.executeCodeActionProvider', uri, range);
}
function getTsLintFixAllCodeAction(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const diagnostics = vscode.languages
            .getDiagnostics(document.uri)
            .filter((diagnostic) => diagnostic.source === 'tslint');
        for (const diagnostic of diagnostics) {
            const codeActions = yield executeCodeActionProvider(document.uri, diagnostic.range);
            if (codeActions) {
                const fixAll = codeActions.filter((action) => action.title === 'Fix all auto-fixable tslint failures');
                if (fixAll.length > 0) {
                    return fixAll[0];
                }
            }
        }
        return undefined;
    });
}
class FixAllProvider {
    provideCodeActions(document, _range, context, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!context.only) {
                return [];
            }
            if (!context.only.contains(FixAllProvider.fixAllCodeActionKind)
                && !FixAllProvider.fixAllCodeActionKind.contains(context.only)) {
                return [];
            }
            if (!utils_1.shouldBeLinted(document)) {
                return [];
            }
            const fixAllAction = yield getTsLintFixAllCodeAction(document);
            if (!fixAllAction) {
                return [];
            }
            return [Object.assign({}, fixAllAction, { title: 'Fix All TSLint', kind: FixAllProvider.fixAllCodeActionKind })];
        });
    }
}
FixAllProvider.fixAllCodeActionKind = vscode.CodeActionKind.SourceFixAll.append('tslint');
FixAllProvider.metadata = {
    providedCodeActionKinds: [FixAllProvider.fixAllCodeActionKind],
};
exports.FixAllProvider = FixAllProvider;
//# sourceMappingURL=fixAll.js.map