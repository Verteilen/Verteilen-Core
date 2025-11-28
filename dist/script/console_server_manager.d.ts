import * as ws from 'ws';
import { Header } from "../interface";
type calltype = {
    [key: string]: Function;
};
/**
 * Console server helper, cluster server side handle web client connection instances
 */
export declare class ConsoleServerManager {
    /**
     * Websocket instance for admin
     */
    ws: ws.WebSocket;
    typeMap: calltype;
    messager_log: Function;
    constructor(_ws: ws.WebSocket, _messager_log: Function, _typeMap: calltype);
    Analysis: (h: Header) => void;
}
export {};
