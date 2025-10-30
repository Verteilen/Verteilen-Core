// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { v6 as uuidv6 } from 'uuid'
import { 
    BusAnalysis,
    Execute_ExecuteManager,
    Execute_SocketManager, 
    ExecutePair, 
    ExecuteProxy, 
    ExecuteRecord, 
    ExecuteState, 
    FeedBack, 
    Header, 
    Job, 
    Messager, 
    NodeProxy, 
    Database, 
    Preference, 
    Project, 
    Record, 
    RENDER_UPDATETICK, 
    ShellFolder, 
    Single, 
    Task, 
    UtilServer_Console,
    WebsocketPack
} from "../interface"
import { PluginFeedback } from "./server"
import { MemoryData, RecordIOBase } from './io'
import { Util_Server_Console_Proxy } from '../util/console_handle'
import { Util_Server_Log_Proxy } from '../util/log_handle'

export interface BackendAction {
    memory: MemoryData
    GetPreference: (uuid?:string) => Preference
    Boradcasting?: (name:string, data:any) => void
}

export interface ServerDetailEvent {
    resource_start: (socket:any, uuid:string) => void
    resource_end: (socket:any, uuid:string) => void
    plugin_info: (socket:any, uuid:string) => void
    shell_enter: (socket:any, uuid:string, value:string) => void
    shell_open: (socket:any, uuid:string) => void
    shell_close: (socket:any, uuid:string) => void
    shell_folder: (socket:any, uuid:string, path:string) => void
    node_list: (socket:any, ) => void
    node_add: (socket:any, url:string, uuid:string) => void
    node_update: (socket:any, ) => void
    node_delete: (socket:any, uuid:string, reason?:string) => void
    console_list: (socket:any, ) => Array<ExecuteRecord> | undefined
    console_record: (socket:any, uuid:string) => void
    console_execute: (socket:any, uuid:string, type:number) => void
    console_stop: (socket:any, uuid:string) => void
    console_clean: (socket:any, uuid:string) => void
    console_skip: (socket:any, uuid:string, forward:boolean, type:number, state:ExecuteState) => void
    console_skip2: (socket:any, uuid:string, v:number) => void
    console_add: (socket:any, name:string, record:Record, uuid:string | undefined) => void
    console_update: (socket:any, ) => void
}

/**
 * **Server Inner-Work Handler**\
 * Include the core cluster logic here
 */
export class ServerDetail {
    execute_manager: Array<ExecutePair> = []
    console:UtilServer_Console.Util_Server_Console
    websocket_manager: Execute_SocketManager.WebsocketManager | undefined

    shellBind = new Map()
    loader: RecordIOBase | undefined
    backend: BackendAction
    feedback: PluginFeedback
    message:Messager
    messager_log:Function
    updatehandle: any
    /**
     * **A simple message queue**\
     * message, trace message, error message return data, for update
     */
    re: Array<any> = []

    constructor(
        loader: RecordIOBase | undefined,
        backend:BackendAction, 
        feedback:PluginFeedback, 
        message:Messager,
        messager_log:Function)
    {
        this.loader = loader
        this.backend = backend
        this.feedback = feedback
        this.message = message
        this.messager_log = messager_log
        const n:NodeProxy = {
            shellReply: this.shellReply,
            folderReply: this.folderReply
        }
        this.websocket_manager = new Execute_SocketManager.WebsocketManager(this.NewConnection, this.DisConnection, this.Analysis, messager_log, n)
        this.console = new UtilServer_Console.Util_Server_Console()
        this.updatehandle = setInterval(() => {
            this.re.push(...this.console_update())
        }, RENDER_UPDATETICK);
    }

    
    public get events() : ServerDetailEvent {
        return {
            resource_start: this.resource_start,
            resource_end: this.resource_end,
            plugin_info: this.plugin_info,
            shell_enter: this.shell_enter,
            shell_open: this.shell_open,
            shell_close: this.shell_close,
            shell_folder: this.shell_folder,
            node_list: this.node_list,
            node_add: this.node_add,
            node_update: this.node_update,
            node_delete: this.node_delete,
            console_list: this.console_list,
            console_record: this.console_record,
            console_execute: this.console_execute,
            console_stop: this.console_stop,
            console_clean: this.console_clean,
            console_skip: this.console_skip,
            console_skip2: this.console_skip2,
            console_add: this.console_add,
            console_update: this.console_update,
        }
    }
    

