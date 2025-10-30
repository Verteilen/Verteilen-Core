// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { CronJobState, Database, DataType, ExecuteState, Header, Job, Project, Task, WebsocketPack, WorkState } from "../../interface";
import { ExecuteManager } from "../execute_manager";
import { Region_Job } from "./region_job";
import { Region_Project } from "./region_project";
import { Region_Subtask } from "./region_subtask";
import { Util_Parser } from "./util_parser";
import { v6 as uuidv6 } from 'uuid';

export class Region_Task {
    target:ExecuteManager
    task: Task
    multithread:number = 1
    task_count:number = 0
    cron:Array<CronJobState> = []
    job:Array<WorkState> = []
    runners: Array<Region_Subtask | undefined> = []
    jrunners: Array<Region_Job | undefined> = []
    
    constructor(target:ExecuteManager, task:Task){
        this.target = target
        this.task = task
    }
    
    public get project() : Project {
        return this.target.current_p!
    }
    public get parent() : Region_Project {
        return this.target.runner!
    }

    RUN = () => {
        /**
         * When it's the first iteration for this task
         */
        if(this.target.t_state == ExecuteState.NONE){
            this.target.t_state = ExecuteState.RUNNING
            this.multithread = this.task.multi ? this.get_task_multi_count(this.task) : 1
            this.task_count = this.get_task_state_count(this.task)
        }
        let allJobFinish = false
        const hasJob = this.task.jobs.length > 0

        /**
         * If a task has no job... we have to skip it...
         */
        if(!hasJob){
            // We end it gracefully.
            this.target.proxy?.executeTaskStart([this.task, this.task_count ])
            this.target.proxy?.executeTaskFinish(this.task)
            this.target.messager_log(`[Execute] Skip ! No job exists ${this.task.uuid}`)
            this.ExecuteTask_AllFinish(this.project, this.task)
            return
        }

        if(this.task.setupjob){
            allJobFinish = this.ExecuteTask_Setup(this.project, this.task, this.task_count)
        } else if (this.task.cronjob){
            allJobFinish = this.ExecuteTask_Cronjob(this.project, this.task, this.task_count)
        } else {
            allJobFinish = this.ExecuteTask_Single(this.project, this.task, this.task_count)
        }

        if (allJobFinish){
            this.ExecuteTask_AllFinish(this.project, this.task)
        }
    }

    /**
     * It will spawn amounts of cronjob and send the tasks for assigned node to execute them one by one
     * @param taskCount Should be equal to cronjob result
     * @returns Is finish executing
     */
    ExecuteTask_Cronjob(project:Project, task:Task, taskCount:number):boolean {
        let ns:Array<WebsocketPack> = this.get_idle_open()
        let allJobFinish = false

        /**
         * if current_cron length is zero\
         * this means the init process has not been run yet
         */
        if(this.cron.length == 0){
            // First time
            this.Init_CronContainer(taskCount)
            this.target.messager_log(`[Execute] TaskCount: ${taskCount}`)
        } else{
            // If disconnect or deleted...
            /**
             * We query all the cron state and get all the processing first and count it\
             * All we want is to filter out the node which is fully load\
             * So we can follow the multithread limit to send the mission
             */
            const worker = this.cron.filter(x => x.uuid != '').map(x => x.uuid)
            const counter:Array<[string, number]> = []
            worker.forEach(uuid => {
                const index = counter.findIndex(x => x[0] == uuid)
                if(index == -1) counter.push([uuid, 1])
                else counter[index][1] += 1
            })
            const fullLoadUUID = counter.filter(x => x[1] >= this.multithread).map(x => x[0])
            ns = ns.filter(x => !fullLoadUUID.includes(x.uuid))
        }
        
        if(this.check_all_cron_end()){
            allJobFinish = true
        }else{
            // Assign worker
            // Find the cron which is need to be execute by a node
            const needs = this.cron.filter(x => x.uuid == '' && x.work.filter(y => y.state != ExecuteState.FINISH && y.state != ExecuteState.ERROR).length > 0)
            const min = Math.min(needs.length, ns.length)
            for(let i = 0; i < min; i++){
                needs[i].uuid = ns[i].uuid
            }
            const single = this.cron.filter(x => x.uuid != '')
            // Execute
            for(var cronwork of single){
                const index = this.target.current_nodes.findIndex(x => x.uuid == cronwork.uuid)
                if(index != -1){
                    if(this.runners[cronwork.id] == undefined){
                        this.runners[cronwork.id] = new Region_Subtask(this.target, cronwork, this.target.current_nodes[index])
                    }
                    this.runners[cronwork.id]?.RUN()
                }
            }
        }
        return allJobFinish
    }

