import { CronJobState, ExecuteProxy, ExecuteState, Job, Libraries, Messager, Database, Project, Record, Task, SocketPack, WorkState } from "../../interface";
import { WebsocketManager } from "../socket_manager";
import { Util_Parser } from './util_parser';
import { Region_Project } from './region_project';
/**
 * The base class of task scheduler, contain some basic funcationality
 */
export declare class ExecuteManager_Base {
    /**
     * The task scheduler UUID
     */
    uuid: string;
    name: string;
    /**
     * Register record\
     * This record holds the project data you want to process
     */
    record: Record;
    /**
     * The list of projects you want to process\
     * Each project UUID should be unique by now\
     * Prevent findIndex error, When there is repeat project source
     */
    current_projects: Array<Project>;
    /**
     * The connection nodes list
     */
    current_nodes: Array<SocketPack>;
    /**
     * * NONE: Not yet start
     * * RUNNING: In the processing stage
     * * FINISH: Everything is finish processing
     */
    state: ExecuteState;
    /**
     * * NONE: Not yet start
     * * RUNNING: In the processing stage
     * * FINISH: Everything is finish processing
     */
    t_state: ExecuteState;
    jobstack: number;
    first: boolean;
    libs: Libraries | undefined;
    proxy: ExecuteProxy | undefined;
    localPara: Database | undefined;
    websocket_manager: WebsocketManager;
    messager_log: Messager;
    runner: Region_Project | undefined;
    constructor(_name: string, _websocket_manager: WebsocketManager, _messager_log: Messager, _record: Record);
    /**
     * Current select project\
     * If it's undefined, it means:
     * * It's finish the current project
     * * It has not start processing yet
     */
    get current_p(): Project | undefined;
    /**
     * Current select task\
     * If it's undefined, it means:
     * * It's finish the current task
     * * It has not start processing yet
     */
    get current_t(): Task | undefined;
    /**
     * Current execute task use multithread setting
     */
    get current_multithread(): number;
    get current_task_count(): number;
    /**
     * Cron job type execute record
     */
    get current_cron(): Array<CronJobState>;
    /**
     * Single job type execute record
     */
    get current_job(): Array<WorkState>;
    /**
     * This will let nodes update the database and lib
     * @param target
     */
    protected sync_local_para: (target: Database) => void;
    protected sync_para: (target: Database, source: SocketPack) => void;
    protected release: (source: SocketPack) => void;
    /**
     * Check all the cronjob is finish or not
     */
    protected check_all_cron_end: () => boolean;
    /**
     * Check input cronjob is finish or not
     * @param cron target cronjob instance
     */
    protected check_cron_end: (cron: CronJobState) => boolean;
    /**
     * Check current single is finish or not
     */
    protected check_single_end: () => boolean;
    /**
     * Project format checking
     * @param projects
     * @returns
     */
    protected validation: (projects: Array<Project>) => boolean;
    protected filter_lib: (projects: Array<Project>, lib: Libraries) => Libraries;
    /**
     * Get the multi-core setting\
     * Find in the database setting
     * @param key The multi-core-key
     * @returns
     */
    protected get_task_multi_count: (t: Task) => number;
    /**
     * Get the task's cronjob count
     */
    get_task_state_count(t: Task): number;
    /**
     * Find the number in the database, this include the expression phrasing
     * @param key The name key
     * @param p Project instance
     * @returns The value, if key cannot be found, it will return -1
     */
    protected get_number(key: string): number;
    static get_number_global(key: string, localPara: Database | undefined): number;
    /**
     * Remove dups item in the list
     * @param arr
     * @returns
     */
    protected removeDups: (arr: any[]) => any[];
    /**
     * Filter out the idle and connection open nodes
     * @returns All idle and open connection nodes
     */
    protected get_idle: () => Array<SocketPack>;
    /**
     * Filter out the connection open nodes
     * @returns All open connection nodes
     */
    protected get_idle_open: () => Array<SocketPack>;
    protected check_socket_state: (target: SocketPack) => ExecuteState.NONE | ExecuteState.RUNNING;
    static string_args_transform: (task: Task, job: Job, messager_log: Messager, localPara: Database, n: number) => void;
    static property_update: (task: Task, e: Util_Parser) => Util_Parser;
    static database_update: (localPara: Database, n?: number) => Util_Parser;
}