    NewConnection = (x:WebsocketPack) => {
        const p = {
            title: "New Connection Established",
            type: 'success',
            message: `${x.websocket.url} \n${x.uuid}`
        }
        if(this.feedback.electron){
            this.feedback.electron()?.send('makeToast', p)
        }
        if(this.feedback.socket && this.backend.Boradcasting){
            this.backend.Boradcasting('makeToast', p)
        }
        this.execute_manager.forEach(y => {
            y.manager!.NewConnection(x)
        })
    }

    DisConnection = (x:WebsocketPack) => {
        const p = {
            title: "Network Disconnected",
            type: 'error',
            message: `${x.websocket.url} \n${x.uuid}`
        }
        if(this.feedback.electron){
            this.feedback.electron()?.send('makeToast', p)
        }
        if(this.feedback.socket && this.backend.Boradcasting){
            this.backend.Boradcasting('makeToast', p)
        }
        this.execute_manager.forEach(y => {
            y.manager!.Disconnect(x)
        })
    }

    Analysis = (d:BusAnalysis) => {
        this.execute_manager.forEach(x => x.manager!.Analysis(JSON.parse(JSON.stringify(d))))   
    }

    /**
     * **Shell Reply Message Event**\
     * Called by the client node
     * @param data Content
     * @param p Client node source
     */
    shellReply = (data:Single, p?:WebsocketPack) => {
        if(this.feedback.electron){
            this.feedback.electron()?.send("shellReply", data)
        }
        if(this.feedback.socket){
            if(p == undefined) return
            if(this.shellBind.has(p.uuid)){
                const k:Array<any> = this.shellBind.get(p.uuid)
                k.forEach(x => {
                    const h:Header = { name: "shellReply", data: data }
                    x.send(JSON.stringify(h))
                })
            }
        }
    }
    /**
     * **Shell Folder Location Event**\
     * Called by the client node
     * @param data Content
     * @param p Client node source
     */
    folderReply = (data:ShellFolder, p?:WebsocketPack) => {
        if(this.feedback.electron){
            this.feedback.electron()?.send("folderReply", data)
        }
        if(this.feedback.socket){
            if(p == undefined) return
            if(this.shellBind.has(p.uuid)){
                const k:Array<any> = this.shellBind.get(p.uuid)
                k.forEach(x => {
                    const h:Header = {
                        name: "folderReply", data: data
                    }
                    x.send(JSON.stringify(h))  
                })
            }
        }
    }

    console_update = () => {
        const re:Array<any> = []
        this.execute_manager.forEach(x => {
            if(x.record!.running && !x.record!.stop){
                try {
                    x.manager!.Update()
                }catch(err:any){
                    x.record!.stop = true
                    console.log(err)
                    re.push({
                        code: 400,
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    })
                }
            }
            if(x.record!.stop){
                if(x.manager!.jobstack == 0){
                    x.record!.running = false
                }
            }
            if(x.record!.command.length > 0){
                const p:Array<any> = x.record!.command.shift()!
                if(p[0] == 'clean') this.console_clean(undefined, x.record!.uuid)
                else if (p[0] == 'stop') this.console_stop(undefined, x.record!.uuid)
                else if (p[0] == 'skip') this.console_skip(undefined, x.record!.uuid, p[1], p[2])
                else if (p[0] == 'execute') this.console_execute(undefined, x.record!.uuid, p[1])
            }
        })
        if(this.loader != undefined){
            const logss = this.backend.memory.logs.filter(x => x.dirty && x.output)
            for(var x of logss){
                x.dirty = false
                const filename = this.loader.join(this.loader.root, "log", `${x.uuid}.json`)
                this.loader.write_string(filename, JSON.stringify(x, null, 4))
            }
        }
        return re
    }


//#region For Backend
    resource_start = (socket:any, uuid:string) => {
        const p = this.websocket_manager!.targets.find(x => x.uuid == uuid)
        const d:Header = { name: 'resource_start', data: 0 }
        p?.websocket.send(JSON.stringify(d))
    }

