import { Socket } from 'socket.io';
import { Messager } from "../interface";
import { Client } from "./client";
export declare class ClientShell {
    private messager;
    private messager_log;
    private os;
    private shell_workers;
    constructor(_messager: Messager, _messager_log: Messager, _client: Client);
    /**
     * Open shell console
     * @param input
     */
    open_shell: (data: number, source: Socket) => void;
    /**
     * Open shell console
     * @param input
     */
    enter_shell: (input: string, source: Socket) => void;
    /**
     * Open shell console
     * @param input
     */
    close_shell: (data: number, source: Socket) => void;
    /**
     * Open shell console
     * @param input
     */
    close_shell_all: (data: number) => void;
    shell_folder: (data: string, source: Socket) => void;
    disconnect: (source: Socket) => void;
}
