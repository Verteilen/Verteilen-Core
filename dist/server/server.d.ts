import { Execute_ConsoleServerManager, PluginPageData } from "../interface";
import { ServerDetail } from "./detail";
import { MemoryData, RecordIOBase, RecordLoader } from "./io";
import { PluginLoader } from "./plugin";
export type Caller_Electron = (channel: string, ...args: any[]) => void;
export type Caller_Socket = (data: any) => void;
export type TypeMap = {
    [key: string]: Function;
};
export interface PluginFeedback {
    electron: Caller_Electron | undefined;
    socket: Caller_Socket | undefined;
}
export declare class Server {
    manager: Array<Execute_ConsoleServerManager.ConsoleServerManager>;
    memory: MemoryData;
    plugin: PluginPageData;
    io: RecordIOBase | undefined;
    loader: RecordLoader | undefined;
    plugin_loader: PluginLoader | undefined;
    memory_loader: RecordLoader;
    detail: ServerDetail | undefined;
    constructor();
    get current_loader(): RecordLoader;
    LoadFromDisk: () => Promise<Array<Array<string>>>;
    Boradcasting: (name: string, data: any) => void;
}