    resource_end = (socket:any, uuid:string) => {
        const p = this.websocket_manager!.targets.find(x => x.uuid == uuid)
        const d:Header = { name: 'resource_end', data: 0 }
        p?.websocket.send(JSON.stringify(d))
    }

    plugin_info = (socket:any, uuid:string) => {
        const p = this.websocket_manager!.targets.find(x => x.uuid == uuid)
        const d:Header = { name: 'plugin_info', data: 0 }
        p?.websocket.send(JSON.stringify(d))
    }

    shell_enter = (socket:any, uuid: string, value:string) => {
        this.websocket_manager!.shell_enter(uuid, value)
    }
    shell_open = (socket:any, uuid: string) => {
        this.websocket_manager!.shell_open(uuid)
        if(this.feedback.socket){
            if(this.shellBind.has(uuid)){
                this.shellBind.get(uuid).push(this.feedback.socket)
            }else{
                this.shellBind.set(uuid, [this.feedback.socket])
            }
        }
    }
    shell_close = (socket:any, uuid: string) => {
        this.websocket_manager!.shell_close(uuid)
        if(this.feedback.socket){
            if(this.shellBind.has(uuid)){
                const p:Array<any> = this.shellBind.get(uuid)
                const index = p.findIndex(x => x == this.feedback.socket)
                if(index != -1) p.splice(index, 1)
                this.shellBind.set(uuid, p)
            }
        }
    }
    shell_folder = (socket:any, uuid: string, path:string) => {
        this.websocket_manager!.shell_folder(uuid, path)
    }

