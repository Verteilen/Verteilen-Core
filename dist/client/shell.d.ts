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
     * Open shell consolet
     */
    open_shell: (uuid: string, source: Socket) => void;
    /**
     * Open shell console
     * @param input
     */
    enter_shell: (uuid: string, input: string) => void;
    /**
     * Open shell console
     * @param input
     */
    close_shell: (uuid: string) => void;
    /**
     * Open shell console
     * @param input
     */
    close_shell_all: () => void;
    shell_folder: (uuid: string, path: string) => void;
    disconnect: (uuid: string) => void;
    disconnect2: (source: Socket) => void;
}
