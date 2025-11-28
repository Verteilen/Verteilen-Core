"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raw_i18n = exports.i18n = exports.i18nDefaultData = exports.Create = void 0;
// ========================
//                           
//      Share Codebase     
//                           
// ========================
//
//  ? The language which application for server use
//  ? You can check the files in:
//  ! ../lan/*.json
//
const vue_i18n_1 = require("vue-i18n");
Object.defineProperty(exports, "Create", { enumerable: true, get: function () { return vue_i18n_1.createI18n; } });
const i18n_js_1 = require("i18n-js");
const en_json_1 = __importDefault(require("./../lan/en.json"));
const zh_TW_json_1 = __importDefault(require("./../lan/zh_TW.json"));
/**
 * Default vue-i18nconfig\
 * It follows the format where link below describe\
 * {@link https://vue-i18n.intlify.dev/api/general}\
 * Import them simple use them
 * @example
 * // Use The Plugin
 * import { createApp } from 'vue'
 * const app = createApp(App)
 * app.use(i18n)
 */
exports.i18nDefaultData = {
    locale: 'en',
    globalInjection: true,
    fallbackFormat: 'en',
    messages: {
        en: en_json_1.default,
        zh_TW: zh_TW_json_1.default
    }
};
/**
 * The language module which translate key into setup text string\
 * This apply the default config
 */
exports.i18n = (0, vue_i18n_1.createI18n)(exports.i18nDefaultData);
/**
 * The raw language module which translate key into setup text string\
 * This apply the default config
 */
exports.raw_i18n = new i18n_js_1.I18n({
    en: en_json_1.default,
    zh_TW: zh_TW_json_1.default
}, { defaultLocale: 'en',
    locale: 'en',
    enableFallback: true
});
//# sourceMappingURL=i18n.js.map