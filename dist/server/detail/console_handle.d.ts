import { ExecutePair, ExecuteProxy, ExecuteState, FeedBack, Job, Database, Project, Record, Task } from "../../interface";
/**
 * The method to handle the init package {@link ExecutePair} process
 */
export declare const receivedPack: (model: ExecutePair, record: Record) => boolean;
/**
 * **Console Proxy Worker**\
 * Process thread call proxy and throght {@link Console_Proxy.execute_proxy}\
 * To communicate with outside record data
 */
export declare class Console_Proxy {
    model: ExecutePair;
    constructor(_model: ExecutePair);
    get execute_proxy(): ExecuteProxy;
    execute_project_start: (d: [Project, number]) => void;
    execute_project_finish: (d: [Project, number]) => void;
    execute_task_start: (d: [Task, number]) => void;
    execute_task_finish: (d: Task) => void;
    execute_subtask_start: (d: [Task, number, string]) => void;
    execute_subtask_update: (d: [Task, number, string, ExecuteState]) => void;
    execute_subtask_end: (d: [Task, number, string]) => void;
    execute_job_start: (d: [Job, number, string]) => void;
    execute_job_finish: (d: [Job, number, string, number]) => void;
    feedback_message: (d: FeedBack) => void;
    /**
     * When database getting change by the process steps\
     * This get called
     * @param d The whole container for the databases
     */
    update_runtime_database: (d: Database) => void;
}
