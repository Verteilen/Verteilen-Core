// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { createI18n } from 'vue-i18n'
import { I18n } from "i18n-js"
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
export const i18nDefaultData = {
    legacy: true,
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
/**
 * The raw language module which translate key into setup text string\
 * This apply the default config
 */
export const raw_i18n = new I18n({
    en: en,
    zh_TW: zh_TW
}, { defaultLocale: 'en', 
    locale: 'en', 
    enableFallback: true 
})
