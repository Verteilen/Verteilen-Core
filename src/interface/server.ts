// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Express server related data structure
 */
import { MemoryData } from "../server"
import { DataHeader, Shareable } from "./base"
import { ExecuteState } from "./enum"
import { ExecuteRecord, Record } from "./log"
import { Preference } from "./record"
import { v6 as uuidv6 } from 'uuid'

/**
 * **Backend Interface**\
 * The backend object must contain some utility functions\
 * In order to make detail worker works
 */
export interface BackendAction {
    /**
     * **Memory Data**\
     * The server instance data memory
     */
    memory: MemoryData
    /**
     * The getter for the preference
     * @param uuid User UUID
     * @returns Preference instance
     */
    GetPreference: (uuid?:string) => Preference
    /**
     * Boradcasting to all console admin\
     * This will form a package to send to all console members
     * @param name Key
     * @param data Data
     */
    Broadcasting?: (name:string, data:any) => void
}

/**
 * The interface object for the detail worker
 */
export interface ServerDetailEvent {
    /**
     * Tell client to start given resource info to computed server
     * @param socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    resource_start: (socket:any, uuid:string) => void
    /**
     * Tell client to stop given resource info to computed server
     * @param socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    resource_end: (socket:any, uuid:string) => void
    /**
     * Let client send a plugin feedback to computed server
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    plugin_info: (socket:any, uuid:string) => void
    /**
     * Handle shell input value
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     * @param value String value
     * @returns 
     */
    shell_enter: (socket:any, uuid:string, value:string) => void
    /**
     * Create the shell session\
     * Computed client will create a shell object to handle computed server's shell request
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    shell_open: (socket:any, uuid:string) => void
    /**
     * Close the shell session\
     * Computed client will destroy target shell object to handle computed server's shell request
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    shell_close: (socket:any, uuid:string) => void
    /**
     * Open different folder in shell session
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     * @param path Folder path
     */
    shell_folder: (socket:any, uuid:string, path:string) => void
    /**
     * Get List of WebsocketPack from the computed server
     * @param socket socket Console admin socket source
     */
    node_list: (socket:any, ) => void
    /**
     * Trying the create new computed node connection
     * @param socket socket Console admin socket source
     * @param url Address
     * @param uuid Apply UUID
     */
    node_add: (socket:any, url:string, uuid:string) => void
    /**
     * Update the node information
     * @param socket socket Console admin socket source
     */
    node_update: (socket:any) => void
    /**
     * Delete computed node connection instance
     * @param socket socket Console admin socket source
     * @param uuid Target UUID
     * @param reason Disconnect reason if connection is open currently
     */
    node_delete: (socket:any, uuid:string, reason?:string) => void
    /**
     * Get the list of execution thread
     * @param socket socket Console admin socket source
     * @returns The execution thread list
     */
    console_list: (socket:any) => Array<ExecuteRecord> | undefined
    /**
     * 
     * @param socket socket Console admin socket source
     * @param uuid 
     * @returns 
     */
    console_record: (socket:any, uuid:string) => void
    /**
     * Run command type to a execution thead
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread UUID
     * @param type
     * * 0: All Projects through
     * * 1: Single project through
     * * 2: SIngle task through
     * @returns 
     */
    console_execute: (socket:any, uuid:string, type:number) => void
    /**
     * Stop command for execution thread
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread UUID
     */
    console_stop: (socket:any, uuid:string) => void
    /**
     * Remove execution thread
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread UUID
     */
    console_clean: (socket:any, uuid:string) => void
    /**
     * Action for execute thread: Skip project or task
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread
     * @param forward Skip To forward or backward
     * @param type 0: Project, 1: Task
     * @param state Apply the state to the previous container
     * @returns 
     */
    console_skip: (socket:any, uuid:string, forward:boolean, type:number, state?:ExecuteState) => void
    /**
     * Action for execute thread:  Skip step
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread
     * @param v Jumping step number
     */
    console_skip2: (socket:any, uuid:string, v:number) => void
    /**
     * Added console execution thread
     * @param socket socket Console admin socket source
     * @param name The name of the execution thread
     * @param record Data
     * @param uuid User owner UUID
     */
    console_add: (socket:any, name:string, record:Record, uuid:string | undefined) => void
    /**
     * Main update cycle\
     * Called by the computed server itself
     */
    console_update: () => void
}

/**
 * **Access Control Type**\
 * Ot will have effect on permission value
 */
export enum ACLType {
    PUBLIC,
    PROTECTED,
    PRIVATE
}
/**
 * **User Type**\
 * It will have effect on permission value
 */
export enum UserType {
    ROOT,
    ADMIN,
    GUEST,
    USER
}

export enum PermissionType {
    ROOT,
    PROJECT,
    Task,
    JOB,
    DATABASE,
    PLUGIN,
    NODE,
    LIB,
    LOG,
}

/**
 * **Websocket Data Format: Login**
 */
export interface Login {
    username: string
    password: string
}

export interface GlobalPermission {
    project: LocalPermission
    task: LocalPermission
    job: LocalPermission
    database: LocalPermission

    plugin: LocalPermission
    service: LocalPermission
    node: LocalPermission
    lib: LocalPermission
    log: LocalPermission

    execute_job: boolean
}

export interface LocalPermission {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
}

export interface LocalPermissionContainer {
    uuid: string
    permission: LocalPermission
}

export interface LocalPermissionContainer2 {
    uuid: string
    uuid2: string
    permission: LocalPermission
}

/**
 * The data structure store in the DATA_Folder
 */
export interface UserProfile extends DataHeader, Shareable {
    token: string
    name: string
    email?: string
    preference: Preference
    type: UserType
    description?: string
    password?: string
    global_permission: GlobalPermission
}

/**
 * Client use profile data sended by server
 */
export interface UserProfileClient {
    picture_url: boolean
    name: string
    type: UserType
    description?: string
    permission?: GlobalPermission
}

export interface ServerSetting {
    open_guest: boolean
}

export const CreateRootLocalPermission = ():LocalPermission => {
    return {
        view: true,
        create: true,
        edit: true,
        delete: true,
    }
}

export const CreateRootPermission = ():GlobalPermission => {
    const perl:LocalPermission = {
        view: true,
        create: true,
        edit: true,
        delete: true,
    }
    const per:GlobalPermission = {
        project: perl,
        task: perl,
        job: perl,
        plugin: perl,
        service: perl,
        node: perl,
        database: perl,
        lib: perl,
        log: perl,
        execute_job: true
    }
    return per
}

export const CreateRootUser = ():UserProfile => {
    return {
        uuid: uuidv6(),
        token: uuidv6(),
        type: UserType.ROOT,
        preference: {
            lan: 'en',
            log: true,
            font: 18,
            theme: "dark",
            notification: false,
            plugin_token: [],
            animation: true,
        },
        name: "root",
        description: "Root User",
        global_permission: CreateRootPermission()
    }
}