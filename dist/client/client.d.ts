import { WebSocket } from 'ws';
import { Messager, Messager_log, PluginNode } from '../interface';
/**
 * **Compute Client**\
 * The calculation node worker
 */
export declare class Client {
    /**
     * **Plugin Record**\
     * Use {@link loadPlugins} to load the plugin from disk
     */
    plugins: PluginNode;
    private httpss;
    private client;
    private sources;
    private messager;
    private messager_log;
    private analysis;
    private updatehandle;
    /**
     * Get connected client count
     */
    get count(): number;
    /**
     * Get connected client list instance
     */
    get clients(): Array<WebSocket>;
    constructor(_messager: Messager, _messager_log: Messager_log);
    Dispose(): void;
    /**
     * Start a websocket server, and waiting for cluster server to connect
     */
    Init: () => Promise<void>;
    Destroy: () => void;
    Release: () => void;
    savePlugin: () => void;
    /**
     * The node update function, It will do things below
     * * Send system info to cluster server
     */
    private update;
    /**
     * Load plugin info from disk
     * @param init Whether or not delete the downloading one
     */
    private loadPlugins;
    /**
     * Get https key and cert from disk
     * @returns [Key, Cert]
     */
    private get_pem;
    /**
     * Get worker exe file path, but it could use in different file as well
     * @param filename Worker file without extension
     * @param extension file extension
     * @returns The target file path
     */
    static workerPath: (filename?: string, extension?: string) => string;
    /**
     * Check If we're currently in the typescript environment
     */
    static isTypescript: () => boolean;
}
