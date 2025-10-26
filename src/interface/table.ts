// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Value override for some base value\
 * The data structure that use in Vue
 */
import { Node, Parameter, Project, Task } from './base'
import { Plugin, SystemLoad } from './struct'

/**
 * **UI Parameter Table Data Structure**\
 * For display the data on the parameter page
 */
export interface ParameterTable extends Parameter {
    /**
     * **Select State**
     */
    s: boolean
}
/**
 * **UI Node Table Data Structure**\
 * For display the data on the node page
 */
export interface NodeTable extends Node {
    /**
     * **Select State**
     */
    s: boolean
    state: number
    connection_rate?: number
    plugins?: Array<Plugin>
    system?: SystemLoad
}
export interface TaskTable extends Task {
    /**
     * **Select State**
     */
    s: boolean
    /**
     * **Compute Job Count**\
     * Show how many jobs the task have
     */
    jobCount: number
}
export interface ProjectTable extends Project {
    /**
     * **Select State**
     */
    s: boolean
    /**
     * **Compute Task Count**\
     * Show how many tasks the project have
     */
    taskCount: number
}