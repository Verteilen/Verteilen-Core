import { Socket } from "socket.io";
import { Project, Task } from "../../interface";
import { MemoryData, RecordLoader } from "../io";
import { ServerBase } from "../server";
export declare class Project_Module {
    server: ServerBase;
    constructor(memory: ServerBase);
    get memory(): MemoryData;
    get loader(): RecordLoader;
    ProjectJobCount(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
    ReOrderProjectTask(socket: Socket | undefined, uuid: string, uuids: Array<string>, token?: string | undefined): Promise<void>;
    PopulateProject(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
    /**
     * Assign real data to instance
     * @param uuid Project UUID
     */
    _PopulateProject(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<Project | undefined>;
    PopulateTask(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
    /**
     * Assign real data to instance
     * @param uuid Task UUID
     */
    _PopulateTask(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<Task | undefined>;
    /**
     * Get tasks from project related
     * @param uuid Project UUID
     * @returns Related Tasks
     */
    GetProjectRelatedTask(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
    /**
     * Get jobs from task related
     * @param uuid Task UUID
     * @returns Related Jobs
     */
    GetTaskRelatedJob(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
    CloneProjects(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<void>;
    /**
     * Clone Project Container
     * @param uuids project uuids
     * @returns The new uuids list
     */
    _CloneProjects(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    CloneTasks(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<void>;
    /**
     * Clone Task Container
     * @param uuids task uuids
     * @returns The new uuids list
     */
    _CloneTasks(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    CloneJobs(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<void>;
    /**
     * Clone Job Container
     * @param uuids job uuids
     * @returns The new uuids list
     */
    _CloneJobs(socket: Socket | undefined, uuids: Array<string>, token?: string | undefined): Promise<Array<string>>;
    /**
     * Delete project related data and project itself
     * @param uuid Project UUID
     */
    CascadeDeleteProject(socket: Socket | undefined, uuid: string, bind: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteTask(socket: Socket | undefined, uuid: string, project_change?: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete Task related data and project itself
     * @param uuid Task UUID
     */
    CascadeDeleteJob(socket: Socket | undefined, uuid: string, task_change?: boolean, token?: string | undefined): Promise<void>;
    /**
     * Delete idle database
     * @param uuid Database UUID
     */
    Delete_Database_Idle(socket: Socket | undefined, uuid: string, token?: string | undefined): Promise<void>;
}
