"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function isTypeScriptDocument(document) {
    return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
}
exports.isTypeScriptDocument = isTypeScriptDocument;
function isJavaScriptDocument(document) {
    return document.languageId === 'javascript' || document.languageId === 'javascriptreact';
}
exports.isJavaScriptDocument = isJavaScriptDocument;
function isEnabledForJavaScriptDocument(document) {
    const isJsEnable = vscode_1.workspace.getConfiguration('tslint', document.uri).get('jsEnable', true);
    if (isJsEnable && isJavaScriptDocument(document)) {
        return true;
    }
    return false;
}
exports.isEnabledForJavaScriptDocument = isEnabledForJavaScriptDocument;
function shouldBeLinted(document) {
    return isTypeScriptDocument(document)
        || (isJavaScriptDocument(document) && isEnabledForJavaScriptDocument(document));
}
exports.shouldBeLinted = shouldBeLinted;
//# sourceMappingURL=utils.js.map