    /**
     * There will be no CronTask be called, it will go straight to the Execute job section
     * @param taskCount Must be 1
     * @returns Is finish executing
     */
    ExecuteTask_Single(project:Project, task:Task, taskCount:number):boolean {
        let allJobFinish = false
        let ns:Array<WebsocketPack> = []
        if(this.target.current_job.length > 0){
            // If disconnect or deleted...
            const last = this.target.current_nodes.find(x => x.uuid == this.job[0].uuid)
            if(last == undefined){
                ns = this.get_idle()
                this.job = []
            }else{
                ns = [last]
                if(ns[0].websocket.readyState != 1){
                    ns = this.get_idle()
                    this.job = []
                }
            }
        }else{
            // First time
            this.sync_local_para(this.target.localPara!)
            ns = this.get_idle()
            if(ns.length > 0) {
                this.target.proxy?.executeTaskStart([task, taskCount ])
                this.target.proxy?.executeSubtaskStart([task, 0, ns[0].uuid])
            }
        }

        if (ns.length > 0 && ns[0].websocket.readyState == 1 && this.check_socket_state(ns[0]) != ExecuteState.RUNNING)
        {
            if(this.check_single_end()){
                allJobFinish = true
            }else{
                if(this.job.length != task.jobs.length){
                    const job:Job = JSON.parse(JSON.stringify(task.jobs[this.job.length]))
                    const runtime = uuidv6()
                    this.job.push({
                        uuid: ns[0].uuid,
                        runtime: runtime,
                        state: ExecuteState.RUNNING,
                        job: job
                    })
                    job.index = 0
                    job.runtime_uuid = runtime
                    const r = new Region_Job(this.target, task, job, ns[0])
                    this.jrunners.push(r)
                    r.RUN()
                }
            }
        }
        return allJobFinish
    }

    ExecuteTask_Setup(project:Project, task:Task, taskCount:number):boolean {
        let ns:Array<WebsocketPack> = this.get_idle_open()
        let allJobFinish = false

        /**
         * if current_cron length is zero\
         * this means the init process has not been run yet
         */
        if(this.cron.length == 0){
            // First time
            this.Init_CronContainer(taskCount)
            this.target.messager_log(`[Execute] TaskCount: ${taskCount}`)
            for(let i = 0; i < this.cron.length; i++){
                this.cron[i].uuid = this.target.current_nodes[i].uuid
            }
        }
        
        if(this.check_all_cron_end()){
            allJobFinish = true
        }else{
            const single = this.cron.filter(x => x.uuid != '')
            // Execute
            for(var cronwork of single){
                const index = this.target.current_nodes.findIndex(x => x.uuid == cronwork.uuid)
                if(index != -1){
                    if(this.runners[cronwork.id] == undefined){
                        this.runners[cronwork.id] = new Region_Subtask(this.target, cronwork, this.target.current_nodes[index])
                    }
                    this.runners[cronwork.id]?.RUN()
                }
            }
        }
        return allJobFinish
    }

    ExecuteTask_AllFinish(project:Project, task:Task){
        this.target.proxy?.executeTaskFinish(task)
        this.target.messager_log(`[Execute] Task Finish ${task.uuid}`)
        const index = project.tasks.findIndex(x => x.uuid == task.uuid)
        if(index == project.tasks.length - 1){
            // Finish
            this.parent.runner = undefined
            this.target.t_state = ExecuteState.FINISH
        }else{
            // Next
            this.parent.runner = new Region_Task(this.target, project.tasks[index + 1])
            this.target.t_state = ExecuteState.NONE
        }
        this.job = []
        this.cron = []
    }

