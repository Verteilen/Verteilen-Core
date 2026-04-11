/**
 * Express server related data structure
 */
import { Database, DataHeader, Job, Node, Project, Shareable, Task } from "./base";
import { ExecuteState } from "./enum";
import { ExecuteRecord, ExecutionLog, Record } from "./log";
import { Library, Preference } from "./record";
export declare enum AuthType {
    SELF = 0,
    EXTERNAL = 1,
    SERVICE = 2
}
export declare enum AuthDB {
    SQLITE3 = 0,
    MONGODB = 1
}
export declare enum AuthService {
    FIREBASE = 0,
    AUTH0 = 1,
    CLERK = 2,
    SUPABASE = 3
}
export declare enum ContentType {
    LOCAL = 0,
    EXTERNAL = 1,
    SERVICE = 2
}
export declare enum ContentDB {
    FTP = 0,
    MONGODB = 1
}
export declare enum ContentService {
    MONGODB = 0,
    DYNAMODB = 1,
    COSMOS = 2,
    BIGTABLE = 3
}
/**
 * **Record Data**
 */
export interface MemoryData {
    projects: Array<Project>;
    tasks: Array<Task>;
    jobs: Array<Job>;
    database: Array<Database>;
    nodes: Array<Node>;
    logs: Array<ExecutionLog>;
    libs: Array<Library>;
    user: Array<UserProfile>;
}
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
    memory: MemoryData;
    /**
     * The getter for the preference
     * @param uuid User UUID
     * @returns Preference instance
     */
    GetPreference: (uuid?: string) => Preference;
    /**
     * Boradcasting to all console admin\
     * This will form a package to send to all console members
     * @param name Key
     * @param data Data
     */
    Broadcasting?: (name: string, data: any) => void;
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
    resource_start: (socket: any, uuid: string) => void;
    /**
     * Tell client to stop given resource info to computed server
     * @param socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    resource_end: (socket: any, uuid: string) => void;
    /**
     * Let client send a plugin feedback to computed server
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    plugin_info: (socket: any, uuid: string) => void;
    /**
     * Handle shell input value
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     * @param value String value
     * @returns
     */
    shell_enter: (socket: any, uuid: string, value: string) => void;
    /**
     * Create the shell session\
     * Computed client will create a shell object to handle computed server's shell request
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    shell_open: (socket: any, uuid: string) => void;
    /**
     * Close the shell session\
     * Computed client will destroy target shell object to handle computed server's shell request
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     */
    shell_close: (socket: any, uuid: string) => void;
    /**
     * Open different folder in shell session
     * @param socket socket Console admin socket source
     * @param uuid Computed node target UUID
     * @param path Folder path
     */
    shell_folder: (socket: any, uuid: string, path: string) => void;
    /**
     * Get List of WebsocketPack from the computed server
     * @param socket socket Console admin socket source
     */
    node_list: (socket: any) => void;
    /**
     * Trying the create new computed node connection
     * @param socket socket Console admin socket source
     * @param url Address
     * @param uuid Apply UUID
     */
    node_add: (socket: any, url: string, uuid: string) => void;
    /**
     * Update the node information
     * @param socket socket Console admin socket source
     */
    node_update: (socket: any) => void;
    /**
     * Delete computed node connection instance
     * @param socket socket Console admin socket source
     * @param uuid Target UUID
     * @param reason Disconnect reason if connection is open currently
     */
    node_delete: (socket: any, uuid: string, reason?: string) => void;
    /**
     * Get the list of execution thread
     * @param socket socket Console admin socket source
     * @returns The execution thread list
     */
    console_list: (socket: any) => Array<ExecuteRecord> | undefined;
    /**
     *
     * @param socket socket Console admin socket source
     * @param uuid
     * @returns
     */
    console_record: (socket: any, uuid: string) => void;
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
    console_execute: (socket: any, uuid: string, type: number) => void;
    /**
     * Stop command for execution thread
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread UUID
     */
    console_stop: (socket: any, uuid: string) => void;
    /**
     * Remove execution thread
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread UUID
     */
    console_clean: (socket: any, uuid: string) => void;
    /**
     * Action for execute thread: Skip project or task
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread
     * @param forward Skip To forward or backward
     * @param type 0: Project, 1: Task
     * @param state Apply the state to the previous container
     * @returns
     */
    console_skip: (socket: any, uuid: string, forward: boolean, type: number, state?: ExecuteState) => void;
    /**
     * Action for execute thread:  Skip step
     * @param socket socket Console admin socket source
     * @param uuid Target execution thread
     * @param v Jumping step number
     */
    console_skip2: (socket: any, uuid: string, v: number) => void;
    /**
     * Added console execution thread
     * @param socket socket Console admin socket source
     * @param name The name of the execution thread
     * @param record Data
     * @param uuid User owner UUID
     */
    console_add: (socket: any, name: string, record: Record, uuid: string | undefined) => void;
    /**
     * Main update cycle\
     * Called by the computed server itself
     */
    console_update: () => void;
}
/**
 * **Access Control Type**\
 * Ot will have effect on permission value
 */
export declare enum ACLType {
    PUBLIC = 0,
    PROTECTED = 1,
    PRIVATE = 2
}
/**
 * **User Type**\
 * It will have effect on permission value
 */
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
/**
 * **Websocket Data Format: Login**
 */
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
/**
 * The data structure store in the DATA_Folder
 */
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
/**
 * Client use profile data sended by server
 */
export interface UserProfileClient {
    picture_url: boolean;
    name: string;
    type: UserType;
    description?: string;
    permission?: GlobalPermission;
}
export interface ServerSetupAuth {
    auth_type: AuthType;
    auth_service: AuthService;
    auth_db: AuthDB;
    api_key?: string;
    db_url?: string;
    db_username?: string;
    db_password?: string;
}
export interface ServerSetupContent {
    content_type: ContentType;
    content_service: ContentService;
    content_db: ContentDB;
    api_key?: string;
    db_url?: string;
    db_username?: string;
    db_password?: string;
}
export interface ServerSetting {
    open_guest: boolean;
    open_register: boolean;
    auth: ServerSetupAuth;
    content: ServerSetupContent;
}
export interface ServerSetupRoot {
    root_username: string;
    root_password: string;
}
export interface ServerSetupRequire {
    setting: ServerSetting;
    root: ServerSetupRoot;
}
export declare const CreateServerSetupRequire: () => ServerSetupRequire;
export declare const CreateRootLocalPermission: () => LocalPermission;
export declare const CreateRootPermission: () => GlobalPermission;
export declare const CreateRootUser: () => UserProfile;
