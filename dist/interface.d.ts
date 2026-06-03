/**
 * Default client node port
 */
export declare const PORT = 12080;
/**
 * Default website port
 */
export declare const WebPORT = 11080;
/**
 * Default webhook port
 */
export declare const WebHookPORT = 15080;
/**
 * The upper limit for each message box can hold
 */
export declare const MESSAGE_LIMIT = 500;
/**
 * The client node update tick, this will have effect on resource query.
 */
export declare const CLIENT_UPDATETICK = 3000;
/**
 * The server side update tick, this will have effect on the time gap between task sending
 */
export declare const RENDER_UPDATETICK = 30;
export declare const RENDER_FILE_UPDATETICK = 5000;
export declare const SCROLL_LIMIT = 100;
/**
 * The environment character for replacing text
 */
export declare const ENV_CHARACTER = "%";
export declare const IGNORE_CHARACTER = "^";
export declare const DATA_FOLDER = ".verteilen";
export declare const MONGODB_NAME = "verteilen";
export * from './interface/base';
export * from './interface/bus';
export * from './interface/enum';
export * from './interface/error';
export * from './interface/execute';
export * from './interface/record';
export * from './interface/server';
export * from './interface/struct';
export * from './interface/table';
export * from './interface/ui';
export * from './interface/plugin';
export * from './interface/log';
/**
 * Plugin
 */
export * as I18N from './plugins/i18n';
