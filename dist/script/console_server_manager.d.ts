import { Socket } from 'socket.io';
type calltype = Array<[string, (...args: Array<any>) => void]>;
export interface ConsoleServerContainer {
    uuid: string;
    socket: Socket;
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
    Added: (socket: Socket, typeMap: calltype) => ConsoleServerContainer | undefined;
}
export {};
