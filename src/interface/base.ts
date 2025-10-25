// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Defined the basic compute use data structure
 */
import { DataType, DataTypeBase, JobType, JobType2 } from "./enum"
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
 * **Task Property**\
 * Use to in local task region field\
 * Reference in the job execute context
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
    /**
     * **Order**\
     * Define the order in the list\
     * This value is use in the client-side only\
     * Database will store in the array.
     */
    index?:number
    /**
     * **Job ID**\
     * Contains 36 characters
     */
    uuid: string
    /**
     * **Execute Runtime ID**\
     * This getting generate during the execute stage\
     * Because their can be multiple node run in a same job\
     * Or two execute project at the same time\
     * In order to know which one feedback which execute thread\
     * This value is needs to distinguish
     */
    runtime_uuid?: string
    /**
     * **ENUM: The Job Category Type**\
     * Could be "Condition" or "Execution"\
     * Condition is the checker job, After finish it will feedback a result back to server-side\
     * Execution will not feedback anything other then success or failed
     */
    category: number
    /**
     * **ENUM: The Job SubType**\
     * Base on the {@link Job.category} value\
     * This could be {@link JobType} or {@link JobType2}
     */
    type: number
    /**
     * **Javascript String**\
     * Code context when {@link Job.type} is Javascript\
     * The client-side will create a javascript vm and execute it
     */
    script: string
    /**
     * **String Arguments**\
     * In order to execute job, some type of job will require arguments
     */
    string_args: Array<string>
    /**
     * **Number Arguments**\
     * In order to execute job, some type of job will require arguments
     */
    number_args: Array<number>
    /**
     * **Boolean Arguments**\
     * In order to execute job, some type of job will require arguments
     */
    boolean_args: Array<boolean>
    /**
     * **Local Permission**\
     * Client-side only permission field\
     * Server will check user token and defined its permission level\
     * And modify this field and send back to user\
     */
    permission?: LocalPermission
}
/**
 * **Task Container**\
 * Specified different stage of the compute process
 */
export interface Task {
    /**
     * **Task ID**\
     * Contains 36 characters
     */
    uuid: string
    /**
     * **Task Name**\
     * The name of the task
     */
    title: string
    /**
     * **Task Description**\
     * The description of the task
     */
    description: string
    /**
     * **FLAG: SetupJob**\
     * Every node will run through all jobs once
     */
    setupjob: boolean
    /**
     * **FLAG: CronJob**\
     * Generate X amounts of subtask\
     * Then tells nodes to run through all of them\
     * Who finish subtask first will get next subtask\
     * Untill all subtasks finish
     */
    cronjob: boolean
    /**
     * **Cron Reference Key**\
     * Reference a parameter number in database
     */
    cronjobKey: string
    /**
     * **FLAG: MultiJob**\
     * Define how many thread can be generate in one node\
     * If this is false, default will be 1
     */
    multi: boolean
    /**
     * **Multi Reference Key**\
     * Reference a parameter number in database
     */
    multiKey: string
    /**
     * **Task Properties**\
     * You could use properties to defined local region field
     * And reference in the job execute context\
     * **NOTICE: Order Matter**\
     * The properties will generate base on the order in the list
     */
    properties: Array<Property>
    /**
     * **Jobs Context**\
     * A list of jobs, define the context of the task\
     * Base on the flags, task can run it in a different way
     */
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