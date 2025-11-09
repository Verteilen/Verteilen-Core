import { DataType, DataTypeBase, ServiceMode } from "./enum";
import { ACLType, LocalPermission as LocalPermission } from "./server";
import { TaskLogic } from "./struct";
export interface DatabaseConfigTrigger {
    types: Array<DataTypeBase>;
}
export interface DataHeader {
    uuid: string;
}
export interface ShareLevel {
    user: string;
    permission: LocalPermission;
}
export interface Shareable {
    owner?: string;
    permission?: LocalPermission;
    acl?: ACLType;
    shared?: Array<ShareLevel>;
}
export interface DataTime {
    createDate?: string;
    updateDate?: string;
}
export interface DatabaseContainer {
    name: string;
    meta?: any;
    config?: DatabaseConfigTrigger;
    type: DataType;
    hidden: boolean;
    runtimeOnly: boolean;
    value: any;
}
export interface Property {
    name: string;
    expression: string;
    deep?: number;
}
export interface Service extends DataHeader, DataTime {
    title: string;
    description: string;
    meta: any;
    type: ServiceMode;
    timer: string;
    project: string;
}
export interface Database extends DataHeader, DataTime, Shareable {
    title: string;
    canWrite: boolean;
    containers: Array<DatabaseContainer>;
}
export interface Job extends DataHeader, DataTime, Shareable {
    index?: number;
    title: string;
    description: string;
    meta?: any;
    runtime_uuid?: string;
    category: number;
    type: number;
    script: string;
    string_args: Array<string>;
    number_args: Array<number>;
    boolean_args: Array<boolean>;
    id_args: Array<boolean>;
}
export interface TaskBase {
    properties: Array<Property>;
    logic?: TaskLogic;
    jobs: Array<Job>;
    jobs_uuid: Array<string>;
}
export interface TaskOption {
    title: string;
    description: string;
    setupjob: boolean;
    cronjob: boolean;
    cronjobKey: string;
    multi: boolean;
    multiKey: string;
}
export interface Task extends DataHeader, DataTime, TaskBase, TaskOption, Shareable {
}
export interface Project extends DataHeader, DataTime, Shareable {
    title: string;
    description?: string;
    database_uuid: string;
    database?: Database;
    tasks: Array<Task>;
    tasks_uuid: Array<string>;
}
export interface Node extends DataHeader, DataTime, Shareable {
    cluster: boolean;
    parent?: string;
    url: string;
}
export declare const CreateDefaultProject: () => Project;
export declare const CreateDefaultTask: () => Task;
export declare const CreateDefaultJob: () => Job;
export declare const CreateDefaultDatabase: () => Database;
