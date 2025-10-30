import { WebsocketPack, CronJobState, Task } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Job } from "./region_job";
export declare class Region_Subtask {
    target: ExecuteManager;
    work: CronJobState;
    ns: WebsocketPack;
    runner: Region_Job | undefined;
    constructor(target: ExecuteManager, work: CronJobState, ns: WebsocketPack);
    get task(): Task;
    RUN: () => void;
}
