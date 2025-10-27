import WebSocket from 'ws';
import { Messager } from "../interface";
import { Client } from "./client";
export declare class ClientShell {
    private messager;
    private messager_log;
    private os;
    private shell_workers;
    constructor(_messager: Messager, _messager_log: Messager, _client: Client);
    open_shell: (data: number, source: WebSocket) => void;
    enter_shell: (input: string, source: WebSocket) => void;
    close_shell: (data: number, source: WebSocket) => void;
    close_shell_all: (data: number) => void;
    shell_folder: (data: string, source: WebSocket) => void;
    disconnect: (source: WebSocket) => void;
}
