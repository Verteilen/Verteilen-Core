import { BusAnalysis, ExecutePair, ExecuteProxy, ExecuteState, Messager, NodeProxy, Record, ShellFolder, Single, SocketPack, ServerDetailEvent, BackendAction } from "../interface";
import { PluginFeedback } from "./server";
import { RecordIOBase } from './io';
import { WebsocketManager } from '../script/socket_manager';
/**
 * **Server Inner-Work Handler**\
 * Include the core cluster logic here
 */
export declare class ServerDetail implements NodeProxy, ServerDetailEvent {
    execute_manager: Array<ExecutePair>;
    websocket_manager: WebsocketManager | undefined;
    shellBind: Map<any, any>;
    loader: RecordIOBase | undefined;
    backend: BackendAction;
    feedback: PluginFeedback;
    message: Messager;
    messager_log: Function;
    updatehandle: any;
    /**
     * **A simple message queue**\
     * message, trace message, error message return data, for update
     */
    re: Array<any>;
    constructor(loader: RecordIOBase | undefined, backend: BackendAction, feedback: PluginFeedback, message: Messager, messager_log: Function);
    /**
     * **Caller Reference**
     */
    get events(): ServerDetailEvent;
    /**
     * **Caller Reference**
     */
    get nodeEvents(): NodeProxy;
    NewConnection: (x: SocketPack) => void;
    DisConnection: (x: SocketPack) => void;
    Analysis: (d: BusAnalysis) => void;
    /**
     * **Shell Reply Message Event**\
     * Called by the client node
     * @param data Content
     * @param p Client node source
     */
    shellReply: (data: Single, p?: SocketPack) => void;
    /**
     * **Shell Folder Location Event**\
     * Called by the client node
     * @param data Content
     * @param p Client node source
     */
    folderReply: (data: ShellFolder, p?: SocketPack) => void;
    resource_start: (socket: any, uuid: string) => void;
    resource_end: (socket: any, uuid: string) => void;
    plugin_info: (socket: any, uuid: string) => void;
    shell_enter: (socket: any, uuid: string, value: string) => void;
    shell_open: (socket: any, uuid: string) => void;
    shell_close: (socket: any, uuid: string) => void;
    shell_folder: (socket: any, uuid: string, path: string) => void;
    node_list: (socket: any) => SocketPack[] | undefined;
    node_add: (socket: any, url: string, uuid: string) => void;
    node_update: (socket: any) => import("../interface").NodeTable[] | undefined;
    node_delete: (socket: any, uuid: string, reason?: string) => void;
    console_list: (socket: any) => undefined;
    console_record: (socket: any, uuid: string) => string;
    console_execute: (socket: any, uuid: string, type: number) => void;
    console_stop: (socket: any, uuid: string) => void;
    console_add: (socket: any, name: string, record: Record, uuid: string | undefined) => void;
    console_update_call: () => void;
    console_clean: (socket: any, uuid: string) => void;
    console_skip: (socket: any, uuid: string, forward: boolean, type: number, state?: ExecuteState) => void;
    console_skip2: (socket: any, uuid: string, v: number) => void;
    console_update: () => any[];
    CombineProxy: (eps: Array<ExecuteProxy>) => ExecuteProxy;
}
