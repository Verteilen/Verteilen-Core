// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * All kinds of data structure
 * It's a mess, i know
 */
import { Job } from "./base"
import ws from 'ws'
import { ServiceMode, TaskLogicType } from "./enum"
import { Plugin } from "./plugin"

/**
 * The websocket instance with extra information
 */
export interface WebsocketPack {
    s?:boolean
    uuid: string
    parent?: string
    /**
     * The instance of websocket
     */
    websocket: WebSocket | ws.WebSocket
    /**
     * Current execute job uuid list
     */
    current_job: Array<string>
    /**
     * Show operation system information
     */
    information?: SystemLoad
    /**
     * Show workload data
     */
    load?: NodeLoad
    /**
     * Ping delay time\
     * Use this for display the ping
     */
    ms?: number
    /**
     * Ping delay time last
     */
    last?: number
    /**
     * Plugins installed list
     */
    plugins?: Array<Plugin>
    /**
     * Cluster node possibility
     */
    children?: Array<WebsocketPack>
}

/**
 * The data transfer packet header
 */
export interface Header {
    /**
     * Header name, it will match the function dict in both server and client side
     */
    name: string
    /**
     * **Where Data Go**\
     * The path to go\
     * You might go to cluster and send to node children\
     * This data specified the IP path\
     * If undefined, it means it's destinations
     * @example Use Space to seperate
     * "192.168.10.1:50 192.168.10.7:8052"
     */
    destinations?: string
    /**
     * **Token Session**\
     * Some request require token to access
     */
    token?: string
    /**
     * **Extra Metadata**
     */
    meta?: string
    /**
     * **Print Message**
     */
    message?: string
    /**
     * **Resource channel**
     */
    channel?:string
    /**
     * **TData Content**\
     * The content of the websocket package\
     * Put everything you want to send in here
     */
    data?: any
}

/**
 * **Data Format: Single Data**
 */
export interface Single {
    data: any
}

/**
 * **Data Format: Path Data**
 */
export interface OnePath {
    path: string
}

/**
 * **Data Format: Arrow Path**
 */
export interface TwoPath {
    from: string
    to: string
}

/**
 * **Data Format: Map Setter**
 */
export interface Setter {
    key: string
    value: any
}

/**
 * **Data Format: Feedback**
 */
export interface FeedBack {
    node_uuid?: string
    index?: number
    job_uuid: string
    runtime_uuid: string
    meta: number
    message: string
}

/**
 * **Data Format: KeyValue**
 */
export interface KeyValue {
    key: any
    value: any
}

/**
 * **Data Format: JWT Info**
 */
export interface JWT {
    user: string
    create: number
    expire: number
}

export interface SystemLoad_GPU {
    gpu_name: string
}

export interface SystemLoad_Network {
    net_name: string
    upload: number
    download: number
}

export interface SystemLoad_Disk {
    disk_name: string
    disk_type: string
    disk_usage: number
    disk_free: number
    disk_total: number
    disk_percentage: number
}

/**
 * The resources usage 
 */
export interface SystemLoad {
    system_name: string
    virtual: boolean
    platform: string
    arch: string
    hostname: string

    cpu_name: string
    cpu_core: number
    cpu_usage: number

    ram_usage: number
    ram_free: number
    ram_total: number

    battery: number
    charging: boolean

    gpu: Array<SystemLoad_GPU>
    disk: Array<SystemLoad_Disk>
    net: Array<SystemLoad_Network>

    pid_usage: number
}

/**
 * The application usage 
 */
export interface NodeLoad {
    /**
     * How many worker has been running right now
     */
    workers: number
}

/**
 * The shell display folder structure
 */
export interface ShellFolder {
    /**
     * Current path, If null then it will use cwd instead
     */
    path: string
    /**
     * The process.cwd path
     */
    cwd: string
    /**
     * Files list in the path
     */
    files: Array<string>
    /**
     * Folders list in the path
     */
    folders: Array<string>
}


export interface BuildinAssetsContent {
    name: string
    description: string
    url: string
}

export interface BuildinAssets {
    data: Array<BuildinAssetsContent>
}

export interface ServiceConfig {
    mode: ServiceMode
}

export interface TaskLogicUnit {
    type: TaskLogicType
    /**
     * **Attach Job ID**
     */
    job_uuid?: string
    /**
     * **Attach Job Container (Runtime)**
     */
    job?: Job
    /**
     * **Common Logic Group**
     */
    children: Array<TaskLogicUnit>
}

/**
 * **Job Logic Container**\
 * The strategy pattern for a single subtask to use\
 * For example:
 * - Group
 *   - Condition
 *     - Add
 *       - Or
 *         - Single
 *         - Single
 *       - Or
 *         - Single
 *         - Single
 *   - Execution (True)
 *     - Single
 *     - Single
 *   - Execution (False)
 *     - Single
 *     - Single
 */
export interface TaskLogic {
    group: Array<TaskLogicUnit>
}