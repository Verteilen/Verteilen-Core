import { RecordIOBase } from "./io";
import { PluginPageData, WebsocketPack } from "../interface";
import { PluginFeedback } from "./server";
/**
 * Get socket from websocket client method
 */
export type SocketGetter = (uuid: string) => WebsocketPack | undefined;
/**
 * **Plugin Function Interface**\
 * Use for access the plugin store function
 */
export interface PluginLoader {
    /**
     * Loading all plugins
     */
    load_all: () => Promise<PluginPageData>;
    /**
     * Loading plugins from cache
     */
    get_plugins: () => Promise<PluginPageData>;
    /**
     * Get project template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_project: (name: string, group: string, filename: string) => Promise<string> | undefined;
    /**
     * Get database template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_database: (name: string, group: string, filename: string) => Promise<string> | undefined;
    /**
     * Import plugin from web
     * @param name Plugin name
     * @param url The URL for plugin manifest
     * @param token Token list, use space to seperate
     */
    import_plugin: (name: string, url: string, token: string) => Promise<PluginPageData>;
    /**
     * Delete plugin by name
     * @param name Plugin name
     */
    delete_plugin: (name: string) => Promise<PluginPageData>;
    /**
     * Telling node Download plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     * @param token Token list, use space to seperate
     */
    plugin_download: (uuid: string, plugin: string, tokens: string) => Promise<void>;
    /**
     * Telling node Remove plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     */
    plugin_remove: (uuid: string, plugin: string) => Promise<void>;
}
/**
 * **Get Current Plugin List**
 * @param loader The file io loader
 * @returns Current list in disk storage
 */
export declare const GetCurrentPlugin: (loader: RecordIOBase) => Promise<PluginPageData>;
export declare const CreatePluginLoader: (loader: RecordIOBase, memory: PluginPageData, socket: SocketGetter, feedback: PluginFeedback) => PluginLoader;
