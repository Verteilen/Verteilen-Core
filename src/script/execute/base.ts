// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { v6 as uuid6 } from 'uuid';
import { CronJobState, DataType, ExecuteProxy, ExecuteState, Header, Job, JobCategory, JobType, JobType2, Libraries, Messager, Database, Project, Record, Task, WebsocketPack, WorkState } from "../../interface";
import { WebsocketManager } from "../socket_manager";
import { Util_Parser } from './util_parser';
import { Region_Project } from './region_project';

/**
 * The base class of task scheduler, contain some basic funcationality
 */
export class ExecuteManager_Base {
    /**
     * The task scheduler UUID
     */
    uuid: string
    name: string
    /**
     * Register record\
     * This record holds the project data you want to process
     */
    record: Record
    /**
     * The list of projects you want to process\
     * Each project UUID should be unique by now\
     * Prevent findIndex error, When there is repeat project source
     */
    current_projects:Array<Project> = []
    /**
     * The connection nodes list
     */
    current_nodes:Array<WebsocketPack> = []
    /**
     * * NONE: Not yet start
     * * RUNNING: In the processing stage
     * * FINISH: Everything is finish processing
     */
    state:ExecuteState = ExecuteState.NONE
    /**
     * * NONE: Not yet start
     * * RUNNING: In the processing stage
     * * FINISH: Everything is finish processing
     */
    t_state:ExecuteState = ExecuteState.NONE 
    jobstack = 0
    first = false
    libs:Libraries | undefined = undefined
    proxy:ExecuteProxy | undefined = undefined
    localPara: Database | undefined = undefined

    websocket_manager:WebsocketManager
    messager_log:Messager
    runner:Region_Project | undefined

    constructor(_name:string, _websocket_manager:WebsocketManager, _messager_log:Messager, _record:Record) {
        this.name = _name
        this.uuid = uuid6()
        this.record = _record
        this.websocket_manager = _websocket_manager
        this.messager_log = _messager_log
    }

    /**
     * Current select project\
     * If it's undefined, it means:
     * * It's finish the current project
     * * It has not start processing yet
     */
    public get current_p() : Project | undefined {
        return this.runner?.project
    }
    /**
     * Current select task\
     * If it's undefined, it means:
     * * It's finish the current task
     * * It has not start processing yet
     */
    public get current_t() : Task | undefined {
        return this.runner?.runner?.task
    }
    /**
     * Current execute task use multithread setting
     */
    public get current_multithread() : number {
        return this.runner?.runner?.multithread ?? 1
    }
    public get current_task_count() : number {
        return this.runner?.runner?.task_count ?? 0
    }
    /**
     * Cron job type execute record
     */
    public get current_cron() : Array<CronJobState> {
        return this.runner?.runner?.cron ?? []
    }
    /**
     * Single job type execute record
     */
    public get current_job() : Array<WorkState> {
        return this.runner?.runner?.job ?? []
    }
    

    /**
     * This will let nodes update the database and lib
     * @param target 
     */
    protected sync_local_para = (target:Database) => {
        this.current_nodes.forEach(x => this.sync_para(target, x))
        this.proxy?.updateDatabase(target)
    }

    //#region Helper
    protected sync_para = (target:Database, source:WebsocketPack) => {
        const h:Header = {
            name: 'set_database',
            channel: this.uuid,
            data: target
        }
        const h2:Header = {
            name: 'set_libs',
            channel: this.uuid,
            data: this.libs
        }
        source.websocket.send(JSON.stringify(h))
        source.websocket.send(JSON.stringify(h2))
    }
    protected release = (source:WebsocketPack) => {
        const h:Header = {
            name: 'release',
            channel: this.uuid,
            data: 0
        }
        source.websocket.send(JSON.stringify(h))
    }
    /**
     * Check all the cronjob is finish or not
     */
    protected check_all_cron_end = () => {
        return this.current_cron.filter(x => !this.check_cron_end(x)).length == 0
    }
    /**
     * Check input cronjob is finish or not
     * @param cron target cronjob instance
     */
    protected check_cron_end = (cron:CronJobState) => {
        return cron.work.filter(x => x.state == ExecuteState.RUNNING || x.state == ExecuteState.NONE).length == 0
    }
    /**
     * Check current single is finish or not
     */
    protected check_single_end = () => {
        if(this.current_t == undefined) return false
        return this.current_job.length == this.current_t.jobs.length && 
            this.current_job.filter(y => y.state == ExecuteState.RUNNING || y.state == ExecuteState.NONE).length == 0
    }
    //#endregion


