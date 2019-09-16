'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const json = require("comment-json");
class BracketRule {
    constructor(config) {
        this.openBracket = config[0];
        this.closeBracket = config[1];
        this.openRegExp = this.createOpenBracketRegExp(this.openBracket);
        this.closeRegExp = this.createCloseBracketRegExp(this.closeBracket);
    }
    createOpenBracketRegExp(openBracket) {
        let str = escapeRegExpCharacters(openBracket);
        if (!/\B/.test(str.charAt(0))) {
            str = '\\b' + str;
        }
        str += '\\s*$';
        return createRegExp(str);
    }
    createCloseBracketRegExp(closeBracket) {
        let str = escapeRegExpCharacters(closeBracket);
        if (!/\B/.test(str.charAt(str.length - 1))) {
            str = str + '\\b';
        }
        str = '^\\s*' + str;
        return createRegExp(str);
    }
}
class IndentationRule {
    constructor(config) {
        this.unIndentedLinePattern =
            this.createRegExp(config && config.unIndentedLinePattern);
        this.increaseIndentPattern =
            this.createRegExp(config && config.increaseIndentPattern);
        this.decreaseIndentPattern =
            this.createRegExp(config && config.decreaseIndentPattern);
        this.indentNextLinePattern =
            this.createRegExp(config && config.indentNextLinePattern);
    }
    testUnIndentedLinePattern(line) {
        return this.unIndentedLinePattern && this.unIndentedLinePattern.test(line);
    }
    testIncreaseIndentPattern(line) {
        return this.increaseIndentPattern && this.increaseIndentPattern.test(line);
    }
    testDecreaseIndentPattern(line) {
        return this.decreaseIndentPattern && this.decreaseIndentPattern.test(line);
    }
    testIndentNextLinePattern(line) {
        return this.indentNextLinePattern && this.indentNextLinePattern.test(line);
    }
    estimateIndentAction(validPreviousLine, currentLine) {
        let nextIndentLevel = 0;
        let ruleMatched = false;
        if (this.testUnIndentedLinePattern(validPreviousLine)) {
            // do nothing
        }
        else if (this.testIncreaseIndentPattern(validPreviousLine)) {
            ruleMatched = true;
            ++nextIndentLevel;
        }
        else if (this.testIndentNextLinePattern(validPreviousLine)) {
            ruleMatched = true;
            ++nextIndentLevel;
        }
        if (this.testDecreaseIndentPattern(currentLine)) {
            ruleMatched = true;
            --nextIndentLevel;
        }
        if (ruleMatched) {
            if (nextIndentLevel === 0) {
                return vscode.IndentAction.None;
            }
            else if (nextIndentLevel > 0) {
                return vscode.IndentAction.Indent;
            }
            else if (nextIndentLevel < 0) {
                return vscode.IndentAction.Outdent;
            }
        }
        else {
            return null;
        }
    }
    createRegExp(s) {
        try {
            if (s && s.length > 0) {
                return new RegExp(s);
            }
            else {
                return null;
            }
        }
        catch (err) {
            return null;
        }
    }
}
const DEFAULT_BRACKETS = [
    ['(', ')'],
    ['{', '}'],
    ['[', ']'],
];
const ADDITIONAL_CONFIGURATION_FOR_LANGUAGE = {
    python: {
        indentationRules: {
            increaseIndentPattern: '^\\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\\s*$',
        },
    },
    html: {
        indentationRules: {
            increaseIndentPattern: '<(?!\\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\\b|[^>]*\\/>)([-_\\.A-Za-z0-9]+)(?=\\s|>)\\b[^>]*>(?!.*<\\/\\1>)|<!--(?!.*-->)|\\{[^}"\']*$',
            decreaseIndentPattern: '^\\s*(<\\/(?!html)[-_\\.A-Za-z0-9]+\\b[^>]*>|-->|\\})',
        },
    },
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the impleme<ntation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const reindentCurrentLineCommand = vscode.commands.registerCommand('emacs-tab.reindentCurrentLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor');
            return;
        }
        const documentLanguageId = editor.document.languageId;
        const langConfig = getLanguageConfiguration(documentLanguageId);
        if (!langConfig) {
            vscode.window.showInformationMessage(`no language config for ${documentLanguageId}`);
            return;
        }
        const [previousValidLine, currentLine] = getPreviousAndCurrentLine(editor);
        const indent = estimateIndentAction(previousValidLine, currentLine, langConfig);
        reindentCurrentLine(indent, previousValidLine, currentLine);
    });
    const debugEstimateIndentLevel = vscode.commands.registerCommand('emacs-tab.debugEstimateIndentLevel', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor');
            return;
        }
        const documentLanguageId = editor.document.languageId;
        const langConfig = getLanguageConfiguration(documentLanguageId);
        if (!langConfig) {
            vscode.window.showInformationMessage(`no language config for ${documentLanguageId}`);
            return;
        }
        const [previousValidLine, currentLine] = getPreviousAndCurrentLine(editor);
        const indent = estimateIndentAction(previousValidLine, currentLine, langConfig);
        vscode.window.showInformationMessage(convertIndentActionToString(indent));
    });
    context.subscriptions.push(reindentCurrentLineCommand);
}
exports.activate = activate;
/**
 * Convert vscode.IndentAction to string.
 * @param {vscode.IndentAction} action
 * @return {string}
 */
