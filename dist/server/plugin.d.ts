import { RecordIOBase } from "./io";
import { PluginPageData, SocketPack } from "../interface";
import { PluginFeedback } from "./server";
import { Socket } from "socket.io";
/**
 * Get socket from websocket client method
 */
export type SocketGetter = (uuid: string) => SocketPack | undefined;
/**
 * **Plugin Function Interface**\
 * Use for access the plugin store function
 */
export interface PluginLoader {
    /**
     * Loading all plugins
     */
    load_all: () => Promise<void>;
    /**
     * Loading plugins from cache
     */
    get_plugins: (socket: Socket | undefined) => void;
    /**
     * Get project template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_project: (socket: Socket | undefined, name: string, group: string, filename: string) => void;
    /**
     * Get database template
     * @param name Plugin name
     * @param group Group search
     * @param filename Template filename
     */
    get_database: (socket: Socket | undefined, name: string, group: string, filename: string) => void;
    /**
     * Import plugin from web
     * @param name Plugin name
     * @param url The URL for plugin manifest
     * @param token Token list, use space to seperate
     */
    import_plugin: (socket: Socket | undefined, name: string, url: string, token: string) => Promise<void>;
    /**
     * Delete plugin by name
     * @param name Plugin name
     */
    delete_plugin: (socket: Socket | undefined, name: string) => Promise<void>;
    /**
     * Telling node Download plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     * @param token Token list, use space to seperate
     */
    plugin_download: (socket: Socket | undefined, uuid: string, plugin: string, tokens: string) => Promise<void>;
    /**
     * Telling node Remove plugin
     * @param uuid Node ID
     * @param plugin Plugin name
     */
    plugin_remove: (socket: Socket | undefined, uuid: string, plugin: string) => Promise<void>;
}
/**
 * **Get Current Plugin List**
 * @param loader The file io loader
 * @returns Current list in disk storage
 */
export declare const GetCurrentPlugin: (loader: RecordIOBase) => Promise<PluginPageData>;
export declare const CreatePluginLoader: (loader: RecordIOBase, memory: PluginPageData, socket: SocketGetter, feedback: PluginFeedback) => PluginLoader;
