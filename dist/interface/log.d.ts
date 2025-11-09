import { Database, Node, Project, Shareable } from "./base";
import { ExecuteState } from "./enum";
import { ExecuteData } from "./record";
export interface ExecuteRecordTask {
    index: number;
    node: string;
    message: Array<string>;
    state: ExecuteState;
}
export interface ExecutionTaskLog {
    task_state: ExecuteData;
    start_timer: number;
    end_timer: number;
    task_detail: Array<ExecuteRecordTask>;
}
export interface ExecutionLog extends Shareable {
    uuid: string;
    dirty?: boolean;
    output?: boolean;
    filename: string;
    project: Project;
    database: Database;
    start_timer: number;
    end_timer: number;
    state: ExecuteState;
    logs: Array<ExecutionTaskLog>;
}
export interface Log {
    logs: Array<ExecutionLog>;
}
export interface Record {
    projects: Array<Project>;
    nodes: Array<Node>;
}
export interface ExecuteRecord extends Record {
    uuid: string;
    name: string;
    running: boolean;
    stop: boolean;
    process_type: number;
    para: Database | undefined;
    command: Array<Array<any>>;
    project: string;
    useCron: boolean;
    task: string;
    project_index: number;
    task_index: number;
    project_state: Array<ExecuteData>;
    task_state: Array<ExecuteData>;
    task_detail: Array<ExecuteRecordTask>;
}
