import { Execute_ConsoleServerManager, Header, PluginPageData } from "../interface";
import { ServerDetail } from "./detail";
import { CreateRecordMemoryLoader, MemoryData, RecordIOBase, RecordLoader } from "./io";
import { PluginLoader } from "./plugin";

export type Caller_Electron_Send = (channel: string, ...args: any[]) => void
export interface Caller_Electron {
    send: Caller_Electron_Send
}
export type Caller_Socket = (data: any) => void
export type TypeMap = { [key:string]:Function }

export interface PluginFeedback {
    electron:(() => (Caller_Electron | undefined)) | undefined
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
    loader:RecordLoader | undefined = undefined
    plugin_loader: PluginLoader | undefined = undefined
    memory_loader:RecordLoader
    detail: ServerDetail | undefined

    constructor() {
        this.memory_loader = CreateRecordMemoryLoader(this.memory)
    }

    public get current_loader() : RecordLoader {
        if(this.loader) return this.loader
        return this.memory_loader
    }

    LoadFromDisk = ():Promise<Array<Array<string>>> => {
        const ts = [
            this.current_loader.project.load_all(),
            this.current_loader.database.load_all(),
            this.current_loader.node.load_all(),
            this.current_loader.log.load_all(),
            this.current_loader.lib.load_all(),
            this.current_loader.user.load_all(),
        ]
        return Promise.all(ts)
    }

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