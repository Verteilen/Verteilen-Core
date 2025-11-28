import { ConsoleServerManager, PluginPageData } from "../interface";
import { ServerDetail } from "./detail";
import { MemoryData, RecordIOBase, RecordLoader } from "./io";
import { Project_Module } from "./module/project";
import { PluginLoader } from "./plugin";
export type Caller_Electron_Send = (channel: string, ...args: any[]) => void;
export interface Caller_Electron {
    send: Caller_Electron_Send;
}
export type Caller_Socket = (data: any) => void;
export type TypeMap = {
    [key: string]: Function;
};
/**
 * **Backend Feedback**\
 * The config that which {@link ServerDetail} require to use\
 * Depends on what input value it have, it could have different type of response
 */
export interface PluginFeedback {
    /**
     * Eletron feedback
     */
    electron: (() => (Caller_Electron | undefined)) | undefined;
    /**
     * WebServer feedback
     */
    socket: Caller_Socket | undefined;
}
export declare class ServerBase {
    manager: Array<ConsoleServerManager>;
    memory: MemoryData;
    plugin: PluginPageData;
    io: RecordIOBase | undefined;
    loader: RecordLoader | undefined;
    memory_loader: RecordLoader;
    plugin_loader: PluginLoader | undefined;
    detail: ServerDetail | undefined;
    module_project: Project_Module;
    constructor();
    get current_loader(): RecordLoader;
    /**
     * **Data: Memory**\
     * Load every type of data from disk, store them into memory
     */
    LoadFromDisk: () => Promise<Array<Array<string>>>;
    /**
     * **Broadcast To Console**\
     * Send messages to all console server
     * @param name channel
     * @param data raw data
     */
    Boradcasting: (name: string, data: any) => void;
}
