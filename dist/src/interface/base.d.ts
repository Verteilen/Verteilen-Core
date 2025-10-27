import { DataType, DataTypeBase } from "./enum";
import { ACLType, LocalPermission as LocalPermission } from "./server";
export interface DatabaseConfigTrigger {
    types: Array<DataTypeBase>;
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
export interface Database {
    uuid: string;
    title: string;
    canWrite: boolean;
    containers: Array<DatabaseContainer>;
    permission?: LocalPermission;
}
export interface Job {
    index?: number;
    uuid: string;
    runtime_uuid?: string;
    category: number;
    type: number;
    script: string;
    string_args: Array<string>;
    number_args: Array<number>;
    boolean_args: Array<boolean>;
    id_args: Array<boolean>;
    permission?: LocalPermission;
}
export interface Task {
    uuid: string;
    title: string;
    description: string;
    setupjob: boolean;
    cronjob: boolean;
    cronjobKey: string;
    multi: boolean;
    multiKey: string;
    properties: Array<Property>;
    jobs: Array<Job>;
    permission?: LocalPermission;
}
export interface Project {
    owner?: string;
    uuid: string;
    title: string;
    description?: string;
    database_uuid: string;
    database?: Database;
    task: Array<Task>;
    permission?: LocalPermission;
    acl?: ACLType;
}
export interface Node {
    uuid: string;
    parent?: string;
    url: string;
    permission?: LocalPermission;
    acl?: ACLType;
}
