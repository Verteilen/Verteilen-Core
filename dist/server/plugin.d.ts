import { RecordIOBase } from "./io";
import { PluginList, PluginPageData, WebsocketPack } from "../interface";
import { PluginFeedback } from "./server";
export type SocketGetter = (uuid: string) => WebsocketPack | undefined;
export interface PluginLoader {
    load_all: () => Promise<PluginPageData>;
    get_project: (group: string, filename: string) => string | undefined;
    get_database: (group: string, filename: string) => string | undefined;
    get_plugin: () => Promise<Array<PluginList>>;
    import_template: (name: string, url: string, token: string) => Promise<PluginPageData>;
    import_plugin: (name: string, url: string, token: string) => Promise<PluginPageData>;
    delete_template: (name: string) => Promise<void>;
    delete_plugin: (name: string) => Promise<void>;
    plugin_download: (uuid: string, plugin: string, tokens: string) => Promise<void>;
    plugin_remove: (uuid: string, plugin: string) => Promise<void>;
}
export declare const GetCurrentPlugin: (loader: RecordIOBase) => Promise<PluginPageData>;
export declare const CreatePluginLoader: (loader: RecordIOBase, memory: PluginPageData, socket: SocketGetter, feedback: PluginFeedback) => PluginLoader;