    Init_CronContainer = (taskCount:number) => {
        this.sync_local_para(this.target.localPara!)
        this.cron = []
        // Create the cronjob instance here
        for(let i = 0; i < taskCount; i++){
            const d:CronJobState = {
                id: i,
                uuid: "",
                work: this.task.jobs.map(x => ({
                    uuid: x.uuid,
                    runtime: '',
                    state: ExecuteState.NONE,
                    job: x
                }))
            }
            d.work.forEach((x, j) => x.runtime = uuidv6({}, undefined, i * taskCount + j))
            this.cron.push(d)
            this.runners.push(undefined)
        }
        this.target.proxy?.executeTaskStart([this.task, taskCount ])
    }

    //#region Uility
    /**
     * Filter out the idle and connection open nodes
     * @returns All idle and open connection nodes
     */
    get_idle = ():Array<WebsocketPack> => {
        return this.target.current_nodes.filter(x => this.check_socket_state(x) != ExecuteState.RUNNING && x.websocket.readyState == 1)
    }
    check_socket_state = (target:WebsocketPack) => {
        return target.current_job.length == 0 ? ExecuteState.NONE : ExecuteState.RUNNING
    }
    /**
     * This will let nodes update the database and lib
     * @param target 
     */
    sync_local_para = (target:Database) => {
        this.target.current_nodes.forEach(x => this.sync_para(target, x))
        this.target.proxy?.updateDatabase(target)
    }
    sync_para = (target:Database, source:WebsocketPack) => {
        const h:Header = {
            name: 'set_database',
            channel: this.target.uuid,
            data: target
        }
        const h2:Header = {
            name: 'set_libs',
            channel: this.target.uuid,
            data: this.target.libs
        }
        source.websocket.send(JSON.stringify(h))
        source.websocket.send(JSON.stringify(h2))
    }
    get_idle_open = ():Array<WebsocketPack> => {
        return this.target.current_nodes.filter(x => x.websocket.readyState == 1)
    }
    /**
     * Check all the cronjob is finish or not
     */
    check_all_cron_end = () => {
        return this.cron.filter(x => !this.check_cron_end(x)).length == 0
    }
    /**
     * Check input cronjob is finish or not
     * @param cron target cronjob instance
     */
    check_cron_end = (cron:CronJobState) => {
        return cron.work.filter(x => x.state == ExecuteState.RUNNING || x.state == ExecuteState.NONE).length == 0
    }
    /**
     * Check current single is finish or not
     */
    check_single_end = () => {
        if(this.task == undefined) return false
        return this.job.length == this.task.jobs.length && 
            this.job.filter(y => y.state == ExecuteState.RUNNING || y.state == ExecuteState.NONE).length == 0
    }
    /**
     * Get the multi-core setting\
     * Find in the database setting
     * @param key The multi-core-key
     * @returns 
     */
    get_task_multi_count = (t:Task):number => {
        const r = this.get_number(t.multiKey)
        return r == -1 ? 1 : r
    }
    /**
     * Get the task's cronjob count
     */
    get_task_state_count(t:Task){
        if(t.setupjob) return this.target.current_nodes.length
        if (t.cronjob) return this.get_number(t.cronjobKey)
        else return 1
    }

    get_number(key:string){
        return this.get_number_global(key, this.target.localPara)
    }

    get_number_global(key:string, localPara:Database | undefined){
        const e = this.database_update(localPara!)
        const a = e.replacePara(`%{${key}}%`)
        return Number(a)
    }

    database_update = (localPara:Database, n?:number) => {
        const e = new Util_Parser([...Util_Parser.to_keyvalue(localPara)])
        if(n != undefined){
            e.paras.push({ key: 'ck', value: n.toString() })
        }
        localPara.containers.forEach((c, index) => {
            if(c.type != DataType.Expression) return
            c.value = e.replacePara(`%{${c.meta}}%`)
            e.paras.find(p => p.key == c.name)!.value = c.value
        })
        return e
    }
    //#endregion
}