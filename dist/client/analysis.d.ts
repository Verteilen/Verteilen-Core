import { WebSocket } from 'ws';
import { Header, Messager, Messager_log } from "../interface";
import { Client } from './client';
/**
 * The analysis worker. decode the message received from cluster server
 */
export declare class ClientAnalysis {
    private messager;
    private messager_log;
    private client;
    private exec;
    private shell;
    private resource_wanter;
    private resource_thread;
    private resource_cache;
    /**
     * Create the worker
     * @param _messager The log function at the lower level, Which does not send back to server
     * @param _messager_log The log function at the higher level, Which does send back to server
     * @param _client Client instance
     */
    constructor(_messager: Messager, _messager_log: Messager_log, _client: Client);
    /**
     * Analysis the package
     * @param h Package
     * @param source Websocket instance
     * @return
     * * 0: Successfully execute command
     * * 1: The header is undefined, cannot process
     * * 2: Cannot find the header name match with function typeMap
     */
    analysis: (h: Header | undefined, source: WebSocket) => 0 | 1 | 2;
    /**
     * Job execution, Pipe down to execution worker to execute the input job object
     * @param job Job Object
     * @param source Command source
     * @param channel Job thread UUID channel
     */
    private execute_job;
    /**
     * Release the job execution thread
     * @param dummy Not important
     * @param source Command source
     * @param channel Job thread UUID channel
     */
    private release;
    /**
     * Set buffer database
     * @param data Database Object
     * @param source Command source
     * @param channel Job thread UUID channel
     */
    private set_database;
    /**
     * Set buffer libraries
     * @param data Libraries Object
     * @param source Command source
     * @param channel Job thread UUID channel
     */
    private set_libs;
    /**
     * Get the execution channel by UUID
     * @param uuid UUID
     * @returns Execution worker instance
     */
    private exec_checker;
    /**
     * Network delay request
     * @param data Dummy value, should always be 0
     * @param source The cluster server websocket instance
     */
    private pong;
    /**
     * Feedback current plugin state to computed server
     * @param dummy Not important
     * @param source The cluster server websocket instance
     */
    private plugin_info;
    /**
     * ? utility for plugin download\
     * Get release info
     * @param repo Repository name
     * @param token If it's for private repo, You will need token here
     * @returns The Json string info
     */
    private get_releases;
    /**
     * ? utility for plugin download\
     * Get the asset id from repo release info and filename, version\
     * It's useful for getting a download link
     * @param repo Repository
     * @param token If it's for private repo, You will need token here
     * @param version Target version
     * @param filename Target filename
     * @returns
     */
    private filterout;
    private write_plugin;
    private finish_plugin;
    /**
     * Download the exe file from target plugin\
     * And overwrite the plugin record
     * @param plugin Target plugin
     * @param source Command source
     */
    private plugin_download;
    private plugin_remove;
    private resource_start;
    private resource_end;
    update: (client: Client) => void;
    disconnect: (source: WebSocket) => void;
    stop_all: () => void;
    destroy: () => void;
    private resource_require;
}
