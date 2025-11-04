import { Job } from "./base";
import ws from 'ws';
import { ServiceMode, TaskLogicType } from "./enum";
import { Plugin } from "./plugin";
export interface WebsocketPack {
    s?: boolean;
    uuid: string;
    parent?: string;
    websocket: WebSocket | ws.WebSocket;
    current_job: Array<string>;
    information?: SystemLoad;
    load?: NodeLoad;
    ms?: number;
    last?: number;
    plugins?: Array<Plugin>;
    children?: Array<WebsocketPack>;
}
export interface Header {
    name: string;
    token?: string;
    meta?: string;
    message?: string;
    channel?: string;
    data?: any;
}
export interface Single {
    data: any;
}
export interface OnePath {
    path: string;
}
export interface TwoPath {
    from: string;
    to: string;
}
export interface Setter {
    key: string;
    value: any;
}
export interface FeedBack {
    node_uuid?: string;
    index?: number;
    job_uuid: string;
    runtime_uuid: string;
    meta: number;
    message: string;
}
export interface KeyValue {
    key: any;
    value: any;
}
export interface JWT {
    user: string;
    create: number;
    expire: number;
}
export interface SystemLoad_GPU {
    gpu_name: string;
}
export interface SystemLoad_Network {
    net_name: string;
    upload: number;
    download: number;
}
export interface SystemLoad_Disk {
    disk_name: string;
    disk_type: string;
    disk_usage: number;
    disk_free: number;
    disk_total: number;
    disk_percentage: number;
}
export interface SystemLoad {
    system_name: string;
    virtual: boolean;
    platform: string;
    arch: string;
    hostname: string;
    cpu_name: string;
    cpu_core: number;
    cpu_usage: number;
    ram_usage: number;
    ram_free: number;
    ram_total: number;
    battery: number;
    charging: boolean;
    gpu: Array<SystemLoad_GPU>;
    disk: Array<SystemLoad_Disk>;
    net: Array<SystemLoad_Network>;
    pid_usage: number;
}
export interface NodeLoad {
    workers: number;
}
export interface ShellFolder {
    path: string;
    cwd: string;
    files: Array<string>;
    folders: Array<string>;
}
export interface BuildinAssetsContent {
    name: string;
    description: string;
    url: string;
}
export interface BuildinAssets {
    data: Array<BuildinAssetsContent>;
}
export interface ServiceConfig {
    mode: ServiceMode;
}
export interface TaskLogicUnit {
    type: TaskLogicType;
    job_uuid?: string;
    job?: Job;
    children: Array<TaskLogicUnit>;
    children2?: Array<TaskLogicUnit>;
}
export interface TaskLogic {
    group: Array<TaskLogicUnit>;
}
