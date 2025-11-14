import { DataHeader, Shareable } from "./base";
import { Preference } from "./record";
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