function convertIndentActionToString(action) {
    if (action === vscode.IndentAction.Indent) {
        return 'Indent';
    }
    else if (action === vscode.IndentAction.IndentOutdent) {
        return 'IndentOutdent';
    }
    else if (action === vscode.IndentAction.Outdent) {
        return 'Outdent';
    }
    else if (action === vscode.IndentAction.None) {
        return 'Keep';
    }
}
/**
 * @param {vscode.TextEditor} editor
 * @return {string[]} pair of the valid previous line and current line
 */
function getPreviousAndCurrentLine(editor) {
    if (!editor.selection.isEmpty) {
        return [null, null];
    }
    const currentPosition = editor.selection.active;
    const document = editor.document;
    const allLinesArray = document.getText().split('\n');
    const currentLine = allLinesArray[currentPosition.line];
    if (currentPosition.line === 0) {
        // first line, do nothing
        return [null, currentLine];
    }
    // Lookup valid previous line because the line consisted of white spaces gives
    // no effect on indentation.
    const validPreviousLine = getValidPreviousLine(allLinesArray, currentPosition.line);
    return [validPreviousLine, currentLine];
}
function mergeLanguageConfiguration(a, b) {
    const mergedConfiguration = {
        indentationRules: undefined,
        brackets: [],
        onEnterRules: [],
    };
    if (a.indentationRules) {
        mergedConfiguration.indentationRules =
            Object.assign({}, a.indentationRules, b.indentationRules);
    }
    else {
        mergedConfiguration.indentationRules = b.indentationRules;
    }
    if (a.brackets) {
        mergedConfiguration.brackets = a.brackets.concat(b.brackets || []);
    }
    else {
        mergedConfiguration.brackets = b.brackets;
    }
    if (a.onEnterRules) {
        mergedConfiguration.onEnterRules =
            a.onEnterRules.concat(b.onEnterRules || []);
    }
    else {
        mergedConfiguration.onEnterRules = b.onEnterRules;
    }
    return mergedConfiguration;
}
/**
 * @param id {string} id of language
 * @return {Object} return language configuration
 */
