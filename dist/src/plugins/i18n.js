"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.i18nDefaultData = exports.Create = void 0;
const vue_i18n_1 = require("vue-i18n");
Object.defineProperty(exports, "Create", { enumerable: true, get: function () { return vue_i18n_1.createI18n; } });
const en_json_1 = __importDefault(require("./../lan/en.json"));
const zh_TW_json_1 = __importDefault(require("./../lan/zh_TW.json"));
exports.i18nDefaultData = {
    locale: 'en',
    globalInjection: true,
    fallbackFormat: 'en',
    messages: {
        en: en_json_1.default,
        zh_TW: zh_TW_json_1.default
    }
};
exports.i18n = (0, vue_i18n_1.createI18n)(exports.i18nDefaultData);
