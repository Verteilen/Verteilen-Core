import { Job, Project, Task } from "../../interface";
import { MemoryData, RecordLoader } from "../io";
import { ServerBase } from "../server";
export declare class Project_Module {
    server: ServerBase;
    constructor(memory: ServerBase);
    get memory(): MemoryData;
    get loader(): RecordLoader;
    ProjectJobCount(uuid: string, token?: string | undefined): Promise<number>;
    ReOrderProjectTask(uuid: string, uuids: Array<string>, token?: string | undefined): Promise<void>;
    /**
     * Assign real data to instance
     * @param uuid Project UUID
     */
    PopulateProject(uuid: string, token?: string | undefined): Promise<Project | undefined>;
    /**
     * Assign real data to instance
     * @param uuid Task UUID
     */
    PopulateTask(uuid: string, token?: string | undefined): Promise<Task | undefined>;
    /**
     * Get tasks from project related
     * @param uuid Project UUID
     * @returns Related Tasks
     */
    GetProjectRelatedTask(uuid: string, token?: string | undefined): Promise<Array<Task>>;
    /**
     * Get jobs from task related
     * @param uuid Task UUID
     * @returns Related Jobs
     */
    GetTaskRelatedJob(uuid: string, token?: string | undefined): Promise<Array<Job>>;
    /**
     * Clone Project Container
     * @param uuids project uuids
     * @returns The new uuids list
     */
    CloneProjects(uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    /**
     * Clone Task Container
     * @param uuids task uuids
     * @returns The new uuids list
     */
    CloneTasks(uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    /**
     * Clone Job Container
     * @param uuids job uuids
     * @returns The new uuids list
     */
    CloneJobs(uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    /**
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    CascadeDeleteProject(uuid: string, bind: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteTask(uuid: string, project_change?: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteJob(uuid: string, task_change?: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete idle database
     * @param uuid Database UUID
     */
    Delete_Database_Idle(uuid: string, token?: string | undefined): Promise<void>;
}
