import { Node, Database, Project, Task } from './base';
import { Plugin, SystemLoad } from './struct';
export interface DatabaseTable extends Database {
    s: boolean;
}
export interface NodeTable extends Node {
    s: boolean;
    state: number;
    connection_rate?: number;
    plugins?: Array<Plugin>;
    system?: SystemLoad;
}
export interface TaskTable extends Task {
    s: boolean;
    jobCount: number;
}
export interface ProjectTable extends Project {
    s: boolean;
    taskCount: number;
}
