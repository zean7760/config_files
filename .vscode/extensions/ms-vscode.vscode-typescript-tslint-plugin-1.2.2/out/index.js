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
const fixAll_1 = require("./fixAll");
const warningStatusBar_1 = require("./warningStatusBar");
const typeScriptExtensionId = 'vscode.typescript-language-features';
const pluginId = 'typescript-tslint-plugin';
const configurationSection = 'tslint';
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = vscode.extensions.getExtension(typeScriptExtensionId);
        if (!extension) {
            return;
        }
        yield extension.activate();
        if (!extension.exports || !extension.exports.getAPI) {
            return;
        }
        const api = extension.exports.getAPI(0);
        if (!api) {
            return;
        }
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(configurationSection)) {
                synchronizeConfiguration(api);
            }
        }, undefined, context.subscriptions);
        const selector = [];
        for (const language of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
            selector.push({ language, scheme: 'file' });
            selector.push({ language, scheme: 'untitled' });
        }
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(selector, new fixAll_1.FixAllProvider(), fixAll_1.FixAllProvider.metadata));
        context.subscriptions.push(new warningStatusBar_1.TsLintConfigurationStatusBarWarning());
        synchronizeConfiguration(api);
    });
}
exports.activate = activate;
function synchronizeConfiguration(api) {
    api.configurePlugin(pluginId, getConfiguration());
}
function getConfiguration() {
    const config = vscode.workspace.getConfiguration(configurationSection);
    const outConfig = {};
    withConfigValue(config, outConfig, 'alwaysShowRuleFailuresAsWarnings');
    withConfigValue(config, outConfig, 'ignoreDefinitionFiles');
    withConfigValue(config, outConfig, 'suppressWhileTypeErrorsPresent');
    withConfigValue(config, outConfig, 'jsEnable');
    withConfigValue(config, outConfig, 'configFile');
    withConfigValue(config, outConfig, 'exclude');
    withConfigValue(config, outConfig, 'packageManager');
    return outConfig;
}
function withConfigValue(config, outConfig, key) {
    const configSetting = config.inspect(key);
    if (!configSetting) {
        return;
    }
    // Make sure the user has actually set the value.
    // VS Code will return the default values instead of `undefined`, even if user has not don't set anything.
    if (typeof configSetting.globalValue === 'undefined'
        && typeof configSetting.workspaceFolderValue === 'undefined'
        && typeof configSetting.workspaceValue === 'undefined') {
        return;
    }
    const value = config.get(key, undefined);
    if (typeof value !== 'undefined') {
        outConfig[key] = value;
    }
}
//# sourceMappingURL=index.js.map