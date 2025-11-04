// ========================
//                           
//      Share Codebase     
//                           
// ========================
/**
 * Defined the basic compute use data structure
 */
import { DataType, DataTypeBase, JobCategory, JobType, JobType2, ServiceMode } from "./enum"
import { ACLType, LocalPermission as LocalPermission } from "./server"
import { TaskLogic } from "./struct"
import { v6 as uuidv6 } from 'uuid'

export interface DatabaseConfigTrigger {
    types: Array<DataTypeBase>
}
/**
 * Storable Data Header
 */
export interface DataHeader {
    /**
     * **ID**\
     * Contains 36 characters
     */
    uuid: string
}

export interface DataTime {
    createDate?: string
    updateDate?: string
}

/**
 * **Database Context**\
 */
export interface DatabaseContainer {
    name: string
    meta?: any
    config?: DatabaseConfigTrigger
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
/**
 * **Background Service Container**
 */
export interface Service extends DataHeader, DataTime {
    /**
     * **Service Name**\
     * The name of the task
     */
    title: string
    /**
     * **Service Description**\
     * The description of the task
     */
    description: string
    /**
     * **Extra Data**
     */
    meta: any
    /**
     * **Service Mode**\
     * Define how does this service run
     */
    type: ServiceMode
    /**
     * **Timer**\
     * The format is like github schedule\
     * minute, hour, day, month, week\
     * Reference: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
     * @example
     * "5 * * * *" means every 5 minutes
     * 
     * @example
     * "0 0 0 1 *" means the first day of every month at midnight"
     * 
     * @example
     * "0 0 * * 0" means every Sunday at midnight
     */
    timer: string
    /**
     * **Target Project ID**\
     * What project does it run through
     */
    project: string
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
 * **Data Database Bank**\
 * Store the data which will be reference in the execute stage
 */
export interface Database extends DataHeader, DataTime {
    title: string
    canWrite: boolean
    containers: Array<DatabaseContainer>
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
 * **Compute Instruction Container**\
 * Specifed the command, which show how does user want these compute to do\
 * Contains different arguments list, which could reference to database value
 */
export interface Job extends DataHeader, DataTime {
    /**
     * **Order**\
     * Define the order in the list\
     * This value is use in the client-side only\
     * Database will store in the array.
     */
    index?:number
    title: string
    description: string
    /**
     * **Extra data**\
     * The extra metadata, just in case
     */
    meta?:any
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
     * **ID Arguments**\
     * In order to execute job, some type of job will require arguments
     */
    id_args: Array<boolean>
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
 * **Task Base Container**\
 * For different view to submit task update data
 */
export interface TaskBase {
    /**
     * **Task Properties**\
     * You could use properties to defined local region field
     * And reference in the job execute context\
     * **NOTICE: Order Matter**\
     * The properties will generate base on the order in the list
     */
    properties: Array<Property>
    /**
     * **Task Logic**\
     * Describe the logic flow of the task
     */
    logic?: TaskLogic
    /**
     * **Execute Jobs Context**\
     * A list of jobs, define the context of the task\
     * Base on the flags, task can run it in a different way
     */
    jobs: Array<Job>
    /**
     * **Jobs ID**\
     * Store in disk
     */
    jobs_uuid: Array<string>
}
/**
 * **Task Header Container**\
 * For different view to submit task update data
 */
export interface TaskOption {
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
     * Reference a database number in database
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
     * Reference a database number in database
     */
    multiKey: string
}
/**
 * **Task Container**\
 * Specified different stage of the compute process
 */
export interface Task extends DataHeader, DataTime, TaskBase, TaskOption {
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
 * **Compute Structure Container**\
 * It has reference to database And contains multiple task\
 * We grab this container structure to execute queue to execute one by one
 */
export interface Project extends DataHeader, DataTime {
    /**
     * **User ID**\
     * Who own this project\
     * It will specified public if this field is undefined\
     * This will getting detect before {@link Project.acl}
     */
    owner?: string
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
     * **Database ID**\
     * In order reference to database database
     */
    database_uuid: string
    /**
     * **Database instance**\
     * The data field of database
     */
    database?: Database
    /**
     * **Execute Tasks Context**\
     * The context of this project\
     * Store all the tasks and jobs in here
     */
    tasks: Array<Task>
    /**
     * **Tasks ID**\
     * Store in disk
     */
    tasks_uuid: Array<string>
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
export interface Node extends DataHeader, DataTime {
    /**
     * **Cluster Mode**\
     * Check if the node is cluster\
     * This mean it does not have compute ability
     */
    cluster: boolean
    /**
     * **The parent cluster**
     * The node parent url
     */
    parent?: string
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


export const CreateDefaultProject = () : Project => {
    return {
        uuid: uuidv6(),
        title: "",
        description: "",
        tasks: [],
        tasks_uuid: [],
        database_uuid: ""
    }
}

export const CreateDefaultTask = () : Task => {
    return {
        uuid: uuidv6(),
        title: "Default",
        description: "",
        setupjob: false,
        cronjob: false,
        cronjobKey: "",
        multi: false,
        multiKey: "",
        properties: [],
        jobs: [],
        jobs_uuid: [],
    }
}

export const CreateDefaultJob = () : Job => {
    return {
        uuid: uuidv6(),
        title: "",
        description: "",
        category: JobCategory.Execution,
        type: JobType.JAVASCRIPT,
        script: "",
        string_args: [],
        number_args: [],
        boolean_args: [],
        id_args: [],
    }
}

export const CreateDefaultDatabase = () : Database => {
    return {
        uuid: uuidv6(),
        title: "",
        canWrite: true,
        containers: [],
    }
}