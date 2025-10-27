import { ExecuteManager } from "../script/execute_manager";
import { Job } from "./base";
import { ExecuteState } from "./enum";
import { ExecuteRecord } from "./record";
export interface ExecutePair {
    manager?: ExecuteManager;
    record?: ExecuteRecord;
    meta?: any;
}
export interface CronJobState {
    id: number;
    uuid: string;
    work: Array<WorkState>;
}
export interface WorkState {
    uuid: string;
    runtime: string;
    state: ExecuteState;
    job: Job;
}
