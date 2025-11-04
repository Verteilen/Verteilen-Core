import { RecordIOBase } from "./io";
import { PluginPageData, WebsocketPack } from "../interface";
import { PluginFeedback } from "./server";
export type SocketGetter = (uuid: string) => WebsocketPack | undefined;
export interface PluginLoader {
    load_all: () => Promise<PluginPageData>;
    get_plugins: () => Promise<PluginPageData>;
    get_project: (name: string, group: string, filename: string) => string | undefined;
    get_database: (name: string, group: string, filename: string) => string | undefined;
    import_plugin: (name: string, url: string, token: string) => Promise<PluginPageData>;
    delete_plugin: (name: string) => Promise<void>;
    plugin_download: (uuid: string, plugin: string, tokens: string) => Promise<void>;
    plugin_remove: (uuid: string, plugin: string) => Promise<void>;
}
export declare const GetCurrentPlugin: (loader: RecordIOBase) => Promise<PluginPageData>;
export declare const CreatePluginLoader: (loader: RecordIOBase, memory: PluginPageData, socket: SocketGetter, feedback: PluginFeedback) => PluginLoader;
