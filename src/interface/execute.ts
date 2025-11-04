// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * The data structure which will use in execute stage
 */
import { ExecuteManager } from "../script/execute_manager"
import { Job } from "./base"
import { ExecuteState } from "./enum"
import { ExecuteRecord } from "./log"

/**
 * **Server Execute Record**\
 * 
 */
export interface ExecutePair {
    /**
     * **Execute Manager Instance**\
     * The main execute worker
     */
    manager?: ExecuteManager
    /**
     * **Execute Record Data**\
     * To store the state which can be display at the frontend
     */
    record?: ExecuteRecord
    /**
     * **Extra Data**\
     * The counter for trigger update event in vue
     */
    meta?: any
}
/**
 * The cronjob package, contain subtask state
 */
export interface CronJobState  {
    /**
     * The index order for the cron pacakge
     */
    id: number, 
    /**
     * The network instance uuid
     */
    uuid: string, 
    /**
     * All the job state package
     */
    work: Array<WorkState>
}

/**
 * The job package, contain jobs state
 */
export interface WorkState {
    /**
     * The network instance uuid
     */
    uuid: string
    /**
     * Runtime uuid
     */
    runtime: string
    /**
     * Job state
     */
    state: ExecuteState 
    /**
     * The job instance
     */
    job: Job
}