import { ExecuteState, Project } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Task } from "./region_task";
export declare class Region_Project {
    target: ExecuteManager;
    state: ExecuteState;
    project: Project;
    task: Region_Task | undefined;
    constructor(_target: ExecuteManager, _project: Project);
}
