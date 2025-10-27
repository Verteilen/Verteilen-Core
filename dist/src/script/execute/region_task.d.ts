import { ExecuteState, Task } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Subtask } from "./region_subtask";
export declare class Region_Task {
    target: ExecuteManager;
    state: ExecuteState;
    task: Task;
    subtask: Region_Subtask | undefined;
    constructor(_target: ExecuteManager, _task: Task);
}
