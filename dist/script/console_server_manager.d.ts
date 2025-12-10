import * as ws from 'ws';
import { Header } from "../interface";
type calltype = {
    [key: string]: Function;
};
export interface ConsoleServerContainer {
    uuid: string;
    ws: ws.WebSocket;
    typeMap: calltype;
}
/**
 * Console server helper, cluster server side handle web client connection instances
 */
export declare class ConsoleServerManager {
    /**
     * Websocket instance for admin
     */
    admins: Array<ConsoleServerContainer>;
    messager_log: Function;
    constructor(_messager_log: Function);
    static Create: (_ws: ws.WebSocket, _typeMap: calltype) => ConsoleServerContainer;
    Analysis: (ws: ws.WebSocket, h: Header) => void;
}
export {};
