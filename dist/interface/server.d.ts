import { MemoryData } from "../server";
import { DataHeader, Shareable } from "./base";
import { ExecuteState } from "./enum";
import { ExecuteRecord, Record } from "./log";
import { Preference } from "./record";
export interface BackendAction {
    memory: MemoryData;
    GetPreference: (uuid?: string) => Preference;
    Broadcasting?: (name: string, data: any) => void;
}
export interface ServerDetailEvent {
    resource_start: (socket: any, uuid: string) => void;
    resource_end: (socket: any, uuid: string) => void;
    plugin_info: (socket: any, uuid: string) => void;
    shell_enter: (socket: any, uuid: string, value: string) => void;
    shell_open: (socket: any, uuid: string) => void;
    shell_close: (socket: any, uuid: string) => void;
    shell_folder: (socket: any, uuid: string, path: string) => void;
    node_list: (socket: any) => void;
    node_add: (socket: any, url: string, uuid: string) => void;
    node_update: (socket: any) => void;
    node_delete: (socket: any, uuid: string, reason?: string) => void;
    console_list: (socket: any) => Array<ExecuteRecord> | undefined;
    console_record: (socket: any, uuid: string) => void;
    console_execute: (socket: any, uuid: string, type: number) => void;
    console_stop: (socket: any, uuid: string) => void;
    console_clean: (socket: any, uuid: string) => void;
    console_skip: (socket: any, uuid: string, forward: boolean, type: number, state?: ExecuteState) => void;
    console_skip2: (socket: any, uuid: string, v: number) => void;
    console_add: (socket: any, name: string, record: Record, uuid: string | undefined) => void;
    console_update: () => void;
}
export declare enum ACLType {
    PUBLIC = 0,
    PROTECTED = 1,
    PRIVATE = 2
}
export declare enum UserType {
    ROOT = 0,
    ADMIN = 1,
    GUEST = 2,
    USER = 3
}
export declare enum PermissionType {
    ROOT = 0,
    PROJECT = 1,
    Task = 2,
    JOB = 3,
    DATABASE = 4,
    PLUGIN = 5,
    NODE = 6,
    LIB = 7,
    LOG = 8
}
export interface Login {
    username: string;
    password: string;
}
export interface GlobalPermission {
    project: LocalPermission;
    task: LocalPermission;
    job: LocalPermission;
    database: LocalPermission;
    plugin: LocalPermission;
    service: LocalPermission;
    node: LocalPermission;
    lib: LocalPermission;
    log: LocalPermission;
    execute_job: boolean;
}
export interface LocalPermission {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}
export interface LocalPermissionContainer {
    uuid: string;
    permission: LocalPermission;
}
export interface LocalPermissionContainer2 {
    uuid: string;
    uuid2: string;
    permission: LocalPermission;
}
export interface UserProfile extends DataHeader, Shareable {
    token: string;
    name: string;
    email?: string;
    preference: Preference;
    type: UserType;
    description?: string;
    password?: string;
    global_permission: GlobalPermission;
}
export interface UserProfileClient {
    picture_url: boolean;
    name: string;
    type: UserType;
    description?: string;
    permission?: GlobalPermission;
}
export interface ServerSetting {
    open_guest: boolean;
}
export declare const CreateRootLocalPermission: () => LocalPermission;
export declare const CreateRootPermission: () => GlobalPermission;
export declare const CreateRootUser: () => UserProfile;
