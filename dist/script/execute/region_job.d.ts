import { Job, Task, WebsocketPack } from "../../interface";
import { ExecuteManager } from "../execute_manager";
export declare class Region_Job {
    target: ExecuteManager;
    task: Task;
    job: Job;
    wss: WebsocketPack;
    constructor(target: ExecuteManager, task: Task, job: Job, wss: WebsocketPack);
    RUN: () => void;
    private string_args_transform;
    private property_update;
    private database_update;
}
