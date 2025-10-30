// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { Execute_ConsoleServerManager, Header, PluginPageData } from "../interface";
import { ServerDetail } from "./detail";
import { CreateRecordMemoryLoader, MemoryData, RecordIOBase, RecordLoader } from "./io";
import { Project_Module } from "./module/project";
import { EventObserver } from "./observer";
import { PluginLoader } from "./plugin";

export type Caller_Electron_Send = (channel: string, ...args: any[]) => void
export interface Caller_Electron {
    send: Caller_Electron_Send
}
export type Caller_Socket = (data: any) => void
export type TypeMap = { [key:string]:Function }

/**
 * **Backend Feedback**\
 * The config that which {@link ServerDetail} require to use\
 * Depends on what input value it have, it could have different type of response
 */
export interface PluginFeedback {
    /**
     * Eletron feedback
     */
    electron:(() => (Caller_Electron | undefined)) | undefined
    /**
     * WebServer feedback
     */
    socket:Caller_Socket | undefined
}

/**
 * **Compute Server**\
 * The task schedule server
 */
export class Server {
    manager:Array<Execute_ConsoleServerManager.ConsoleServerManager> = []
    memory: MemoryData = {
        projects: [],
        tasks: [],
        jobs: [],
        database: [],
        nodes: [],
        logs: [],
        libs: [],
        user: [],
    }
    plugin: PluginPageData = {
        templates: [],
        plugins: [],
    }
    io:RecordIOBase | undefined = undefined
    loader:RecordLoader | EventObserver | undefined = undefined
    plugin_loader: PluginLoader | undefined = undefined
    memory_loader:RecordLoader
    detail: ServerDetail | undefined
    
    module_project: Project_Module

    constructor() {
        this.memory_loader = CreateRecordMemoryLoader(this.memory)
        this.module_project = new Project_Module(this)
    }

    public get current_loader() : RecordLoader {
        if(this.loader) return this.loader
        return this.memory_loader
    }

    /**
     * **Data: Disk -> Memory**\
     * Load every type of data from disk, store them into memory
     */
    LoadFromDisk = ():Promise<Array<Array<string>>> => {
        const ts = [
            this.current_loader.project.load_all(),
            this.current_loader.task.load_all(),
            this.current_loader.job.load_all(),
            this.current_loader.database.load_all(),
            this.current_loader.node.load_all(),
            this.current_loader.log.load_all(),
            this.current_loader.lib.load_all(),
            this.current_loader.user.load_all(),
        ]
        return Promise.all(ts)
    }
    /**
     * **Broadcast To Console**\
     * Send messages to all console server
     * @param name channel
     * @param data raw data
     */
    Boradcasting = (name:string, data:any) => {
        const d:Header = {
            name: name,
            data: data
        }
        this.manager.forEach(x => {
            x.ws.send(JSON.stringify(d))
        })
    }
}