    //#region Utility
    /**
     * Project format checking
     * @param projects 
     * @returns 
     */
    protected validation = (projects:Array<Project>):boolean => {
        if (this.websocket_manager.targets.length == 0) {
            this.messager_log(`[Execute State] The execute node does not exists`)
            return false
        }
        projects.forEach(x => {
            x.tasks.forEach(t => {
                if(t.cronjob){
                    const index = x.database?.containers.findIndex(x => x.name == t.cronjobKey && x.type == DataType.Number) ?? -1
                    if(index == -1){
                        this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.cronjobKey}\"`)
                        this.messager_log(`[Execute:CronJob] Cron task registerd key not found`)
                        return false
                    }
                    else if (x.database?.containers[index].value == 0){
                        this.messager_log(`[Execute:CronJob] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.cronjobKey}\"`)
                        this.messager_log(`[Execute:CronJob] Cron task value must bigger than 0`)
                        return false
                    }
                }
                if(t.cronjob && t.multi){
                    const index = x.database?.containers.findIndex(x => x.name == t.multiKey && x.type == DataType.Number) ?? -1
                    if(index == -1){
                        this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.multiKey}\"`)
                        this.messager_log(`[Execute:Multi] Cron task registerd key not found`)
                        return false
                    }
                    else if (x.database?.containers[index].value == 0){
                        this.messager_log(`[Execute:Multi] Project ${x.title} (${x.uuid}), Task ${t.title} (${t.uuid}), Has unknoed database: \"${t.multiKey}\"`)
                        this.messager_log(`[Execute:Multi] Cron task value must bigger than 0`)
                        return false
                    }
                }
            })
        })
        return true
    }
    protected filter_lib = (projects:Array<Project>, lib:Libraries):Libraries => {
        const r:Libraries = { libs: [] }
        projects.forEach(x => {
            x.tasks.forEach(y => {
                y.jobs.forEach(z => {
                    let code = -1
                    if((z.category == JobCategory.Execution && z.type == JobType.JAVASCRIPT) || (z.category == JobCategory.Condition && z.type == JobType2.JAVASCRIPT)) code = 0
                    if(code == -1) return
                    z.string_args.forEach(s1 => {
                        const target = lib.libs.find(l => l.name == s1)
                        if(target != undefined) r.libs.push(target)
                    })
                })
            })
        })
        return JSON.parse(JSON.stringify(r))
    }
    /**
     * Get the multi-core setting\
     * Find in the database setting
     * @param key The multi-core-key
     * @returns 
     */
    protected get_task_multi_count = (t:Task):number => {
        const r = this.get_number(t.multiKey)
        return r == -1 ? 1 : r
    }
    /**
     * Get the task's cronjob count
     */
    public get_task_state_count(t:Task){
        if(t.setupjob) return this.current_nodes.length
        if (t.cronjob) return this.get_number(t.cronjobKey)
        else return 1
    }

    /**
     * Find the number in the database, this include the expression phrasing
     * @param key The name key
     * @param p Project instance
     * @returns The value, if key cannot be found, it will return -1
     */
    protected get_number(key:string){
        return ExecuteManager_Base.get_number_global(key, this.localPara)
    }

    static get_number_global(key:string, localPara:Database | undefined){
        const e = ExecuteManager_Base.database_update(localPara!)
        const a = e.replacePara(`%{${key}}%`)
        return Number(a)
    }

    /**
     * Remove dups item in the list
     * @param arr 
     * @returns 
     */
    protected removeDups = (arr: any[]): any[] => {
        return [...new Set(arr)];
    }

    /**
     * Filter out the idle and connection open nodes
     * @returns All idle and open connection nodes
     */
    protected get_idle = ():Array<WebsocketPack> => {
        return this.current_nodes.filter(x => this.check_socket_state(x) != ExecuteState.RUNNING && x.websocket.readyState == 1)
    }
    /**
     * Filter out the connection open nodes
     * @returns All open connection nodes
     */
    protected get_idle_open = ():Array<WebsocketPack> => {
        return this.current_nodes.filter(x => x.websocket.readyState == 1)
    }

    protected check_socket_state = (target:WebsocketPack) => {
        return target.current_job.length == 0 ? ExecuteState.NONE : ExecuteState.RUNNING
    }

    static string_args_transform = (task:Task, job:Job, messager_log:Messager, localPara:Database, n:number) => {
        let e = ExecuteManager_Base.database_update(localPara, n)
        e = ExecuteManager_Base.property_update(task, e)

        for(let i = 0; i < job.string_args.length; i++){
            const b = job.string_args[i]
            if(b == null || b == undefined || b.length == 0) continue
            if(job.category == JobCategory.Execution && job.type == JobType.CREATE_FILE && i == 1) continue
            job.string_args[i] = e.replacePara(job.string_args[i])
            //messager_log(`String replace: "${b}" -> "${job.string_args[i]}"`)
        }
    }

    static property_update = (task:Task, e:Util_Parser) => {
        for(let j = 0; j < task.properties.length; j++){
            const target = task.properties[j];
            const times = target.deep ? target.deep : 1
            let act:any = target.expression
            for(let k = 0; k < times; k++){
                act = e.replacePara(`%{${act}}%`)
            }
            e.paras.push({ key: task.properties[j].name, value: act})
        }
        return e
    }

    static database_update = (localPara:Database, n?:number) => {
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