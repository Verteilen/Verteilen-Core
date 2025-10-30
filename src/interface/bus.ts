// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Event bus related type and interface
 */
import { Job, Database, Project, Task } from "./base"
import { ExecuteState } from "./enum"
import { ExecutionLog, Log, Preference } from "./record"
import { Login } from "./server"
import { FeedBack, Header, Setter, ShellFolder, Single, WebsocketPack } from "./struct"
import { DatabaseTable, NodeTable, ProjectTable } from "./table"
import { ToastData } from "./ui"

type Handler<T = unknown> = (event: T) => void
export type Messager = (msg:string, tag?:string) => void
export type Messager_log = (msg:string, tag?:string, meta?:string) => void

/**
 * **Server Received Node Client Packet Data Structure**\
 * A standard format for received data format from node client
 */
export interface BusAnalysis {
    /**
     * **Header Name**\
     * The string can be found in {@link h.name} as well\
     * We put it here for convenient
     */
    name:string
    /**
     * **Header Data**\
     * The data packet content
     */
    h:Header
    /**
     * **Received Weboscket Instance**\
     * Client node websocket assign by analyzer
     */
    c:WebsocketPack | undefined
}

/**
 * **Websocket Data Format: Rename**
 */
export interface Rename {
    oldname: string
    newname: string
}
/**
 * **Websocket Data Format: Raw Data Send**
 */
export interface RawSend {
    name: string
    token?: string
    data: any
}

export interface EmitterProxy<T> {
    on<Key extends keyof T> (type: T, handler: Handler<T[Key]>): void
    off<Key extends keyof T> (type: T, handler: Handler<T[Key]>): void
    emit<Key extends keyof T> (type: T, handler: T[Key]): void
}

/**
 * **Execute Event Proxy**\
 * The middleware for task scheduler worker with singal sender
 */
export interface ExecuteProxy {
    executeProjectStart: (data:[Project, number]) => void
    executeProjectFinish: (data:[Project, number]) => void
    /**
     * * 0.Task: Task instance
     * * 1.number: The amounts of subtask need
     */
    executeTaskStart: (data:[Task, number]) => void
    executeTaskFinish: (data:Task) => void
    /**
     * * 0.Task: Task instance
     * * 1.number: Subtask index
     * * 2.string: node uuid
     */
    executeSubtaskStart: (data:[Task, number, string]) => void
    executeSubtaskUpdate: (data:[Task, number, string, ExecuteState]) => void
    /**
     * * 0.Task: Task instance
     * * 1.number: Subtask index
     * * 2.string: node uuid
     */
    executeSubtaskFinish: (data:[Task, number, string]) => void
    /**
     * * 0.Job: Job instance
     * * 1.number: Subtask index
     * * 2.string: node uuid
     */
    executeJobStart: (data:[Job, number, string]) => void
    /**
     * * 0.Job: Job instance
     * * 1.number: Subtask index
     * * 2.string: node uuid
     * * 3.string: meta string
     */
    executeJobFinish: (data:[Job, number, string, number]) => void
    feedbackMessage: (data:FeedBack) => void
    updateDatabase: (data:Database) => void
}

/**
 * **Node Reply handler**\
 * Handle the message received from node\
 * In this case, for shell only type of action
 */
export interface NodeProxy { 
    shellReply: (data:Single, w?:WebsocketPack) => void
    folderReply: (data:ShellFolder, w?:WebsocketPack) => void
}

/**
 * **Vue Event Bus Type**\
 * Emitter events container for Primary use
 */
export type BusType = {
    /**
     * Setting dialog popup event
     */
    setting: void
    /**
     * Guide link click event
     */
    guide: void
    makeToast: ToastData
    modeSelect: boolean
    createProject: void
    updateProject: void
    recoverProject: ProjectTable
    recoverDatabase: DatabaseTable
    relogin: void
    loginGuest: void
    login: Login
    logout: void
    updateTask: void
    updateJob: void
    updateDatabase: void
    selectDatabase: string
    updateLocate: void
    updateNode: Array<NodeTable>
    updateCurrent: ExecutionLog,
    updateLog: Log
    updateHandle: void
    slowUpdateHandle: void
    shellReply: Single
    folderReply: ShellFolder
    feedbackMessage: FeedBack
    savePreference: Preference

    renameScript: Rename
    deleteScript: string

    analysis: BusAnalysis
    debuglog: string
    hotkey: string
    isExpress: boolean

    delay: Setter
    system: Setter
}

/**
 * Emitter events container for Web client
 */
export type BusWebType = {
    raw_send: RawSend

    locate: string
    load_preference: string
    load_cookie: void
    get_token: string
}