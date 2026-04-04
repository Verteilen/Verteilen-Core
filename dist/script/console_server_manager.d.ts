import { Socket } from 'socket.io';
import { TypeMap } from '../interface';
export interface ConsoleServerContainer {
    uuid: string;
    socket: Socket;
    typeMap: TypeMap;
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
    /**
     * Adding a frontend socket to the list\
     * This include add auto delete event when socket disconnect
     * @param socket Target frontend
     * @param typeMap The event map
     * @returns The socket record
     */
    Added: (socket: Socket, typeMap: TypeMap) => ConsoleServerContainer | undefined;
    /**
     * Manually remove the frontend socket
     * @param socket Target frontend
     */
    Remove: (socket: Socket) => void;
}
