import { WebSocket } from 'ws';
import { Messager, Messager_log, PluginList } from '../interface';
export declare class Client {
    plugins: PluginList;
    private httpss;
    private client;
    private sources;
    private messager;
    private messager_log;
    private analysis;
    private updatehandle;
    get count(): number;
    get clients(): Array<WebSocket>;
    constructor(_messager: Messager, _messager_log: Messager_log);
    Dispose(): void;
    Init: () => Promise<void>;
    Destroy: () => void;
    Release: () => void;
    savePlugin: () => void;
    private update;
    private loadPlugins;
    private get_pem;
    static workerPath: (filename?: string, extension?: string) => string;
    static isTypescript: () => boolean;
}
