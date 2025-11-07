import { ExecutePair, ExecuteProxy, ExecuteState, FeedBack, Job, Database, Project, Record, Task } from "../../interface";
export declare const receivedPack: (model: ExecutePair, record: Record) => boolean;
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
    update_runtime_database: (d: Database) => void;
}
