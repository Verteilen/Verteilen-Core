import { Execute_ConsoleServerManager, PluginPageData } from "../interface";
import { ServerDetail } from "./detail";
import { MemoryData, RecordIOBase, RecordLoader } from "./io";
import { Project_Module } from "./module/project";
import { EventObserver } from "./observer";
import { PluginLoader } from "./plugin";
export type Caller_Electron_Send = (channel: string, ...args: any[]) => void;
export interface Caller_Electron {
    send: Caller_Electron_Send;
}
export type Caller_Socket = (data: any) => void;
export type TypeMap = {
    [key: string]: Function;
};
export interface PluginFeedback {
    electron: (() => (Caller_Electron | undefined)) | undefined;
    socket: Caller_Socket | undefined;
}
export declare class Server {
    manager: Array<Execute_ConsoleServerManager.ConsoleServerManager>;
    memory: MemoryData;
    plugin: PluginPageData;
    io: RecordIOBase | undefined;
    loader: RecordLoader | EventObserver | undefined;
    plugin_loader: PluginLoader | undefined;
    memory_loader: RecordLoader;
    detail: ServerDetail | undefined;
    module_project: Project_Module;
    constructor();
    get current_loader(): RecordLoader;
    LoadFromDisk: () => Promise<Array<Array<string>>>;
    Boradcasting: (name: string, data: any) => void;
}