    node_list = (socket:any) => {
        const p = this.websocket_manager?.targets
        if(this.feedback.socket != undefined){
            const h:Header = {
                name: "node_list-feedback",
                data: this.websocket_manager?.targets
            }
            this.feedback.socket(JSON.stringify(h))   
        }
        return p
    }
    node_add = (socket:any, url:string, id:string) => {
        const p = this.websocket_manager!.server_start(url, id)
        if(this.feedback.socket != undefined){
            const h:Header = {
                name: "node_add-feedback",
                data: p
            }
            this.feedback.socket(JSON.stringify(h))
        }
    }
    node_update = (socket:any) => {
        const p = this.websocket_manager?.server_update()
        if(this.feedback.socket != undefined){
            const h:Header = {
                name: "node_update-feedback",
                data: [p]
            }
            this.feedback.socket(JSON.stringify(h))
        }
        return p
    }
    node_delete = (socket:any, uuid:string, reason?:string) => {
        this.websocket_manager!.server_stop(uuid, reason)
    }
    console_list = (socket:any) => {
        if(this.feedback.electron){
            return this.execute_manager.map(x => x.record).filter(x => x != undefined)
        }
        if(this.feedback.socket){
            const h:Header = {
                name: "console_list-feedback",
                data: this.execute_manager.map(x => x.record)
            }
            this.feedback.socket(JSON.stringify(h))
        }
    }
    console_record = (socket:any, uuid:string) => {
        const r = this.execute_manager.find(x => x.record?.uuid == uuid)?.record
        if(socket != undefined){
            const h:Header = {
                name: "console_record-feedback",
                data: JSON.stringify(r)
            }
            socket.send(JSON.stringify(h))
        }
        return JSON.stringify(r)
    }
    console_execute = (socket:any, uuid:string, type:number) => {
        const target = this.execute_manager.find(x => x.record!.uuid == uuid)
        if(target == undefined) return
        target.record!.process_type = type
        target.record!.running = true
        target.record!.stop = false
        target.manager!.first = true
    }
    console_stop = (socket:any, uuid:string) => {
        const target = this.execute_manager.find(x => x.record!.uuid == uuid)
        if(target == undefined) return
        target.record!.stop = true
        target.manager!.Stop()
    }
    console_add = (socket:any, name:string, record:Record, uuid:string | undefined) => {
        record.projects.forEach(x => x.uuid = uuidv6())
        const em:Execute_ExecuteManager.ExecuteManager = new Execute_ExecuteManager.ExecuteManager(
            name,
            this.websocket_manager!, 
            this.message, 
            JSON.parse(JSON.stringify(record)),
        )
        const er:ExecuteRecord = {
            ...record,
            uuid: em.uuid,
            name: name,
            running: false,
            stop: true,
            process_type: -1,
            useCron: false,
            para: undefined,
            command: [],
            project: '',
            task: '',
            project_index: -1,
            task_index: -1,
            project_state: [],
            task_state: [],
            task_detail: [],
        }
        em.libs = { libs: this.backend.memory.libs }
        
        const p:ExecutePair = { manager: em, record: er }
        const uscp:Util_Server_Console_Proxy = new Util_Server_Console_Proxy(p)
        const uslp:Util_Server_Log_Proxy = new Util_Server_Log_Proxy(p, { logs: this.backend.memory.logs }, this.backend.GetPreference(uuid)!)
        em.proxy = this.CombineProxy([uscp.execute_proxy, uslp.execute_proxy])
        const r = this.console.receivedPack(p, record)
        if(r) this.execute_manager.push(p)
        
        if(socket != undefined){
            const h:Header = {
                name: "console_add-feedback",
                data: r ? er : undefined
            }
            socket.send(JSON.stringify(h))
        }
        if(this.feedback.electron) return r ? er : undefined
    }
    console_update_call = () => {
        const p = this.re
        this.re = []
        if(this.feedback.socket){
            const h:Header = {
                name: "console_update-feedback",
                data: JSON.stringify(p)
            }
            this.feedback.socket(JSON.stringify(h))
        }
    }
    console_clean = (socket:any, uuid:string) => {
        const target = this.execute_manager.find(x => x.record!.uuid == uuid)
        if(target == undefined) return
        target.manager!.Clean()
        target.record!.projects = []
        target.record!.project = ""
        target.record!.task = ""
        target.record!.project_index = -1
        target.record!.task_index = -1
        target.record!.project_state = []
        target.record!.task_state = []
        target.record!.task_detail = []
        target.manager!.Release()
        const index = this.execute_manager.findIndex(x => x.record!.uuid == uuid)
        this.execute_manager.splice(index, 1)
    }
    console_skip = (socket:any, uuid:string, forward:boolean, type:number, state:ExecuteState = ExecuteState.FINISH) => {
        const target = this.execute_manager.find(x => x.record!.uuid == uuid)
        if(target == undefined) return
        if(type == 0){
            // Project
            target.record!.project_state[target.record!.project_index].state = forward ? (state != undefined ? state : ExecuteState.FINISH) : ExecuteState.NONE
            target.record!.project_index += forward ? 1 : -1
            if(target.record!.project_index == target.record!.projects.length) {
                target.record!.project_index = -1
                this.console_clean(socket, uuid)
            }
            else {
                if(target.record!.project_index < 0){
                    target.record!.project_index = 0
                }
                target.record!.task_state = target.record!.projects[target.record!.project_index].tasks.map(x => {
                    return {
                        uuid: x.uuid,
                        state: ExecuteState.NONE
                    }
                })
                target.record!.task_detail = []
                const p = target.record!.projects[target.record!.project_index]
                const t = p.tasks[target.record!.task_index]
                const count = target.manager!.get_task_state_count(t)
                for(let i = 0; i < count; i++){
                    target.record!.task_detail.push({
                        index: i,
                        node: "",
                        message: [],
                        state: ExecuteState.NONE
                    })
                }
                const index = forward ? target.manager!.SkipProject() : target.manager!.PreviousProject()
                console.log("%s project, index: %d, next count: %d", forward ? "Skip" : "Previous", index, count)
            }
        }else if (type == 1){
            const begining = target.record!.task_state[0].state == ExecuteState.NONE
            // Task
            if(!begining && forward) target.record!.task_state[target.record!.task_index].state = state != undefined ? state : ExecuteState.FINISH
            if(!forward) target.record!.task_state[target.record!.task_index].state = ExecuteState.NONE
            target.record!.task_index += forward ? 1 : -1
            if(target.record!.task_index == target.record!.task_state.length) {
                this.console_skip(socket, uuid, true, 0)
            }else{
                if(!begining && forward) target.record!.task_state[target.record!.task_index].state = state != undefined ? state : ExecuteState.FINISH
                else if (!forward) target.record!.task_state[target.record!.task_index].state = ExecuteState.RUNNING
                target.record!.task_detail = []
                const p = target.record!.projects[target.record!.project_index]
                const t = p.tasks[target.record!.task_index]
                const count = target.manager!.get_task_state_count(t)
                for(let i = 0; i < count; i++){
                    target.record!.task_detail.push({
                        index: i,
                        node: "",
                        message: [],
                        state: ExecuteState.NONE
                    })
                }
                const index = forward ? target.manager!.SkipTask() : target.manager!.PreviousTask()
                console.log("Skip task, index: %d, next count: %d", index, count)
            }
        }
    }
    console_skip2 = (socket:any, uuid:string, v:number) => {
        const target = this.execute_manager.find(x => x.record!.uuid == uuid)
        if(target == undefined) return
        const index = target.manager!.SkipSubTask(v)
        if(index < 0) {
            console.error("Skip step failed: ", index)
            return
        }
        for(let i = 0; i < index; i++){
            target.record!.task_detail[i].state = ExecuteState.FINISH
        }
        console.log("Skip task", index)
    }
//#endregion
    CombineProxy = (eps:Array<ExecuteProxy>) => {
        const p:ExecuteProxy = {
            executeProjectStart: (data:[Project, number]):void => { eps.forEach(x => x.executeProjectStart(JSON.parse(JSON.stringify(data)))) },
            executeProjectFinish: (data:[Project, number]):void => { eps.forEach(x => x.executeProjectFinish(JSON.parse(JSON.stringify(data)))) },
            executeTaskStart: (data:[Task, number]):void => { eps.forEach(x => x.executeTaskStart(JSON.parse(JSON.stringify(data)))) },
            executeTaskFinish: (data:Task):void => { eps.forEach(x => x.executeTaskFinish(JSON.parse(JSON.stringify(data)))) },
            executeSubtaskStart: (data:[Task, number, string]):void => { eps.forEach(x => x.executeSubtaskStart(JSON.parse(JSON.stringify(data)))) },
            executeSubtaskUpdate: (data:[Task, number, string, ExecuteState]):void => { eps.forEach(x => x.executeSubtaskUpdate(JSON.parse(JSON.stringify(data)))) },
            executeSubtaskFinish: (data:[Task, number, string]):void => { eps.forEach(x => x.executeSubtaskFinish(JSON.parse(JSON.stringify(data)))) },
            executeJobStart: (data:[Job, number, string]):void => { eps.forEach(x => x.executeJobStart(JSON.parse(JSON.stringify(data)))) },
            executeJobFinish: (data:[Job, number, string, number]):void => { eps.forEach(x => x.executeJobFinish(JSON.parse(JSON.stringify(data)))) },
            feedbackMessage: (data:FeedBack):void => { eps.forEach(x => x.feedbackMessage(JSON.parse(JSON.stringify(data)))) },
            updateDatabase: (data:Database):void => { eps.forEach(x => x.updateDatabase(JSON.parse(JSON.stringify(data)))) },
        }
        return p
    }
}