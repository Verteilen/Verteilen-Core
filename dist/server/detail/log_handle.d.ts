import { ExecutePair, ExecuteProxy, ExecuteState, FeedBack, Job, Log, Database, Preference, Project, Task } from "../../interface";
export declare class Log_Proxy {
    model: ExecutePair;
    logs: Log;
    preference: Preference;
    private task_index;
    private uuid;
    private get target_log();
    constructor(_model: ExecutePair, _log: Log, _preference: Preference);
    get execute_proxy(): ExecuteProxy;
    execute_project_start: (d: [Project, number]) => Promise<void>;
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
    getnewname: (name: string) => Promise<string>;
}
