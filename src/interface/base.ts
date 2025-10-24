// ========================
//                           
//      Share Codebase     
//                           
// ========================
import { DataType, DataTypeBase } from "./enum"
import { ACLType, LocalPermission as LocalPermission } from "./server"

export interface ParameterConfigTrigger {
    types: Array<DataTypeBase>
}
/**
 * **Parameter Context**\
 */
export interface ParameterContainer {
    s?: boolean
    name: string
    meta?: any
    config?: ParameterConfigTrigger
    type: DataType
    hidden: boolean
    runtimeOnly: boolean
    value: any
}
/**
 * **Task Properties**\
 * You could use properties to defined local region field\
 * And reference in the job execute context
 */
export interface Property {
    /**
     * **Property Name**\
     * The name of the property, use this string reference in other
     * property or job
     */
    name: string
    /**
     * **Property Expression**\
     * The expression library use custom language {@link https://www.npmjs.com/package/expressionparser}\
     * Follow the
     */
    expression: string
    /**
     * **Depth Level**\
     * 
     */
    deep?: number
}

export interface Parameter {
    uuid: string
    title: string
    canWrite: boolean
    containers: Array<ParameterContainer>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
}
/**
 * **Compute Instruction Container**\
 * Specifed the command, which show how does user want these compute to do\
 * Contains different arguments list, which could reference to parameter value
 */
export interface Job {
    index?:number
    uuid: string
    runtime_uuid?: string
    category: number
    type: number
    script: string
    string_args: Array<string>
    number_args: Array<number>
    boolean_args: Array<boolean>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
}
/**
 * **Task Container**\
 * Specified different stage of the compute process
 */
export interface Task {
    uuid: string
    title: string
    description: string
    setupjob: boolean
    cronjob: boolean
    cronjobKey: string
    multi: boolean
    multiKey: string
    properties: Array<Property>
    jobs: Array<Job>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
}
/**
 * **Compute Structure Container**\
 * It has reference to parameter And contains multiple task\
 * We grab this container structure to execute queue to execute one by one
 */
export interface Project {
    /**
     * **User ID**\
     * Who own this project\
     * It will specified public if this field is undefined\
     * This will getting detect before {@link Project.acl}
     */
    owner?: string
    /**
     * **Project ID**\
     * Contains 36 characters
     */
    uuid: string
    /**
     * **Project Name**\
     * The name of the project
     */
    title: string
    /**
     * **Project Description**\
     * The description of the project
     */
    description?: string
    /**
     * **Parameter ID**\
     * In order reference to parameter database
     */
    store_uuid: string
    /**
     * **Parameter instance**\
     * The data field of parameter
     */
    parameter?: Parameter
    /**
     * **Tasks**\
     * The context of this project\
     * Store all the tasks and jobs in here
     */
    task: Array<Task>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
    /**
     * **Accessibility**\
     * Could be public, protected, private
     */
    acl?: ACLType
}
/**
 * **Compute Node Structure Container**\
 * In the execute stage, it will needs nodes to compute the task\
 * Which specified in this type of structure
 */
export interface Node {
    /**
     * **ID**\
     * The UUID of the compute node
     */
    ID: string
    /**
     * **URL**\
     * The address to the compute node
     */
    url: string
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user
     */
    permission?: LocalPermission
    /**
     * **Accessibility**\
     * Could be public, protected, private
     */
    acl?: ACLType
}