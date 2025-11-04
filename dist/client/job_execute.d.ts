import WebSocket from "ws";
import { Job, Libraries, Messager, Messager_log, Database, PluginNode } from "../interface";
export declare class ClientJobExecute {
    database: Database | undefined;
    libraries: Libraries | undefined;
    tag: string;
    runtime: string;
    private messager;
    private messager_log;
    private javascript;
    private os;
    private para;
    private job;
    private plugin;
    constructor(_messager: Messager, _messager_log: Messager_log, _job: Job, _source: WebSocket | undefined, _plugin: PluginNode);
    execute: () => Promise<string>;
    stop_all: () => void;
    private execute_job_exe;
    private execute_job_con;
}
