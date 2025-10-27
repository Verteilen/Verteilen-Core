import { WebSocket } from 'ws';
import { Job, Libraries, Messager, Messager_log, Database, Setter } from "../interface";
import { Client } from "./client";
export declare class ClientExecute {
    uuid: string;
    private database;
    private libraries;
    private tag;
    private workers;
    private client;
    private messager;
    private messager_log;
    get count(): number;
    constructor(_uuid: string, _messager: Messager, _messager_log: Messager_log, _client: Client);
    stop_job: () => void;
    execute_job: (job: Job, source: WebSocket) => void;
    private execute_job_worker;
    private job_finish;
    set_database: (data: Database) => void;
    set_libs: (data: Libraries) => void;
    set_string: (data: Setter) => void;
    set_number: (data: Setter) => void;
    set_boolean: (data: Setter) => void;
}
