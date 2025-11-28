import WebSocket from "ws";
import { Job, Libraries, Messager, Messager_log, Database, PluginNode } from "../interface";
/**
 * The job execute worker\
 * This class should spawn by the cluster thread to prevent heavy calculation on the main thread
 */
export declare class ClientJobExecute {
    /**
     * Project databases for references
     */
    database: Database | undefined;
    /**
     * User library for scripts
     */
    libraries: Libraries | undefined;
    plugin: PluginNode | undefined;
    /**
     * The job uuid\
     * This will put in the prefix of message
     */
    tag: string;
    /**
     * Runtime UUID
     */
    runtime: string;
    private messager;
    private messager_log;
    private javascript;
    private os;
    private para;
    private job;
    constructor(_messager: Messager, _messager_log: Messager_log, _job: Job, _source: WebSocket | undefined);
    /**
     * The entry function to execute the job container
     * @param job Target job
     */
    execute: () => Promise<string>;
    stop_all: () => void;
    /**
     * Execute the job that classify as run
     * @param job Target job
     * @returns Promise instance
     */
    private execute_job_exe;
    /**
     * Execute the job that classify as condition
     * @param job Target job
     * @returns Promise instance
     */
    private execute_job_con;
}
