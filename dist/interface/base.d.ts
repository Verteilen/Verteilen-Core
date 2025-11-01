import { DataType, DataTypeBase, ServiceMode } from "./enum";
import { ACLType, LocalPermission as LocalPermission } from "./server";
import { TaskLogic } from "./struct";
export interface DatabaseConfigTrigger {
    types: Array<DataTypeBase>;
}
export interface DataHeader {
    uuid: string;
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
export interface Service extends DataHeader {
    title: string;
    description: string;
    meta: any;
    type: ServiceMode;
    timer: string;
    project: string;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface Database extends DataHeader {
    title: string;
    canWrite: boolean;
    containers: Array<DatabaseContainer>;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface Job extends DataHeader {
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
    permission?: LocalPermission;
    acl?: ACLType;
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
export interface Task extends DataHeader, TaskBase, TaskOption {
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface Project extends DataHeader {
    owner?: string;
    title: string;
    description?: string;
    database_uuid: string;
    database?: Database;
    tasks: Array<Task>;
    tasks_uuid: Array<string>;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface Node extends DataHeader {
    cluster: boolean;
    parent?: string;
    url: string;
    permission?: LocalPermission;
    acl?: ACLType;
}
export declare const CreateDefaultProject: () => Project;
export declare const CreateDefaultTask: () => Task;
export declare const CreateDefaultJob: () => Job;