function getLanguageConfiguration(id) {
    const editor = vscode.window.activeTextEditor;
    const documentLanguageId = editor.document.languageId;
    let additionalConfiguration = {};
    if (documentLanguageId in ADDITIONAL_CONFIGURATION_FOR_LANGUAGE) {
        additionalConfiguration =
            ADDITIONAL_CONFIGURATION_FOR_LANGUAGE[documentLanguageId];
    }
    // walk through all the extensions
    for (const ext of vscode.extensions.all) {
        if (ext.packageJSON && ext.packageJSON.contributes &&
            ext.packageJSON.contributes.languages) {
            const packageLangData = ext.packageJSON.contributes.languages.find((langData) => (langData.id === documentLanguageId));
            if (packageLangData) {
                const langConfigFilepath = path.join(ext.extensionPath, packageLangData.configuration);
                return mergeLanguageConfiguration(json.parse(fs.readFileSync(langConfigFilepath).toString()), additionalConfiguration);
            }
        }
    }
    return null;
}
function estimateIndentAction(validPreviousLine, currentLine, languageConfiguration) {
    if (validPreviousLine == null) {
        return vscode.IndentAction.None;
    }
    const onEnterRulesArray = languageConfiguration.onEnterRules;
    const bracketsArray = languageConfiguration.brackets;
    const currentLineWihtoutLeadingWhitespaces = currentLine.replace(/^\s*/, '');
    // 0 indentPattern
    const indentationRule = new IndentationRule(languageConfiguration.indentationRules);
    const indentationRuleIndentAction = indentationRule.estimateIndentAction(validPreviousLine, currentLine);
    if (indentationRuleIndentAction != null) {
        return indentationRuleIndentAction;
    }
    // 1 regexp Rule, not yet supported
    /*
    for (const rule of onEnterRulesArray) {
      if (rule.beforeText.test(validPreviousLine)) {
        if (rule.afterText) {
          if (rule.afterText.test(currentLineWihtoutLeadingWhitespaces)) {
            return rule.action;
          }
        } else {
          return rule.action;
        }
      }
    }
    */
    // 2 special indent-outdent
    if (validPreviousLine.length > 0 &&
        currentLineWihtoutLeadingWhitespaces.length > 0) {
        for (const bracketConfig of bracketsArray) {
            const bracket = new BracketRule(bracketConfig);
            if (bracket.openRegExp.test(validPreviousLine) &&
                bracket.closeRegExp.test(currentLineWihtoutLeadingWhitespaces)) {
                return vscode.IndentAction.IndentOutdent;
            }
        }
    }
    // 3 open bracket based logic
    if (validPreviousLine.length > 0) {
        for (const bracketConfig of bracketsArray) {
            const bracket = new BracketRule(bracketConfig);
            if (bracket.openRegExp.test(validPreviousLine)) {
                return vscode.IndentAction.Indent;
            }
        }
    }
    // 4 close bracket based logic
    if (currentLineWihtoutLeadingWhitespaces.length > 0) {
        for (const bracketConfig of bracketsArray) {
            const bracket = new BracketRule(bracketConfig);
            if (bracket.closeRegExp.test(currentLineWihtoutLeadingWhitespaces)) {
                return vscode.IndentAction.Outdent;
            }
        }
    }
    // 5 indentRules based logic. not yet supported
    return vscode.IndentAction.None;
}
function escapeRegExpCharacters(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function createRegExp(s) {
    try {
        return new RegExp(s);
    }
    catch (err) {
        return null;
    }
}
function createOpenBracketRegExp(openBracket) {
    let str = escapeRegExpCharacters(openBracket);
    if (!/\B/.test(str.charAt(0))) {
        str = '\\b' + str;
    }
    str += '\\s*$';
    return createRegExp(str);
}
function createCloseBracketRegExp(closeBracket) {
    let str = escapeRegExpCharacters(closeBracket);
    if (!/\B/.test(str.charAt(str.length - 1))) {
        str = str + '\\b';
    }
    str = '^\\s*' + str;
    return createRegExp(str);
}
function getTabSize() {
    // TODO: estimate from content
    return vscode.workspace.getConfiguration('editor').tabSize;
}
/**
 * @return {boolean} true if hard tab is configured.
 */
function isUsingHardTab() {
    // TODO: estimate from content
    return !vscode.workspace.getConfiguration('editor').insertSpaces;
}
/**
 * @param {string} indentLine
 * @param {number} tabSize
 * @return {number} indent level.
 */
function countIndent(indentLine, tabSize) {
    const tabCount = (indentLine.match(/\t/g) || []).length;
    const spaceCount = (indentLine.match(/ /g) || []).length;
    const spaceCountAsIndent = spaceCount / tabSize;
    return tabCount + spaceCountAsIndent;
}
/**
 * @param {number} indentLevel
 * @param {number} tabSize
 * @return {string}
 */
function convertIndentLevelToString(indentLevel, tabSize) {
    if (isUsingHardTab()) {
        return new Array(1 + indentLevel).join('\t');
    }
    else {
        return new Array(1 + indentLevel * tabSize).join(' ');
    }
}
/**
 * reindent current line
 * @param indentationRules
 * @param onEnterRulesArray
 */
function reindentCurrentLine(indentAction, validPreviousLine, currentLine) {
    const tabSize = getTabSize();
    const editor = vscode.window.activeTextEditor;
    const currentPosition = editor.selection.active;
    const document = editor.document;
    const previousIndent = getIndent(validPreviousLine);
    const beforeIndentCurrentIndent = countIndent(getIndent(currentLine), tabSize);
    const beforeIndentCurrentIndentNative = getIndent(currentLine).length;
    const currentLineWihtoutLeadingWhitespaces = currentLine.replace(/^\s*/, '');
    let idealIndent = countIndent(previousIndent, tabSize);
    if (indentAction === vscode.IndentAction.Indent) {
        idealIndent = 1 + idealIndent;
    }
    else if (indentAction === vscode.IndentAction.Outdent) {
        idealIndent = idealIndent - 1;
    }
    else if (indentAction === vscode.IndentAction.IndentOutdent) {
        idealIndent = 1 + idealIndent;
    }
    if (idealIndent < 0) {
        idealIndent = 0;
    }
    // before indent line, store the position of cursor
    const beforeIndentCursorPositionCharacter = currentPosition.character;
    if (idealIndent !== beforeIndentCurrentIndent) {
        const indentedCurrentLine = indentLine(currentLine, idealIndent, previousIndent, countIndent(previousIndent, tabSize), tabSize);
        vscode.window.activeTextEditor.edit((edit) => {
            const startPosition = new vscode.Position(currentPosition.line, 0);
            const endPosition = new vscode.Position(currentPosition.line, currentLine.length);
            edit.replace(new vscode.Range(startPosition, endPosition), indentedCurrentLine);
        });
    }
    // move cursor if needed
    if (beforeIndentCursorPositionCharacter < beforeIndentCurrentIndentNative) {
        // move to the first character of the line
        const nativeCharacterTabSize = isUsingHardTab() ? 1 : tabSize;
        const nextPosition = new vscode.Position(currentPosition.line, idealIndent * nativeCharacterTabSize);
        editor.selection = new vscode.Selection(nextPosition, nextPosition);
    }
    else if (idealIndent !== beforeIndentCurrentIndent) {
        const cursorMovement = (idealIndent - beforeIndentCurrentIndent) * tabSize;
        const nextPosition = new vscode.Position(currentPosition.line, cursorMovement + beforeIndentCursorPositionCharacter);
        editor.selection = new vscode.Selection(nextPosition, nextPosition);
    }
}
exports.reindentCurrentLine = reindentCurrentLine;
function getValidPreviousLine(allLinesArray, currentLine) {
    const isAllWhiteSpacesRegexp = /^\s*$/;
    for (let previousLine = currentLine - 1; previousLine >= 0; --previousLine) {
        const previousLineContent = allLinesArray[previousLine];
        if (previousLineContent.length > 0 &&
            !isAllWhiteSpacesRegexp.test(previousLineContent)) {
            return previousLineContent;
        }
    }
    return null;
}
function indentLine(line, indentLevel, previousIndent, previousIndentLevel, tabSize) {
    const withoutLeadingWhiteSpacesLine = line.replace(/^[\s]*/, '');
    if (previousIndentLevel == indentLevel) {
        // If no need to change indent level, just use exactly the same indent to
        // the previous line.
        return previousIndent + withoutLeadingWhiteSpacesLine;
    }
    else {
        const additionalSpaces = convertIndentLevelToString(indentLevel, tabSize);
        return additionalSpaces + withoutLeadingWhiteSpacesLine;
    }
}
/**
 * get leading speces.
 * @param {string} line
 * @return {string}
 */
function getIndent(line) {
    const leadingWhiteSpacesRegexpResult = /^[\s]*/.exec(line);
    if (leadingWhiteSpacesRegexpResult) {
        const leadingWhiteSpaces = leadingWhiteSpacesRegexpResult[0];
        return leadingWhiteSpaces;
    }
    else {
        return '';
    }
}
//# sourceMappingURL=extension.js.map