// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Default client node port
 */
export const PORT = 12080
/**
 * Default website port
 */
export const WebPORT = 11080
/**
 * Default webhook port
 */
export const WebHookPORT = 15080
/**
 * The upper limit for each message box can hold
 */
export const MESSAGE_LIMIT = 500
/**
 * The client node update tick, this will have effect on resource query.
 */
export const CLIENT_UPDATETICK = 3000
/**
 * The server side update tick, this will have effect on the time gap between task sending
 */
export const RENDER_UPDATETICK = 30
export const RENDER_FILE_UPDATETICK = 5000
export const SCROLL_LIMIT = 100

/**
 * The environment character for replacing text
 */
export const ENV_CHARACTER = '%'
export const IGNORE_CHARACTER = '^'
export const DATA_FOLDER = '.verteilen'

export * from './interface/base'
export * from './interface/bus'
export * from './interface/enum'
export * from './interface/execute'
export * from './interface/record'
export * from './interface/server'
export * from './interface/struct'
export * from './interface/table'
export * from './interface/ui'

/**
 * Plugin
 */
export * as I18N from './plugins/i18n'
/**
 * Scripts
 */
export * as Execute_PART from './script/execute/interface'
export * as Execute_ConsoleManager from './script/console_manager'
export * as Execute_ConsoleServerManager from './script/console_server_manager'
export * as Execute_ExecuteManager from './script/execute_manager'
export * as Execute_SocketManager from './script/socket_manager'
export * as Execute_WebhookManager from './script/webhook_manager'
/**
 * Util
 */
export * as UtilServer_Console from './util/server/console_handle'
export * as UtilServer_Log from './util/server/log_handle'