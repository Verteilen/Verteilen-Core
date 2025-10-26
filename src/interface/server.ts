// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Express server related data structure
 */
import { Preference } from "./record"
import { v6 as uuidv6 } from 'uuid'

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
export interface UserProfile {
    uuid: string
    token: string
    name: string
    email?: string
    preference: Preference
    type: UserType
    description?: string
    password?: string
    permission: GlobalPermission
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
        permission: CreateRootPermission()
    }
}