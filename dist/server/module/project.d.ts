import { Job, Project, Task } from "../../interface";
import { MemoryData, RecordLoader } from "../io";
import { Server } from "../server";
export declare class Project_Module {
    server: Server;
    constructor(memory: Server);
    get memory(): MemoryData;
    get loader(): RecordLoader;
    ProjectJobCount(uuid: string): Promise<number>;
    ReOrderProjectTask(uuid: string, uuids: Array<string>): Promise<void>;
    PopulateProject(uuid: string): Promise<Project | undefined>;
    PopulateTask(uuid: string): Promise<Task | undefined>;
    GetProjectRelatedTask(uuid: string): Promise<Array<Task>>;
    GetTaskRelatedJob(uuid: string): Promise<Array<Job>>;
    CloneProjects(uuids: Array<string>): Promise<Array<string>>;
    CloneTasks(uuids: Array<string>): Promise<Array<string>>;
    CloneJobs(uuids: Array<string>): Promise<Array<string>>;
    CascadeDeleteProject(uuid: string, bind: boolean): Promise<void>;
    CascadeDeleteTask(uuid: string): Promise<void>;
    CascadeDeleteJob(uuid: string): Promise<void>;
    Delete_Database_Idle(uuid: string): Promise<void>;
}
