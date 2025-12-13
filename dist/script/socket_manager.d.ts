import { Node, NodeProxy, NodeTable, SocketPack } from "../interface";
import { Socket } from 'socket.io-client';
/**
 * The node connection instance manager, Use by the cluster server
 */
export declare class WebsocketManager {
    targets: Array<SocketPack>;
    newConnect: Function;
    disconnect: Function;
    onAnalysis: Function;
    proxy: NodeProxy;
    private messager_log;
    constructor(_newConnect: Function, _disconnect: Function, _onAnalysis: Function, _messager_log: Function, _proxy: NodeProxy);
    /**
     * Trying to connect a node by target URL
     * @param url target url
     * @returns The connection package
     */
    server_start: (url: string, uuid: string) => Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | undefined;
    /**
     * Remove the package by UUID
     * @param uuid Key
     * @param reason Reason for disconnect
     */
    server_stop: (uuid: string, reason?: string) => void;
    /**
     * Manager update, it will does things below
     * * Retry connection
     * @returns Node table for display
     */
    server_update: () => Array<NodeTable>;
    server_record: (ns: Array<Node>) => void;
    shell_open: (uuid: string) => void;
    /**
     * Open shell connection with target node
     * @param uuid node UUID
     * @param text input data
     */
    shell_enter: (uuid: string, text: string) => void;
    /**
     * Close shell connection with target node
     * @param uuid Node UUID
     * @returns
     */
    shell_close: (uuid: string) => void;
    /**
     * Check folder structure with target node
     * @param uuid Node UUID
     * @param path the folder path to check
     */
    shell_folder: (uuid: string, path: string) => void;
    /**
     * Trying to connect a node by target URL
     * @param Node target url
     * @param uuid generate UUID, New or retry connect base on value is defined or not
     * @returns The connection package
     */
    private serverconnect;
    /**
     * The analysis method for the node connection instance
     * @param h Package
     * @param c Connection instance
     */
    private analysis;
    private socket_analysis;
    /**
     * Manager update, it will does things below
     * * Retry connection
     * @returns Node table for display
     */
    private sendUpdate;
    /**
     * Remove the package by UUID
     * @param uuid Key
     * @param reason Reason for disconnect
     */
    private removeByUUID;
    /**
     * Internal update, for checking the ping of every nodes
     */
    private update;
    /**
     * Recevied the shell text from client node
     */
    private shell_reply;
    /**
     * Recevied the folders from client node
     */
    private shell_folder_reply;
    /**
     * Get the system information and assign to the node object
     * @param info Data
     * @param source The node target
     */
    private system_info;
    /**
     * Get the node information and assign to the node object
     * @param info Data
     * @param source The node target
     */
    private node_info;
    /**
     * Get the bouncing back function call\
     * THis method will calculate the time different and assign the node object
     * @param info Dummy number, nothing important, can be ignore
     * @param source The node target
     */
    private pong;
    private plugin_info_reply;
}
