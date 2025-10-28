// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { WebsocketPack, ExecuteState, Job, CronJobState, Task } from "../../interface"
import { ExecuteManager } from "../execute_manager"
import { Region_Job } from "./region_job"

export class Region_Subtask {
    target:ExecuteManager
    work:CronJobState
    ns:WebsocketPack
    runner: Region_Job | undefined

    constructor(target:ExecuteManager, work:CronJobState, ns:WebsocketPack){
        this.target = target
        this.work = work
        this.ns = ns
    }

    public get task() : Task {
        return this.target.current_t!
    }
    

    RUN = () => {
        if(this.ns.current_job.length < this.target.current_multithread){
            const rindex = this.work.work.findIndex(x => x.state == ExecuteState.RUNNING)
            if(rindex != -1) return
            const index = this.work.work.findIndex(x => x.state == ExecuteState.NONE)
            if(index == 0) this.target.proxy?.executeSubtaskStart([this.task, this.work.id, this.ns.uuid ])
            if(index == -1) return
            this.work.work[index].state = ExecuteState.RUNNING
            try {
                const job:Job = JSON.parse(JSON.stringify(this.task.jobs[index]))
                job.index = this.work.id
                job.runtime_uuid = this.work.work[index].runtime
                if(this.runner == undefined){
                    this.runner = new Region_Job(this.target, this.task, job, this.ns)
                }
                this.runner.RUN()
            }catch(err){
                this.target.messager_log(`[ExecuteCronTask Error] UUID: ${this.task.uuid}, Job count: ${this.task.jobs.length}, index: ${index}`)
            }
        }
    }
}