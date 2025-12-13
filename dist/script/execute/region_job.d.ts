import { Job, Task, SocketPack } from "../../interface";
import { ExecuteManager } from "../execute_manager";
export declare class Region_Job {
    target: ExecuteManager;
    task: Task;
    job: Job;
    wss: SocketPack;
    constructor(target: ExecuteManager, task: Task, job: Job, wss: SocketPack);
    RUN: () => void;
    private string_args_transform;
    private property_update;
    private database_update;
}
