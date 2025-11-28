import { WebSocket } from 'ws';
import { Job, Libraries, Messager, Messager_log, Database, Setter } from "../interface";
import { Client } from "./client";
/**
 * Execute worker, Execute the job container
 */
export declare class ClientExecute {
    /**
     * Execution UUID, Will affect the feedback log output
     */
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
    /**
     * The stop signal, It will trying to kill the process if currently running
     */
    stop_job: () => void;
    /**
     * The entry function to execute the job container
     * @param job Target job
     */
    execute_job: (job: Job, source: WebSocket) => void;
    /**
     * Execute job, send it to different thread
     * @param job Job instance
     * @param source Command sender
     */
    private execute_job_worker;
    /**
     * Job finish feedback from other thread
     * @param code Thread code feedback
     * @param signal Signal string
     * @param job Target job instance
     * @param source Command sender
     */
    private job_finish;
    /**
     * Update database, Called by cluster server
     * @param data Target container
     */
    set_database: (data: Database) => void;
    /**
     * Update libraries, Called by cluster server
     * @param data Target container
     */
    set_libs: (data: Libraries) => void;
    /**
     * Update database string, Called by cluster server
     * @deprecated The method should not be used
     * @param data Target keyvalue
     */
    set_string: (data: Setter) => void;
    /**
     * Update database number, Called by cluster server
     * @deprecated The method should not be used
     * @param data Target keyvalue
     */
    set_number: (data: Setter) => void;
    /**
     * Update database boolean, Called by cluster server
     * @deprecated The method should not be used
     * @param data Target keyvalue
     */
    set_boolean: (data: Setter) => void;
}
