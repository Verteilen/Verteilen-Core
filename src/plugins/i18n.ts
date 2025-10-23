// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { createI18n } from 'vue-i18n'
import en from './../lan/en.json'
import zh_TW from './../lan/zh_TW.json'

export { createI18n as Create }

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
export const i18nDefaultData:any = {
    locale: 'en',
    globalInjection: true,
    fallbackFormat: 'en',
    messages: {
        en: en,
        zh_TW: zh_TW
    }
}

/**
 * The language module which translate key into setup text string\
 * This apply the default config
 */
export const i18n = createI18n(i18nDefaultData)
