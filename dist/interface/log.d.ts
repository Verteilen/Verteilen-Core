import { Database, DataHeader, Node, Project, Shareable } from "./base";
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
export interface ExecutionLog extends DataHeader, Shareable {
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
/**
 * **Execute Record**\
 * Content all the information execution thread is needed
 * * Projects - A list of project which need to execute by order
 * * Nodes - The node which use for this thread
 */
export interface Record {
    /**
     * **Project List**\
     * Specified the project list for execution
     */
    projects: Array<Project>;
    /**
     * **Node List**\
     * Specified the node list for execution
     */
    nodes: Array<Node>;
}
/**
 * **Execute Thread State**\
 * All the state is in here which will be use in execution processes
 */
export interface ExecuteRecord extends Record {
    /**
     * **Thread ID**
     */
    uuid: string;
    /**
     * **Thread Name**
     */
    name: string;
    /**
     * Is it running right now
     */
    running: boolean;
    /**
     * Is it stop right now
     */
    stop: boolean;
    /**
     * The speicifed the process step type
     * * 0: All Projects through
     * * 1: Single project through
     * * 2: SIngle task through
     */
    process_type: number;
    /**
     * Database data instance right now
     */
    para: Database | undefined;
    /**
     * **Command buffer**\
     * The internal command which execute at next tick\
     * Such as skip and stop command for execute thread
     */
    command: Array<Array<any>>;
    /**
     * **Project ID**
     */
    project: string;
    /**
     * **Cronjob Mod**\
     * Effect display
     */
    useCron: boolean;
    /**
     * **Task ID**
     */
    task: string;
    /**
     * **Current Project Index**\
     * You can have multiple project
     */
    project_index: number;
    /**
     * **Current Task Index**
     */
    task_index: number;
    /**
     * **Project State**
     */
    project_state: Array<ExecuteData>;
    /**
     * **Task State**
     */
    task_state: Array<ExecuteData>;
    /**
     * **Subtask Detail State**
     */
    task_detail: Array<ExecuteRecordTask>;
}
