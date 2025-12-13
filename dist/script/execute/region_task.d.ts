import { CronJobState, Database, ExecuteState, Project, Task, SocketPack, WorkState } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Job } from "./region_job";
import { Region_Project } from "./region_project";
import { Region_Subtask } from "./region_subtask";
import { Util_Parser } from "./util_parser";
export declare class Region_Task {
    target: ExecuteManager;
    task: Task;
    multithread: number;
    task_count: number;
    cron: Array<CronJobState>;
    job: Array<WorkState>;
    runners: Array<Region_Subtask | undefined>;
    jrunners: Array<Region_Job | undefined>;
    constructor(target: ExecuteManager, task: Task);
    get project(): Project;
    get parent(): Region_Project;
    RUN: () => void;
    /**
     * It will spawn amounts of cronjob and send the tasks for assigned node to execute them one by one
     * @param taskCount Should be equal to cronjob result
     * @returns Is finish executing
     */
    ExecuteTask_Cronjob(project: Project, task: Task, taskCount: number): boolean;
    /**
     * There will be no CronTask be called, it will go straight to the Execute job section
     * @param taskCount Must be 1
     * @returns Is finish executing
     */
    ExecuteTask_Single(project: Project, task: Task, taskCount: number): boolean;
    ExecuteTask_Setup(project: Project, task: Task, taskCount: number): boolean;
    ExecuteTask_AllFinish(project: Project, task: Task): void;
    Init_CronContainer: (taskCount: number) => void;
    /**
     * Filter out the idle and connection open nodes
     * @returns All idle and open connection nodes
     */
    get_idle: () => Array<SocketPack>;
    check_socket_state: (target: SocketPack) => ExecuteState.NONE | ExecuteState.RUNNING;
    /**
     * This will let nodes update the database and lib
     * @param target
     */
    sync_local_para: (target: Database) => void;
    sync_para: (target: Database, source: SocketPack) => void;
    get_idle_open: () => Array<SocketPack>;
    /**
     * Check all the cronjob is finish or not
     */
    check_all_cron_end: () => boolean;
    /**
     * Check input cronjob is finish or not
     * @param cron target cronjob instance
     */
    check_cron_end: (cron: CronJobState) => boolean;
    /**
     * Check current single is finish or not
     */
    check_single_end: () => boolean;
    /**
     * Get the multi-core setting\
     * Find in the database setting
     * @param key The multi-core-key
     * @returns
     */
    get_task_multi_count: (t: Task) => number;
    /**
     * Get the task's cronjob count
     */
    get_task_state_count(t: Task): number;
    get_number(key: string): number;
    get_number_global(key: string, localPara: Database | undefined): number;
    database_update: (localPara: Database, n?: number) => Util_Parser;
}
