import { Project } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Task } from "./region_task";
export declare class Region_Project {
    target: ExecuteManager;
    project: Project;
    runner: Region_Task | undefined;
    constructor(_target: ExecuteManager, _project: Project);
    RUN: () => void;
}
